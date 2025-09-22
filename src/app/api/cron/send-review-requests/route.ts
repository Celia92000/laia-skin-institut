import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { sendWhatsAppMessage } from '@/lib/whatsapp-meta';

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

    // Récupérer les réservations d'il y a 3 jours qui sont terminées
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);
    
    const threeDaysAgoEnd = new Date(threeDaysAgo);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    const completedReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: threeDaysAgo,
          lte: threeDaysAgoEnd
        },
        status: 'confirmed', // Seulement les RDV confirmés/effectués
        reviewEmailSent: false // Pas déjà envoyé
      },
      include: {
        user: {
          include: {
            loyaltyProfile: true
          }
        }
      }
    });

    console.log(`📧 ${completedReservations.length} demandes d'avis à envoyer`);

    let sentCount = 0;
    
    for (const reservation of completedReservations) {
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

        // Calculer les informations de fidélité
        const loyaltyProfile = reservation.user.loyaltyProfile;
        const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
        const packagesCount = loyaltyProfile?.packagesCount || 0;
        
        // Déterminer la prochaine récompense
        let loyaltyProgress = '';
        let nextReward = '';
        
        if (sessionsCount < 5) {
          loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 6`;
          nextReward = `Plus que ${6 - sessionsCount} séance${6 - sessionsCount > 1 ? 's' : ''} pour obtenir 20€ de réduction sur votre 6ème soin !`;
        } else if (sessionsCount === 5) {
          loyaltyProgress = `Vous avez 5 séances`;
          nextReward = `Votre prochain soin bénéficie de 20€ de réduction !`;
        } else if (packagesCount < 3) {
          loyaltyProgress = `Vous avez ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} sur 4`;
          nextReward = `Plus que ${4 - packagesCount} forfait${4 - packagesCount > 1 ? 's' : ''} pour obtenir 40€ de réduction sur votre 4ème forfait !`;
        } else if (packagesCount === 3) {
          loyaltyProgress = `Vous avez 3 forfaits`;
          nextReward = `Votre prochain forfait bénéficie de 40€ de réduction !`;
        } else {
          loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP avec ${sessionsCount} séances et ${packagesCount} forfaits`;
          nextReward = `Profitez de vos avantages exclusifs !`;
        }

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
    .review-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .btn { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 15px 0; }
    .loyalty-box { background: #f0f8ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Comment s'est passé votre soin ?</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name || 'Cliente'},</p>
      
      <p>J'espère que vous avez apprécié votre soin <strong>${serviceNames}</strong> !</p>
      
      <div class="review-box">
        <h3>💕 Votre avis compte énormément pour moi</h3>
        <p>Pourriez-vous prendre quelques secondes pour partager votre expérience ?</p>
        <a href="https://laiaskin.fr/avis?id=${reservation.id}" class="btn">Donner mon avis</a>
      </div>
      
      <div class="loyalty-box">
        <h3>🎆 Votre statut fidélité</h3>
        <p>${loyaltyProgress}</p>
        <p><strong>${nextReward}</strong></p>
      </div>
      
      <p>Merci infiniment pour votre confiance !</p>
      
      <p>À très bientôt,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      📞 06 83 71 70 50<br>
      🌐 laiaskininstitut.fr</p>
    </div>
  </div>
</body>
</html>`;

        await resend!.emails.send({
          from: 'LAIA SKIN Institut <onboarding@resend.dev>',
          to: [reservation.user.email],
          subject: `✨ Comment s'est passé votre soin ${serviceNames} ?`,
          html: htmlContent,
          text: `Bonjour ${reservation.user.name}, j'espère que vous avez apprécié votre soin ! Votre avis compte énormément pour moi.`
        });

        // Marquer comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reviewEmailSent: true }
        });

        // Enregistrer dans l'historique
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laia.skininstitut.fr',
            to: reservation.user.email,
            subject: `✨ Demande d'avis`,
            content: `Demande d'avis automatique pour le soin ${serviceNames}`,
            template: 'review_request',
            status: 'sent',
            direction: 'outgoing',
            userId: reservation.userId
          }
        });

        // Envoyer aussi par WhatsApp si le numéro est disponible
        if (reservation.user.phone) {
          const whatsappMessage = `✨ *LAIA SKIN Institut* ✨

Bonjour ${reservation.user.name} ! 💕

J'espère que vous avez apprécié votre soin *${serviceNames}* d'il y a 3 jours.

⭐ *Votre avis est précieux !*
Pourriez-vous prendre quelques secondes pour partager votre expérience ?

👉 Cliquez ici : https://laiaskin.fr/avis?id=${reservation.id}

🎁 *Programme de fidélité*
${loyaltyProgress}
${nextReward}

Merci infiniment ! 🙏
*LAIA SKIN Institut*`;
          
          try {
            await sendWhatsAppMessage({
              to: reservation.user.phone,
              message: whatsappMessage
            });
            console.log(`📱 WhatsApp avis envoyé à: ${reservation.user.phone}`);
          } catch (whatsappError) {
            console.error('Erreur WhatsApp:', whatsappError);
          }
        }
        
        sentCount++;
        console.log(`✅ Avis envoyé à: ${reservation.user.email}`);
      } catch (error) {
        console.error(`Erreur envoi avis pour ${reservation.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} demandes d'avis envoyées`,
      total: completedReservations.length
    });

  } catch (error) {
    console.error('Erreur cron review:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des demandes d\'avis' 
    }, { status: 500 });
  }
}

