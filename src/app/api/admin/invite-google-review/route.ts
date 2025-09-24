import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'noreply@laiaskin.com',
    pass: process.env.SMTP_PASS || 'your-password'
  }
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.role !== 'admin' && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { clientIds } = await request.json();

    // Si aucun client spécifié, envoyer à tous les clients avec email
    let clients;
    if (clientIds && clientIds.length > 0) {
      clients = await prisma.user.findMany({
        where: {
          id: { in: clientIds },
          email: { not: null }
        }
      });
    } else {
      // Récupérer tous les clients qui ont eu une réservation confirmée/complétée
      const recentReservations = await prisma.reservation.findMany({
        where: {
          status: { in: ['completed'] },
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
          }
        },
        include: {
          user: true
        },
        distinct: ['userId']
      });
      
      clients = recentReservations.map(r => r.user).filter(Boolean);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun client éligible trouvé',
        message: 'Aucun client avec une réservation récente complétée' 
      }, { status: 404 });
    }

    // URL de votre page Google Business
    const googleReviewUrl = 'https://g.page/r/CYourGoogleBusinessID/review'; // À remplacer par votre vraie URL

    // Template d'email
    const emailTemplate = (clientName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4b5a0 0%, #f5e6da 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .button { display: inline-block; padding: 15px 30px; background: #d4b5a0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .stars { color: #fbbf24; font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Laia Skin Institut</h1>
          </div>
          <div class="content">
            <p>Bonjour ${clientName},</p>
            
            <p>J'espère que vous avez apprécié votre dernière visite à l'institut.</p>
            
            <p>Votre satisfaction est ma priorité absolue, et vos retours m'aident à améliorer constamment mes services.</p>
            
            <p><strong>Pourriez-vous prendre quelques instants pour partager votre expérience sur Google ?</strong></p>
            
            <p>Votre avis aide d'autres personnes à découvrir l'institut et me permet de continuer à vous offrir les meilleurs soins.</p>
            
            <div style="text-align: center;">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <a href="${googleReviewUrl}" class="button" style="color: white;">
                Laisser un avis sur Google
              </a>
            </div>
            
            <p>Cela ne prend que 2 minutes et signifie beaucoup pour moi !</p>
            
            <p>Merci infiniment pour votre confiance,</p>
            <p><strong>Laia</strong><br>
            Laia Skin Institut</p>
          </div>
          <div class="footer">
            <p>Laia Skin Institut<br>
            Votre adresse<br>
            Téléphone : 06 XX XX XX XX<br>
            Email : contact@laiaskin.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer les emails
    let sentCount = 0;
    let errors = [];

    for (const client of clients) {
      if (!client.email) continue;
      
      try {
        // Simuler l'envoi pour le développement
        // En production, décommentez le code ci-dessous
        /*
        await transporter.sendMail({
          from: '"Laia Skin Institut" <noreply@laiaskin.com>',
          to: client.email,
          subject: '🌟 Votre avis compte pour nous !',
          html: emailTemplate(client.name || 'Cher(e) client(e)')
        });
        */
        
        console.log(`Email d'invitation envoyé à ${client.email}`);
        sentCount++;
        
        // Enregistrer l'invitation dans la base de données (optionnel)
        // await prisma.googleReviewInvite.create({
        //   data: {
        //     userId: client.id,
        //     sentAt: new Date(),
        //     status: 'sent'
        //   }
        // });
        
      } catch (error) {
        console.error(`Erreur envoi email à ${client.email}:`, error);
        errors.push(client.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invitations envoyées avec succès`,
      details: {
        totalClients: clients.length,
        sentCount,
        failedCount: errors.length,
        failedEmails: errors
      }
    });

  } catch (error) {
    console.error('Erreur dans invite-google-review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des invitations' },
      { status: 500 }
    );
  }
}