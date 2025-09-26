import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { getPrismaClient } from './prisma';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

// Configuration IMAP pour Gandi
export const GANDI_IMAP_CONFIG: EmailConfig = {
  user: process.env.EMAIL_USER || 'contact@laiaskininstitut.fr',
  password: process.env.EMAIL_PASSWORD || '', // À configurer
  host: 'mail.gandi.net',
  port: 993,
  tls: true
};

export class EmailSyncService {
  private imap: Imap | null = null;
  private config: EmailConfig;

  constructor(config?: EmailConfig) {
    this.config = config || GANDI_IMAP_CONFIG;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: this.config.user,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        tls: this.config.tls,
        tlsOptions: { rejectUnauthorized: false }
      });

      this.imap.once('ready', () => {
        console.log('Connexion IMAP établie avec Gandi');
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        console.error('Erreur IMAP:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async syncEmails(days: number = 7): Promise<void> {
    if (!this.imap) {
      throw new Error('Non connecté à IMAP');
    }

    const prisma = await getPrismaClient();

    return new Promise((resolve, reject) => {
      this.imap!.openBox('INBOX', false, async (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Récupérer les emails des X derniers jours
        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceStr = since.toISOString().split('T')[0];

        this.imap!.search(['ALL', ['SINCE', sinceStr]], async (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log('Aucun nouvel email à synchroniser');
            resolve();
            return;
          }

          console.log(`${results.length} emails à synchroniser`);

          const fetch = this.imap!.fetch(results, {
            bodies: '',
            struct: true
          });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Erreur parsing email:', err);
                  return;
                }

                try {
                  // Déterminer la direction
                  const fromAddress = parsed.from?.value[0]?.address || '';
                  const toAddresses = parsed.to ? 
                    (Array.isArray(parsed.to) ? parsed.to : parsed.to.value)
                      .map((addr: any) => addr.address || addr).join(', ') : '';
                  
                  const isIncoming = !fromAddress.includes('laiaskininstitut.fr');
                  
                  // Vérifier si l'email existe déjà
                  const existingEmail = await prisma.emailHistory.findFirst({
                    where: {
                      from: fromAddress,
                      subject: parsed.subject || '',
                      createdAt: {
                        gte: new Date(parsed.date || new Date().getTime() - 60000),
                        lte: new Date(parsed.date || new Date().getTime() + 60000)
                      }
                    }
                  });

                  if (!existingEmail) {
                    // Enregistrer l'email
                    await prisma.emailHistory.create({
                      data: {
                        from: fromAddress,
                        to: toAddresses,
                        subject: parsed.subject || 'Sans objet',
                        content: parsed.html || parsed.text || '',
                        direction: isIncoming ? 'incoming' : 'outgoing',
                        status: 'received',
                        createdAt: parsed.date || new Date(),
                        messageId: parsed.messageId
                      }
                    });

                    console.log(`Email synchronisé: ${parsed.subject}`);
                  }
                } catch (error) {
                  console.error('Erreur enregistrement email:', error);
                }
              });
            });
          });

          fetch.once('end', () => {
            console.log('Synchronisation terminée');
            resolve();
          });

          fetch.once('error', (err) => {
            console.error('Erreur fetch:', err);
            reject(err);
          });
        });
      });
    });
  }

  disconnect(): void {
    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }
  }

  // Fonction pour écouter les nouveaux emails en temps réel
  async watchInbox(callback: (email: any) => void): Promise<void> {
    if (!this.imap) {
      throw new Error('Non connecté à IMAP');
    }

    return new Promise((resolve, reject) => {
      this.imap!.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        this.imap!.on('mail', (numNewMail) => {
          console.log(`${numNewMail} nouveaux emails reçus`);
          
          // Récupérer les nouveaux emails
          const fetch = this.imap!.fetch(`${box.messages.total - numNewMail + 1}:*`, {
            bodies: '',
            struct: true
          });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (!err && parsed) {
                  callback(parsed);
                }
              });
            });
          });
        });

        console.log('Surveillance de la boîte de réception activée');
        resolve();
      });
    });
  }
}

// Fonction pour synchroniser périodiquement
export async function startEmailSync(intervalMinutes: number = 5): Promise<void> {
  const sync = new EmailSyncService();
  
  const performSync = async () => {
    try {
      console.log('Début de la synchronisation des emails...');
      await sync.connect();
      await sync.syncEmails(30); // Synchroniser les 30 derniers jours
      sync.disconnect();
      console.log('Synchronisation terminée');
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  };

  // Synchronisation initiale
  await performSync();

  // Synchronisation périodique
  setInterval(performSync, intervalMinutes * 60 * 1000);
}