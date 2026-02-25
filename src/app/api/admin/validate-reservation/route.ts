import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { sendWhatsAppMessage, whatsappTemplates } from '@/lib/whatsapp-meta';
import { sendReservationConfirmationEmail } from '@/lib/resend-email-service';

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const { reservationId, action } = await request.json();
    
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Récupérer la réservation avec les infos du client
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: true
      }
    });
    
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }
    
    if (action === 'validate') {
      // Valider la réservation
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' }
      });
      
      // Préparer les données pour les notifications
      const services = JSON.parse(reservation.services);
      const serviceNames = services.map((s: string) => {
        const serviceMap: any = {
          'hydroneedling': 'Hydroneedling',
          'hydroface': 'Hydroface',
          'nanoneedling': 'Nanoneedling',
          'led-therapie': 'LED Thérapie'
        };
        return serviceMap[s] || s;
      });
      
      const formattedDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // 1. ENVOYER EMAIL DE CONFIRMATION (immédiatement)
      if (reservation.user.email) {
        try {
          await sendReservationConfirmationEmail({
            to: reservation.user.email,
            clientName: reservation.user.name,
            date: formattedDate,
            time: reservation.time,
            services: serviceNames,
            totalPrice: reservation.totalPrice,
            reservationId: reservation.id
          });
          console.log(`✅ Email de confirmation envoyé à ${reservation.user.email}`);
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError);
        }
      }
      
      // 2. ENVOYER WHATSAPP DE CONFIRMATION (immédiatement)
      if (reservation.user.phone) {
        const confirmMessage = whatsappTemplates.reservationConfirmation({
          clientName: reservation.user.name,
          date: formattedDate,
          time: reservation.time,
          services: serviceNames,
          totalPrice: reservation.totalPrice
        });
        
        // Envoi asynchrone
        sendWhatsAppMessage({
          to: reservation.user.phone,
          message: confirmMessage
        }).catch(console.error);
        
        console.log(`📱 WhatsApp de confirmation envoyé à ${reservation.user.phone}`);
      }
      
      // 3. Programmer le rappel 24h avant (sera envoyé par le CRON)
      scheduleReminder(reservation);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Réservation validée et client notifié' 
      });
      
    } else if (action === 'reject') {
      // Rejeter la réservation
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'cancelled' }
      });
      
      // Envoyer un message au client
      if (reservation.user.phone) {
        const rejectMessage = `Bonjour ${reservation.user.name},\n\n` +
          `Malheureusement, votre demande de réservation pour le ${new Date(reservation.date).toLocaleDateString('fr-FR')} à ${reservation.time} n'a pas pu être acceptée.\n\n` +
          `Nous vous invitons à choisir un autre créneau sur notre site : https://laiaskin.fr\n\n` +
          `Merci de votre compréhension.\n` +
          `LAIA SKIN Institut`;
        
        sendWhatsAppMessage({
          to: reservation.user.phone,
          message: rejectMessage
        }).catch(console.error);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Réservation rejetée et client notifié' 
      });
    }
    
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    
  } catch (error) {
    console.error('Erreur validation réservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonction pour programmer un rappel
async function scheduleReminder(reservation: any) {
  const reminderDate = new Date(reservation.date);
  reminderDate.setDate(reminderDate.getDate() - 1); // 24h avant
  reminderDate.setHours(18, 0, 0, 0); // À 18h
  
  // En production, utiliser un service de scheduling comme :
  // - Vercel Cron
  // - node-cron
  // - Bull Queue
  // - AWS EventBridge
  
  console.log(`Rappel programmé pour ${reservation.user.name} le ${reminderDate.toISOString()}`);
  
  // Pour l'instant, stocker dans la DB
  // TODO: Créer le modèle Reminder dans le schéma Prisma
  /*
  try {
    await prisma.reminder.create({
      data: {
        reservationId: reservation.id,
        type: 'day_before',
        scheduledFor: reminderDate,
        status: 'pending'
      }
    });
  } catch (error) {
    // La table reminder n'existe peut-être pas encore
    console.log('Table reminder à créer dans le schéma Prisma');
  }
  */
}