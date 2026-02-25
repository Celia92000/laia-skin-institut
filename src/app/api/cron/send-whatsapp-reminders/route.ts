import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage, whatsappTemplates } from '@/lib/whatsapp-meta';

// Cette API doit être appelée tous les jours à 18h pour envoyer les rappels du lendemain
export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les réservations de demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tomorrowReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: tomorrow,
          lte: tomorrowEnd
        },
        status: 'confirmed',
        reminderSent: false // Nouveau champ à ajouter dans le schema
      },
      include: {
        user: true
      }
    });

    console.log(`📱 ${tomorrowReservations.length} rappels WhatsApp à envoyer pour demain`);

    let sentCount = 0;
    let errorCount = 0;
    
    for (const reservation of tomorrowReservations) {
      if (!reservation.user?.phone) {
        console.log(`⚠️ Pas de téléphone pour ${reservation.user?.name}`);
        continue;
      }

      // Note: Le champ whatsappNotifications n'existe pas dans le modèle User actuel
      // Pour implémenter cette fonctionnalité, il faudrait ajouter ce champ au schéma Prisma
      // En attendant, on suppose que tous les utilisateurs acceptent les notifications
      console.log(`📱 Préparation du rappel WhatsApp pour ${reservation.user?.name}`);

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
        });

        // Envoyer le rappel WhatsApp
        const reminderMessage = whatsappTemplates.appointmentReminder({
          clientName: reservation.user.name,
          time: reservation.time,
          services: serviceNames
        });
        
        const result = await sendWhatsAppMessage({
          to: reservation.user.phone,
          message: reminderMessage
        });

        if (result.success) {
          // Marquer comme envoyé
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { reminderSent: true }
          });
          
          sentCount++;
          console.log(`✅ Rappel envoyé à ${reservation.user.name} (${reservation.user.phone})`);
        } else {
          errorCount++;
          console.error(`❌ Échec envoi à ${reservation.user.name}:`, result.error);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour ${reservation.user.name}:`, error);
      }
      
      // Attendre un peu entre chaque envoi pour éviter le spam
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ 
      success: true,
      message: `${sentCount} rappels WhatsApp envoyés`,
      sent: sentCount,
      errors: errorCount,
      total: tomorrowReservations.length
    });

  } catch (error) {
    console.error('Erreur cron WhatsApp reminders:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi des rappels' 
    }, { status: 500 });
  }
}

// Endpoint pour tester l'envoi manuel d'un rappel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservationId } = body;

    if (!reservationId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true }
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
    });

    // Envoyer le rappel
    const reminderMessage = whatsappTemplates.appointmentReminder({
      clientName: reservation.user.name,
      time: reservation.time,
      services: serviceNames
    });
    
    const result = await sendWhatsAppMessage({
      to: reservation.user.phone,
      message: reminderMessage
    });

    if (result.success) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { reminderSent: true }
      });

      return NextResponse.json({ 
        success: true,
        message: 'Rappel WhatsApp envoyé',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({ 
        error: 'Échec de l\'envoi',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur envoi rappel manuel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi' 
    }, { status: 500 });
  }
}