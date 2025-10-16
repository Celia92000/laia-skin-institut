import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getResend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN' && admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { subject, content, recipients, template } = await request.json();

    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Créer une campagne dans la base de données
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: subject,
        subject,
        content,
        recipients: JSON.stringify(recipients),
        recipientCount: recipients.length,
        status: 'sending',
        template
      }
    });

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Filtrer les destinataires désinscrits
    const unsubscribedEmails = await prisma.newsletterSubscriber.findMany({
      where: {
        isActive: false
      },
      select: { email: true }
    });

    const unsubscribedSet = new Set(unsubscribedEmails.map((s: { email: string }) => s.email));
    const filteredRecipients = recipients.filter((r: { email: string }) => !unsubscribedSet.has(r.email));

    if (filteredRecipients.length < recipients.length) {
      console.log(`⚠️ ${recipients.length - filteredRecipients.length} destinataire(s) filtré(s) (désinscrits)`);
    }

    // Fonction pour ajouter un délai (600ms = respecte la limite de 2 emails/seconde)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Envoyer les emails
    for (let i = 0; i < filteredRecipients.length; i++) {
      const recipient = filteredRecipients[i];
      try {
        // Personnaliser le contenu
        const personalizedContent = content
          .replace(/\{name\}/g, recipient.name || 'Cliente')
          .replace(/\{email\}/g, recipient.email)
          .replace(/\{date\}/g, new Date().toLocaleDateString('fr-FR'))
          .replace(/\{points\}/g, recipient.loyaltyPoints || '0');

        const personalizedSubject = subject
          .replace(/\{name\}/g, recipient.name || 'Cliente');

        // Envoyer l'email via Resend
        const { data, error } = await getResend().emails.send({
          from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
          to: recipient.email,
          subject: personalizedSubject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; }
                .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 30px; background: #d4b5a0; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>LAIA SKIN Institut</h1>
                </div>
                <div class="content">
                  ${personalizedContent}
                </div>
                <div class="footer">
                  <p>LAIA SKIN Institut - Votre beauté, notre passion</p>
                  <p style="margin-top: 10px;">
                    <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/unsubscribe?email=${encodeURIComponent(recipient.email)}"
                       style="color: #666; text-decoration: underline;">
                      Se désinscrire de la newsletter
                    </a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        });

        if (error) {
          failedCount++;
          errors.push(`${recipient.email}: ${error.message}`);
          
          // Enregistrer l'échec dans l'historique
          await prisma.emailHistory.create({
            data: {
              from: 'contact@laiaskininstitut.fr',
              to: recipient.email,
              subject: personalizedSubject,
              content: personalizedContent,
              status: 'failed',
              errorMessage: error.message,
              campaignId: campaign.id,
              template,
              direction: 'outgoing'
            }
          });
        } else {
          sentCount++;

          // Enregistrer le succès dans l'historique
          await prisma.emailHistory.create({
            data: {
              from: 'contact@laiaskininstitut.fr',
              to: recipient.email,
              subject: personalizedSubject,
              content: personalizedContent,
              status: 'sent',
              resendId: data?.id || null, // Stocker l'ID Resend pour le tracking
              campaignId: campaign.id,
              template,
              direction: 'outgoing'
            }
          });
        }

        // Ajouter un délai après chaque envoi (sauf le dernier) pour respecter la limite de 2 emails/seconde
        if (i < filteredRecipients.length - 1) {
          await delay(600);
        }
      } catch (err: any) {
        failedCount++;
        errors.push(`${recipient.email}: ${err.message}`);
      }
    }

    // Mettre à jour le statut de la campagne
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    const skippedCount = recipients.length - filteredRecipients.length;

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      sent: sentCount,
      failed: failedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Campagne envoyée : ${sentCount} succès, ${failedCount} échecs${skippedCount > 0 ? `, ${skippedCount} désinscrits ignorés` : ''}`
    });

  } catch (error) {
    console.error('Erreur envoi campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}