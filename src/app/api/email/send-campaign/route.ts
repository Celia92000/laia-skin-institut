import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const { 
      recipients, 
      subject, 
      content, 
      templateType,
      segment 
    } = await req.json();

    // Récupérer les emails des destinataires
    let recipientEmails: string[] = [];
    
    if (segment) {
      // Si c'est une campagne par segment
      const users = await getSegmentUsers(segment);
      recipientEmails = users.map(u => u.email);
    } else if (recipients && recipients.length > 0) {
      // Si des destinataires spécifiques sont sélectionnés
      const users = await prisma.user.findMany({
        where: {
          id: { in: recipients }
        },
        select: { email: true, name: true }
      });
      recipientEmails = users.map(u => u.email);
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: 'Aucun destinataire trouvé' },
        { status: 400 }
      );
    }

    // Envoyer les emails
    const results = await Promise.allSettled(
      recipientEmails.map(email =>
        getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
          to: email,
          subject: subject,
          html: getEmailTemplate(templateType, content)
        })
      )
    );

    // Enregistrer la campagne dans la base de données
    await prisma.emailCampaign.create({
      data: {
        name: subject,
        subject: subject,
        content: content,
        recipients: JSON.stringify(recipientEmails),
        recipientCount: recipientEmails.length,
        status: 'sent',
        sentAt: new Date()
      }
    });

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: recipientEmails.length
    });
  } catch (error) {
    console.error('Erreur envoi campagne:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la campagne' },
      { status: 500 }
    );
  }
}

async function getSegmentUsers(segment: string) {
  const prisma = await getPrismaClient();
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

  switch (segment) {
    case 'new':
      // Nouvelles clientes (inscrites ce mois)
      return await prisma.user.findMany({
        where: {
          role: 'client',
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1)
          }
        },
        select: { id: true, email: true, name: true }
      });

    case 'loyal':
      // Clientes fidèles (6+ visites)
      return await prisma.user.findMany({
        where: {
          role: 'client',
          loyaltyProfile: {
            individualServicesCount: { gte: 6 }
          }
        },
        select: { id: true, email: true, name: true }
      });

    case 'inactive':
      // Clientes inactives (60+ jours sans visite)
      return await prisma.user.findMany({
        where: {
          role: 'client',
          lastVisit: {
            lte: sixtyDaysAgo
          }
        },
        select: { id: true, email: true, name: true }
      });

    case 'birthday':
      // Anniversaires ce mois
      const currentMonth = today.getMonth() + 1;
      return await prisma.user.findMany({
        where: {
          role: 'client',
          birthDate: {
            not: null
          }
        },
        select: { id: true, email: true, name: true, birthDate: true }
      }).then(users => 
        users.filter(user => {
          if (user.birthDate) {
            const birthMonth = new Date(user.birthDate).getMonth() + 1;
            return birthMonth === currentMonth;
          }
          return false;
        })
      );

    default:
      return [];
  }
}

function getEmailTemplate(templateType: string, content: string): string {
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 40px 30px; text-align: center; }
      .content { padding: 30px; }
      .button { display: inline-block; padding: 14px 30px; margin: 20px 0; background: #d4b5a0; color: white; text-decoration: none; border-radius: 25px; font-weight: 500; }
      .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LAIA SKIN INSTITUT</h1>
        </div>
        <div class="content">
          ${content}
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://laia-skin-institut.fr/reservation" class="button">
              Prendre rendez-vous
            </a>
          </div>
        </div>
        <div class="footer">
          <p>LAIA SKIN INSTITUT</p>
          <p>1 Rue de la Paix, 75001 Paris</p>
          <p>06 12 34 56 78</p>
          <p style="margin-top: 20px; font-size: 12px;">
            <a href="https://laia-skin-institut.fr/unsubscribe" style="color: #d4b5a0;">Se désinscrire</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}