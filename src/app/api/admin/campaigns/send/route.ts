import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

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

    // Envoyer les emails
    for (const recipient of recipients) {
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
        const { data, error } = await resend.emails.send({
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
                  <p>Pour vous désinscrire, <a href="#">cliquez ici</a></p>
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
              campaignId: campaign.id,
              template,
              direction: 'outgoing'
            }
          });
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
        sentCount,
        sentAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      sent: sentCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Campagne envoyée : ${sentCount} succès, ${failedCount} échecs`
    });

  } catch (error) {
    console.error('Erreur envoi campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}