import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Initialiser Resend avec une clé dummy pour le build
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

// Cette API doit être appelée tous les jours à 10h (via un cron job)
export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les réservations dans 48h (après-demain)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    
    const twoDaysFromNowEnd = new Date(twoDaysFromNow);
    twoDaysFromNowEnd.setHours(23, 59, 59, 999);

    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: twoDaysFromNow,
          lte: twoDaysFromNowEnd
        },
        status: 'confirmed' // Seulement les RDV confirmés
      },
      include: {
        user: true
      }
    });

    console.log(`📧 ${upcomingReservations.length} rappels 48h à envoyer`);

    let sentCount = 0;
    
    for (const reservation of upcomingReservations) {
      if (!reservation.user?.email) continue;

      try {
        // Préparer les données pour l'email
        const services = JSON.parse(reservation.services as string);
        const serviceNames = services.map((s: string) => {
          const serviceMap: any = {
            'hydro-naissance': "Hydro'Naissance",
            'hydro-cleaning': "Hydro'Cleaning",
            'renaissance': 'Renaissance',
            'bb-glow': 'BB Glow',
            'led-therapie': 'LED Thérapie'
          };
          return serviceMap[s] || s;
        }).join(', ');

        // Calculer la durée totale (75 min par soin)
        const duration = `${services.length * 75} minutes`;

        // Vérifier que Resend est configuré
        if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
          console.log('Resend non configuré - emails non envoyés');
          continue;
        }

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
      <h1>📅 Rappel de votre rendez-vous dans 48h</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name || 'Cliente'},</p>
      
      <p>Je vous rappelle votre rendez-vous dans <strong>48 heures</strong> chez LAIA SKIN Institut.</p>
      
      <div class="appointment-box">
        <h3>📍 Détails de votre rendez-vous :</h3>
        <p><strong>Date :</strong> ${reservation.date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}<br>
        <strong>Heure :</strong> ${reservation.time}<br>
        <strong>Soins :</strong> ${serviceNames}<br>
        <strong>Durée :</strong> ${duration}<br>
        <strong>Prix total :</strong> ${reservation.totalPrice}€</p>
      </div>
      
      <p>Si vous avez besoin de modifier ou annuler votre rendez-vous, merci de me prévenir au plus vite.</p>
      
      <p>📞 WhatsApp : 06 83 71 70 50</p>
      
      <p>J'ai hâte de vous retrouver !</p>
      
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
          subject: `📅 Rappel : Votre rendez-vous dans 48h - ${serviceNames}`,
          html: htmlContent,
          text: `Rappel : Vous avez rendez-vous dans 48h pour ${serviceNames}.`
        });

        // Enregistrer dans l'historique
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laia.skininstitut.fr',
            to: reservation.user.email,
            subject: `📅 Rappel 48h`,
            content: `Rappel automatique 48h pour le rendez-vous du ${reservation.date.toLocaleDateString('fr-FR')}`,
            template: 'reminder_48h',
            status: 'sent',
            direction: 'outgoing',
            userId: reservation.userId
          }
        });

        sentCount++;
        console.log(`✅ Rappel 48h envoyé à: ${reservation.user.email}`);
      
      } catch (error) {
        console.error(`Erreur envoi rappel pour ${reservation.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} rappels 48h envoyés`,
      total: upcomingReservations.length
    });

  } catch (error) {
    console.error('Erreur cron reminder 48h:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des rappels' 
    }, { status: 500 });
  }
}