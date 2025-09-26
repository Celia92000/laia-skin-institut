import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { sendWhatsApp, sendEmail } from '@/lib/notifications';

// Cette API doit être appelée régulièrement (toutes les heures par exemple)
// via un service CRON (Vercel Cron, GitHub Actions, ou autre)
export async function GET(request: NextRequest) {
  try {
    // Vérifier la clé secrète pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'laia-cron-secret-2024';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const prisma = await getPrismaClient();
    const now = new Date();
    
    // Calculer les fenêtres de rappel
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Rappel 24h avant (entre 23h et 25h avant le RDV)
    const reminder24hStart = new Date(tomorrow);
    reminder24hStart.setHours(reminder24hStart.getHours() - 1);
    const reminder24hEnd = new Date(tomorrow);
    reminder24hEnd.setHours(reminder24hEnd.getHours() + 1);
    
    // Rappel 2h avant (entre 1h45 et 2h15 avant le RDV)
    const reminder2hStart = new Date(now);
    reminder2hStart.setHours(reminder2hStart.getHours() + 1.75);
    const reminder2hEnd = new Date(now);
    reminder2hEnd.setHours(reminder2hEnd.getHours() + 2.25);
    
    // Récupérer les réservations qui nécessitent un rappel 24h
    const reservations24h = await prisma.reservation.findMany({
      where: {
        date: {
          gte: reminder24hStart,
          lte: reminder24hEnd
        },
        status: {
          in: ['confirmed', 'pending']
        },
        reminder24hSent: false
      },
      include: {
        user: true
      }
    });
    
    // Récupérer les réservations qui nécessitent un rappel 2h
    const reservations2h = await prisma.reservation.findMany({
      where: {
        date: {
          gte: reminder2hStart,
          lte: reminder2hEnd
        },
        status: {
          in: ['confirmed', 'pending']
        },
        reminder2hSent: false
      },
      include: {
        user: true
      }
    });
    
    // Rappel pour les avis 3 jours après
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStart = new Date(threeDaysAgo);
    threeDaysAgoStart.setHours(0, 0, 0, 0);
    const threeDaysAgoEnd = new Date(threeDaysAgo);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);
    
    // Récupérer les réservations complétées il y a 3 jours sans avis
    const reservationsForReview = await prisma.reservation.findMany({
      where: {
        date: {
          gte: threeDaysAgoStart,
          lte: threeDaysAgoEnd
        },
        status: 'completed',
        reviewWhatsAppSent: false,
        review: null
      },
      include: {
        user: true
      }
    });
    
    let sent24h = 0;
    let sent2h = 0;
    let sentReview = 0;
    
    // Envoyer les rappels 24h
    for (const reservation of reservations24h) {
      if (!reservation.user) continue;
      
      const date = new Date(reservation.date);
      const formattedDate = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const formattedTime = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Récupérer les services pour le message
      let services = 'votre soin';
      try {
        if (reservation.services) {
          const servicesList = typeof reservation.services === 'string' 
            ? JSON.parse(reservation.services)
            : reservation.services;
          if (Array.isArray(servicesList) && servicesList.length > 0) {
            services = servicesList.join(', ');
          }
        }
      } catch (e) {
        // Garder la valeur par défaut
      }
      
      const message24h = `🌟 Rappel de votre rendez-vous

Bonjour ${reservation.user.name} !

C'est un rappel pour votre rendez-vous demain :

📅 ${formattedDate}
⏰ ${formattedTime}
💆‍♀️ Service : ${services}

📍 LAIA SKIN Institut
5 Rue de la Beauté, 75001 Paris

Si vous devez annuler ou reporter, merci de nous prévenir au plus tôt.

À demain ! 
L'équipe LAIA SKIN Institut ✨`;

      try {
        // Priorité au WhatsApp si le numéro est disponible
        if (reservation.user.phone) {
          await sendWhatsApp(reservation.user.phone, message24h);
          console.log(`📱 Rappel 24h WhatsApp envoyé à ${reservation.user.name}`);
        } else if (reservation.user.email) {
          await sendEmail(
            reservation.user.email,
            '🌟 Rappel de votre rendez-vous demain',
            message24h
          );
          console.log(`📧 Rappel 24h email envoyé à ${reservation.user.name}`);
        }
        
        // Marquer le rappel comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reminder24hSent: true }
        });
        
        sent24h++;
      } catch (error) {
        console.error(`Erreur envoi rappel 24h pour ${reservation.user.name}:`, error);
      }
    }
    
    // Envoyer les rappels 2h
    for (const reservation of reservations2h) {
      if (!reservation.user) continue;
      
      const date = new Date(reservation.date);
      const formattedTime = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const message2h = `⏰ Votre rendez-vous approche !

${reservation.user.name}, votre rendez-vous est dans 2 heures à ${formattedTime}.

Nous avons hâte de vous voir !

📍 LAIA SKIN Institut
5 Rue de la Beauté, 75001 Paris

À tout à l'heure ! 💝`;

      try {
        // Priorité au WhatsApp pour le rappel 2h
        if (reservation.user.phone) {
          await sendWhatsApp(reservation.user.phone, message2h);
          console.log(`📱 Rappel 2h WhatsApp envoyé à ${reservation.user.name}`);
        } else if (reservation.user.email) {
          await sendEmail(
            reservation.user.email,
            '⏰ Votre rendez-vous est dans 2 heures !',
            message2h
          );
          console.log(`📧 Rappel 2h email envoyé à ${reservation.user.name}`);
        }
        
        // Marquer le rappel comme envoyé
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reminder2hSent: true }
        });
        
        sent2h++;
      } catch (error) {
        console.error(`Erreur envoi rappel 2h pour ${reservation.user.name}:`, error);
      }
    }
    
    // Envoyer les demandes d'avis 3 jours après
    for (const reservation of reservationsForReview) {
      if (!reservation.user) continue;
      
      let serviceName = 'votre soin';
      try {
        if (reservation.services) {
          const servicesList = typeof reservation.services === 'string' 
            ? JSON.parse(reservation.services)
            : reservation.services;
          if (Array.isArray(servicesList) && servicesList.length > 0) {
            serviceName = servicesList[0]; // Premier service principal
          }
        }
      } catch (e) {
        // Garder la valeur par défaut
      }
      
      const reviewMessage = `💝 Votre avis compte pour nous !

Bonjour ${reservation.user.name},

J'espère que vous avez apprécié ${serviceName} chez LAIA SKIN Institut.

Votre retour est précieux pour nous améliorer et aider d'autres clients à découvrir nos soins.

📝 Partagez votre expérience :
• Qu'avez-vous pensé du soin ?
• Comment vous sentez-vous après ?
• Recommanderiez-vous ce soin ?

📸 N'hésitez pas à nous envoyer des photos de votre expérience !

⭐ Notez-nous de 1 à 5 étoiles

Pour laisser votre avis :
1️⃣ Répondez directement à ce message
2️⃣ Ou connectez-vous sur votre espace client
3️⃣ Ou laissez un avis Google : [lien]

En remerciement, recevez 5% de réduction sur votre prochain soin en laissant un avis avec photo ! 🎁

Merci pour votre confiance,
L'équipe LAIA SKIN Institut ✨`;

      try {
        // Priorité au WhatsApp pour les demandes d'avis
        if (reservation.user.phone) {
          await sendWhatsApp(reservation.user.phone, reviewMessage);
          console.log(`📱 Demande d'avis WhatsApp envoyée à ${reservation.user.name}`);
        } else if (reservation.user.email) {
          await sendEmail(
            reservation.user.email,
            '💝 Votre avis compte pour nous !',
            reviewMessage
          );
          console.log(`📧 Demande d'avis email envoyée à ${reservation.user.name}`);
        }
        
        // Marquer la demande d'avis comme envoyée
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reviewWhatsAppSent: true }
        });
        
        // Créer une notification dans l'app
        await prisma.notification.create({
          data: {
            userId: reservation.user.id,
            type: 'review_request',
            title: 'Votre avis compte !',
            message: 'Partagez votre expérience et recevez 5% de réduction',
            actionUrl: `/espace-client/avis/${reservation.id}`
          }
        });
        
        sentReview++;
      } catch (error) {
        console.error(`Erreur envoi demande d'avis pour ${reservation.user.name}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      reminders: {
        '24h': {
          checked: reservations24h.length,
          sent: sent24h
        },
        '2h': {
          checked: reservations2h.length,
          sent: sent2h
        },
        'review': {
          checked: reservationsForReview.length,
          sent: sentReview
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur dans le CRON des rappels:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des rappels' },
      { status: 500 }
    );
  }
}

// Endpoint manuel pour tester/forcer l'envoi de rappels
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reservationId } = await request.json();
    
    if (!reservationId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 });
    }
    
    const prisma = await getPrismaClient();
    
    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true }
    });
    
    if (!reservation || !reservation.user) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }
    
    const date = new Date(reservation.date);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const formattedTime = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const manualMessage = `📬 Rappel de votre rendez-vous

Bonjour ${reservation.user.name} !

Rappel de votre rendez-vous :

📅 ${formattedDate}
⏰ ${formattedTime}

📍 LAIA SKIN Institut

À bientôt !
L'équipe LAIA SKIN Institut ✨`;
    
    // Envoyer le rappel
    if (reservation.user.phone) {
      await sendWhatsApp(reservation.user.phone, manualMessage);
    } else if (reservation.user.email) {
      await sendEmail(
        reservation.user.email,
        '📬 Rappel de votre rendez-vous',
        manualMessage
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Rappel envoyé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur envoi rappel manuel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du rappel' },
      { status: 500 }
    );
  }
}