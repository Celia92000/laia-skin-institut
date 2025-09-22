import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Initialiser Resend avec une clé dummy pour le build
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que Resend est bien configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.log('Resend API key not configured, skipping email send');
      return NextResponse.json({ 
        success: false, 
        message: 'Resend non configuré - emails non envoyés' 
      });
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    console.log(`Vérification des rappels pour le ${tomorrow.toLocaleDateString('fr-FR')}`);

    // Récupérer les réservations de demain
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        },
        status: 'confirmé'
      },
      include: {
        user: true
      }
    });

    console.log(`${reservations.length} rappel(s) à envoyer`);

    // Envoyer un rappel pour chaque réservation
    for (const reservation of reservations) {
      if (!reservation.user?.email) continue;

      try {
        const appointmentTime = new Date(reservation.date).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .appointment-box { background: #e8f4f8; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Rappel de votre rendez-vous</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name},</p>
      
      <p>Je vous rappelle votre rendez-vous <strong>demain</strong> chez LAIA SKIN Institut.</p>
      
      <div class="appointment-box">
        <h3>📍 Détails de votre rendez-vous :</h3>
        <p><strong>Date :</strong> ${tomorrow.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}<br>
        <strong>Heure :</strong> ${appointmentTime}<br>
        <strong>Prix :</strong> ${reservation.totalPrice}€</p>
      </div>
      
      <p>Si vous avez besoin de modifier ou annuler votre rendez-vous, merci de me prévenir au plus vite.</p>
      
      <p>📞 WhatsApp : 06 83 71 70 50</p>
      
      <p>J'ai hâte de vous retrouver demain !</p>
      
      <p>À très bientôt,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      🌐 laiaskininstitut.fr</p>
    </div>
  </div>
</body>
</html>`;

        await resend!.emails.send({
          from: 'LAIA SKIN Institut <onboarding@resend.dev>',
          to: [reservation.user.email],
          subject: `📅 Rappel : Votre rendez-vous demain à ${appointmentTime}`,
          html: htmlContent,
          text: `Rappel : Vous avez rendez-vous demain à ${appointmentTime}.`
        });

        // Enregistrer dans l'historique
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laia.skininstitut.fr',
            to: reservation.user.email,
            subject: `📅 Rappel de rendez-vous`,
            content: `Rappel automatique pour le rendez-vous du ${tomorrow.toLocaleDateString('fr-FR')}`,
            template: 'reminder',
            status: 'sent',
            direction: 'outgoing',
            userId: reservation.userId
          }
        });

        console.log(`Rappel envoyé à ${reservation.user.name}`);
      } catch (emailError) {
        console.error(`Erreur envoi rappel à ${reservation.user.name}:`, emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${reservations.length} rappel(s) envoyé(s)` 
    });

  } catch (error) {
    console.error('Erreur cron rappels:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des rappels',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}