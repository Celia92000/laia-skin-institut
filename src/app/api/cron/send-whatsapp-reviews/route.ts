import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp-meta';

// Cette API doit être appelée tous les jours à 10h pour envoyer les demandes d'avis
export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les réservations d'il y a 3 jours
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
        status: 'confirmed',
        reviewWhatsAppSent: false // Nouveau champ pour WhatsApp
      },
      include: {
        user: {
          include: {
            loyaltyProfile: true
          }
        }
      }
    });

    console.log(`📱 ${completedReservations.length} demandes d'avis WhatsApp à envoyer`);

    let sentCount = 0;
    let errorCount = 0;
    
    for (const reservation of completedReservations) {
      if (!reservation.user?.phone) {
        console.log(`⚠️ Pas de téléphone pour ${reservation.user?.name}`);
        continue;
      }

      try {
        // Préparer les services
        const services = JSON.parse(reservation.services as string);
        const serviceNames = services.map((s: string) => {
          const serviceMap: any = {
            'hydroneedling': 'Hydroneedling',
            'hydroface': 'Hydroface',
            'nanoneedling': 'Nanoneedling',
            'led-therapie': 'LED Thérapie'
          };
          return serviceMap[s] || s;
        }).join(', ');

        // Calculer les informations de fidélité
        const loyaltyProfile = reservation.user.loyaltyProfile;
        const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
        const packagesCount = loyaltyProfile?.packagesCount || 0;
        
        let loyaltyProgress = '';
        let nextReward = '';
        
        if (sessionsCount < 5) {
          loyaltyProgress = `Vous avez ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''} sur 5`;
          nextReward = `Plus que ${5 - sessionsCount} séance${5 - sessionsCount > 1 ? 's' : ''} pour obtenir -30€ !`;
        } else if (packagesCount < 3) {
          loyaltyProgress = `Vous avez ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} sur 3`;
          nextReward = `Plus que ${3 - packagesCount} forfait${3 - packagesCount > 1 ? 's' : ''} pour obtenir -30€ !`;
        } else {
          loyaltyProgress = `Félicitations ! Vous êtes une cliente VIP`;
          nextReward = `Profitez de vos avantages exclusifs !`;
        }

        // Message WhatsApp pour demande d'avis
        const reviewMessage = `✨ *LAIA SKIN Institut* ✨

Bonjour ${reservation.user.name} ! 💕

J'espère que vous avez apprécié votre soin *${serviceNames}* d'il y a 3 jours.

⭐ *Votre avis est précieux !*
Pourriez-vous prendre quelques secondes pour partager votre expérience ?

👉 Répondez simplement à ce message avec:
- Une note de 1 à 5 étoiles (⭐)
- Votre commentaire

Ou cliquez ici : https://laiaskin.fr/avis?id=${reservation.id}

🎁 *Programme de fidélité*
${loyaltyProgress}
${nextReward}

Merci infiniment ! 🙏
*LAIA SKIN Institut*`;
        
        const result = await sendWhatsAppMessage({
          to: reservation.user.phone,
          message: reviewMessage
        });

        if (result.success) {
          // Marquer comme envoyé
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { reviewWhatsAppSent: true }
          });
          
          // Enregistrer dans l'historique email (si la table existe)
          try {
            await prisma.emailHistory.create({
              data: {
                from: 'LAIA SKIN Institut',
                to: reservation.user.phone,
                subject: `Demande d'avis WhatsApp`,
                content: `Demande d'avis automatique pour ${serviceNames}`,
                template: 'review_request_whatsapp',
                status: 'sent',
                direction: 'outgoing',
                userId: reservation.userId
              }
            });
          } catch (e) {
            // Table might not exist, continue
          }
          
          sentCount++;
          console.log(`✅ Avis WhatsApp envoyé à ${reservation.user.name} (${reservation.user.phone})`);
        } else {
          errorCount++;
          console.error(`❌ Échec envoi à ${reservation.user.name}:`, result.error);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour ${reservation.user.name}:`, error);
      }
      
      // Attendre un peu entre chaque envoi
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} demandes d'avis WhatsApp envoyées`,
      sent: sentCount,
      errors: errorCount,
      total: completedReservations.length
    });

  } catch (error) {
    console.error('Erreur cron WhatsApp reviews:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des demandes d\'avis' 
    }, { status: 500 });
  }
}

// Endpoint pour tester l'envoi manuel d'une demande d'avis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservationId } = body;

    if (!reservationId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 });
    }

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

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    if (!reservation.user?.phone) {
      return NextResponse.json({ error: 'Pas de numéro de téléphone' }, { status: 400 });
    }

    // Préparer les services
    const services = JSON.parse(reservation.services as string);
    const serviceNames = services.map((s: string) => {
      const serviceMap: any = {
        'hydroneedling': 'Hydroneedling',
        'hydroface': 'Hydroface',
        'nanoneedling': 'Nanoneedling',
        'led-therapie': 'LED Thérapie'
      };
      return serviceMap[s] || s;
    }).join(', ');

    // Calculer les informations de fidélité
    const loyaltyProfile = reservation.user.loyaltyProfile;
    const sessionsCount = loyaltyProfile?.individualServicesCount || 0;
    
    // Message WhatsApp
    const reviewMessage = `✨ *LAIA SKIN Institut* ✨

Bonjour ${reservation.user.name} ! 💕

J'espère que vous avez apprécié votre soin *${serviceNames}*.

⭐ *Votre avis compte !*
Partagez votre expérience en répondant à ce message ou en cliquant ici :
👉 https://laiaskin.fr/avis?id=${reservation.id}

🎁 Programme de fidélité : ${sessionsCount} séance${sessionsCount > 1 ? 's' : ''}

Merci ! 🙏
*LAIA SKIN Institut*`;
    
    const result = await sendWhatsAppMessage({
      to: reservation.user.phone,
      message: reviewMessage
    });

    if (result.success) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { reviewWhatsAppSent: true }
      });

      return NextResponse.json({ 
        success: true,
        message: 'Demande d\'avis WhatsApp envoyée',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({ 
        error: 'Échec de l\'envoi',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur envoi avis manuel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi' 
    }, { status: 500 });
  }
}