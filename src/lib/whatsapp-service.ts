import twilio from 'twilio';
import { getPrismaClient } from './prisma';

// Configuration Twilio WhatsApp
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox par défaut

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface WhatsAppMessage {
  id?: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string[];
  status?: string;
  direction: 'incoming' | 'outgoing';
  timestamp: Date;
  clientId?: string;
  clientName?: string;
  read?: boolean;
}

export class WhatsAppService {
  /**
   * Envoyer un message WhatsApp
   */
  static async sendMessage(to: string, message: string, mediaUrl?: string[]): Promise<any> {
    if (!client) {
      throw new Error('WhatsApp non configuré. Ajoutez TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN');
    }

    try {
      // Formater le numéro (ajouter whatsapp: si nécessaire)
      const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const messageOptions: any = {
        from: whatsappNumber,
        to: toNumber,
        body: message
      };

      if (mediaUrl && mediaUrl.length > 0) {
        messageOptions.mediaUrl = mediaUrl;
      }

      // Envoyer via Twilio
      const result = await client.messages.create(messageOptions);

      // Enregistrer dans la base de données
      const prisma = await getPrismaClient();
      await prisma.whatsAppHistory.create({
        data: {
          from: whatsappNumber.replace('whatsapp:', ''),
          to: to.replace('whatsapp:', ''),
          message: message,
          status: 'sent',
          direction: 'outgoing',
          mediaUrl: mediaUrl ? (Array.isArray(mediaUrl) ? mediaUrl[0] : mediaUrl) : null
        }
      });

      return result;
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des messages WhatsApp
   */
  static async getConversation(phoneNumber: string): Promise<WhatsAppMessage[]> {
    try {
      const prisma = await getPrismaClient();
      
      // Normaliser le numéro
      const normalizedNumber = phoneNumber.replace('whatsapp:', '').replace(/\D/g, '');
      
      const messages = await prisma.whatsAppHistory.findMany({
        where: {
          OR: [
            { from: { contains: normalizedNumber } },
            { to: { contains: normalizedNumber } }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });

      return messages.map(msg => ({
        id: msg.id,
        from: msg.from,
        to: msg.to,
        body: msg.message,
        mediaUrl: msg.mediaUrl ? [msg.mediaUrl] : undefined,
        status: msg.status,
        direction: msg.direction as 'incoming' | 'outgoing',
        timestamp: msg.createdAt,
        read: msg.readAt !== null
      }));
    } catch (error) {
      console.error('Erreur récupération conversation WhatsApp:', error);
      return [];
    }
  }

  /**
   * Synchroniser les messages WhatsApp depuis Twilio
   */
  static async syncMessages(days: number = 7): Promise<void> {
    if (!client) {
      console.log('WhatsApp non configuré pour la synchronisation');
      return;
    }

    try {
      const prisma = await getPrismaClient();
      const since = new Date();
      since.setDate(since.getDate() - days);

      // Récupérer les messages depuis Twilio
      const messages = await client.messages.list({
        dateSentAfter: since,
        to: whatsappNumber,
        from: whatsappNumber
      });

      console.log(`${messages.length} messages WhatsApp à synchroniser`);

      for (const msg of messages) {
        // Vérifier si le message existe déjà (by checking timestamp and from/to)
        const existing = await prisma.whatsAppHistory.findFirst({
          where: {
            from: msg.from.replace('whatsapp:', ''),
            to: msg.to.replace('whatsapp:', ''),
            createdAt: msg.dateSent || msg.dateCreated
          }
        });

        if (!existing) {
          // Déterminer la direction
          const isIncoming = msg.to === whatsappNumber;
          
          await prisma.whatsAppHistory.create({
            data: {
              from: msg.from.replace('whatsapp:', ''),
              to: msg.to.replace('whatsapp:', ''),
              message: msg.body,
              status: msg.status,
              direction: isIncoming ? 'incoming' : 'outgoing',
              mediaUrl: null,
              createdAt: msg.dateSent || msg.dateCreated
            }
          });
        }
      }

      console.log('Synchronisation WhatsApp terminée');
    } catch (error) {
      console.error('Erreur synchronisation WhatsApp:', error);
    }
  }

  /**
   * Marquer les messages comme lus
   */
  static async markAsRead(phoneNumber: string): Promise<void> {
    try {
      const prisma = await getPrismaClient();
      const normalizedNumber = phoneNumber.replace('whatsapp:', '').replace(/\D/g, '');
      
      await prisma.whatsAppHistory.updateMany({
        where: {
          direction: 'incoming',
          from: { contains: normalizedNumber },
          readAt: null
        },
        data: { readAt: new Date() }
      });
    } catch (error) {
      console.error('Erreur marquage comme lu:', error);
    }
  }

  /**
   * Obtenir les conversations groupées
   */
  static async getGroupedConversations(): Promise<any[]> {
    try {
      const prisma = await getPrismaClient();
      
      // Récupérer tous les messages WhatsApp
      const messages = await prisma.whatsAppHistory.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Grouper par numéro de téléphone
      const conversations = new Map<string, any>();
      
      for (const msg of messages) {
        const phoneNumber = msg.direction === 'incoming' ? msg.from : msg.to;
        const normalizedNumber = phoneNumber.replace('whatsapp:', '').replace(/\D/g, '');
        
        if (!conversations.has(normalizedNumber)) {
          // Chercher le client associé
          const user = await prisma.user.findFirst({
            where: {
              phone: { contains: normalizedNumber.slice(-9) } // Derniers 9 chiffres
            }
          });

          conversations.set(normalizedNumber, {
            phoneNumber: normalizedNumber,
            clientName: user?.name || 'Client non identifié',
            clientId: user?.id,
            lastMessage: msg,
            messages: [msg],
            unreadCount: 0
          });
        } else {
          const conv = conversations.get(normalizedNumber)!;
          conv.messages.push(msg);
          if (msg.createdAt > conv.lastMessage.createdAt) {
            conv.lastMessage = msg;
          }
          if (!msg.readAt && msg.direction === 'incoming') {
            conv.unreadCount++;
          }
        }
      }

      return Array.from(conversations.values());
    } catch (error) {
      console.error('Erreur récupération conversations groupées:', error);
      return [];
    }
  }
}

// Templates de messages WhatsApp
export const whatsappTemplates = {
  welcome: `Bonjour {name} ! 👋

Bienvenue chez LAIA SKIN Institut ! 

Je suis ravie de vous compter parmi mes clientes. N'hésitez pas à me contacter directement ici pour toute question.

À très bientôt,
Laïa ✨`,

  reminder: `Bonjour {name} 😊

Petit rappel de votre RDV :
📅 {date}
⏰ {time}
💆 {service}

En cas d'empêchement, merci de me prévenir au plus tôt.

À demain !
Laïa`,

  followup: `Bonjour {name} !

J'espère que votre {service} s'est bien passé. Comment vous sentez-vous ?

N'hésitez pas si vous avez des questions sur les soins post-traitement.

Belle journée,
Laïa 🌸`,

  birthday: `🎂 Joyeux anniversaire {name} ! 🎉

Pour célébrer, je vous offre -30% sur le soin de votre choix ce mois-ci.

Réservez quand vous voulez !
Laïa 💕`
};