// Endpoint manuel pour tester
export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json();
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { 
        user: {
          include: {
            loyaltyProfile: true
          }
        }
      }
    });

    if (!reservation || !reservation.user?.email) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Envoyer l'email d'avis
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

    // Calculer les informations de fidélité
    const loyaltyProfile = reservation.user.loyaltyProfile;
    const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
    const packagesCount = loyaltyProfile?.packagesCount || 0;
    
    // Déterminer la prochaine récompense
    let loyaltyProgress = '';
    let nextReward = '';
    
    if (sessionsCount < 5) {
      loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 6`;
      nextReward = `Plus que ${6 - sessionsCount} séance${6 - sessionsCount > 1 ? 's' : ''} pour obtenir 10€ de réduction sur votre 6ème soin !`;
    } else if (sessionsCount === 5) {
      loyaltyProgress = `Vous avez 5 séances`;
      nextReward = `Votre prochain soin bénéficie de 10€ de réduction !`;
    } else if (packagesCount < 3) {
      loyaltyProgress = `Vous avez ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} sur 4`;
      nextReward = `Plus que ${4 - packagesCount} forfait${4 - packagesCount > 1 ? 's' : ''} pour obtenir 20€ de réduction sur votre 4ème forfait !`;
    } else if (packagesCount === 3) {
      loyaltyProgress = `Vous avez 3 forfaits`;
      nextReward = `Votre prochain forfait bénéficie de 20€ de réduction !`;
    } else {
      loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP avec ${sessionsCount} séances et ${packagesCount} forfaits`;
      nextReward = `Profitez de vos avantages exclusifs !`;
    }

    // Vérifier que Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      return NextResponse.json({ 
        success: false,
        message: 'Service email non configuré'
      });
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
    .review-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .btn { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 15px 0; }
    .loyalty-box { background: #f0f8ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Comment s'est passé votre soin ?</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name || 'Cliente'},</p>
      
      <p>J'espère que vous avez apprécié votre soin <strong>${serviceNames}</strong> !</p>
      
      <div class="review-box">
        <h3>💕 Votre avis compte énormément pour moi</h3>
        <p>Pourriez-vous prendre quelques secondes pour partager votre expérience ?</p>
        <a href="https://laiaskin.fr/avis?id=${reservation.id}" class="btn">Donner mon avis</a>
      </div>
      
      <div class="loyalty-box">
        <h3>🎆 Votre statut fidélité</h3>
        <p>${loyaltyProgress}</p>
        <p><strong>${nextReward}</strong></p>
      </div>
      
      <p>Merci infiniment pour votre confiance !</p>
      
      <p>À très bientôt,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      📞 06 83 71 70 50<br>
      🌐 laiaskininstitut.fr</p>
    </div>
  </div>
</body>
</html>`;

    await resend!.emails.send({
      from: 'LAIA SKIN Institut <onboarding@resend.dev>',
      to: [reservation.user.email],
      subject: `✨ Comment s'est passé votre soin ${serviceNames} ?`,
      html: htmlContent,
      text: `Bonjour ${reservation.user.name}, j'espère que vous avez apprécié votre soin ! Votre avis compte énormément pour moi.`
    });

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { reviewEmailSent: true }
    });

    // Enregistrer dans l'historique
    await prisma.emailHistory.create({
      data: {
        from: 'contact@laia.skininstitut.fr',
        to: reservation.user.email,
        subject: `✨ Demande d'avis`,
        content: `Demande d'avis manuelle pour le soin ${serviceNames}`,
        template: 'review_request',
        status: 'sent',
        direction: 'outgoing',
        userId: reservation.userId
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Email d\'avis envoyé'
    });

    return NextResponse.json({ 
      success: false,
      message: 'Service email non configuré'
    });

  } catch (error) {
    console.error('Erreur envoi avis manuel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi' 
    }, { status: 500 });
  }
}