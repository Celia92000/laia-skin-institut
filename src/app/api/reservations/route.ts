import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp-meta';
import { isSlotAvailable } from '@/lib/availability-service';
import { sendConfirmationEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { services, packages, date, time, notes, totalPrice, clientInfo } = body;
    
    // Vérifier si le créneau est disponible (horaires de travail et dates bloquées)
    const reservationDate = new Date(date);
    const available = await isSlotAvailable(reservationDate, time);
    
    if (!available) {
      return NextResponse.json({ 
        error: 'Ce créneau n\'est pas disponible. Veuillez choisir un autre horaire.' 
      }, { status: 409 });
    }
    
    let userId: string;
    let user;
    
    // Vérifier si c'est un utilisateur connecté ou un nouveau client
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Client connecté
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
      userId = decoded.userId;
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (clientInfo && clientInfo.email) {
      // Nouveau client sans compte - Créer automatiquement le profil
      user = await prisma.user.findFirst({
        where: { email: clientInfo.email }
      });
      
      if (!user) {
        // Créer un nouveau client dans le CRM
        user = await prisma.user.create({
          data: {
            name: clientInfo.name || 'Client',
            email: clientInfo.email,
            phone: clientInfo.phone || '',
            password: `temp_${Date.now()}`, // Mot de passe temporaire
            role: 'client'
          }
        });
      } else {
        // Mettre à jour les infos si nécessaire
        if ((clientInfo.phone && !user.phone) || (clientInfo.name && user.name === 'Client')) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(clientInfo.phone && !user.phone ? { phone: clientInfo.phone } : {}),
              ...(clientInfo.name && user.name === 'Client' ? { name: clientInfo.name } : {})
            }
          });
        }
      }
      userId = user.id;
    } else {
      return NextResponse.json({ error: 'Informations client requises' }, { status: 400 });
    }

    // Vérifier qu'il n'y a pas déjà une réservation à ce créneau
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        date: new Date(date),
        time: time,
        status: {
          notIn: ['cancelled'] // Exclure seulement les réservations annulées
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json({ 
        error: 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.' 
      }, { status: 409 }); // 409 Conflict
    }

    // Vérifier qu'il y a au moins 15 minutes avant et après les autres réservations
    const allReservations = await prisma.reservation.findMany({
      where: {
        date: new Date(date),
        status: {
          notIn: ['cancelled']
        }
      }
    });

    // Convertir l'heure en minutes pour faciliter les calculs
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedTimeMinutes = timeToMinutes(time);

    // Vérifier chaque réservation existante
    for (const reservation of allReservations) {
      const existingTimeMinutes = timeToMinutes(reservation.time);
      const timeDifference = Math.abs(requestedTimeMinutes - existingTimeMinutes);
      
      // Si la différence est inférieure à 90 minutes (durée du soin + 15 min de préparation)
      if (timeDifference < 90 && timeDifference > 0) {
        const nextAvailableTime = new Date(date);
        nextAvailableTime.setHours(0, existingTimeMinutes + 90, 0, 0);
        const nextTimeStr = nextAvailableTime.toTimeString().slice(0, 5);
        
        return NextResponse.json({ 
          error: `Un soin est déjà prévu proche de cet horaire. Il faut au minimum 1h30 entre chaque soin (75 min de soin + 15 min de préparation). Prochain créneau disponible après ${reservation.time}: ${nextTimeStr}` 
        }, { status: 409 });
      }
    }

    // Recalculer le prix total basé sur les services de la base de données
    let calculatedPrice = 0;
    const dbServices = await prisma.service.findMany();
    
    for (const serviceId of services) {
      const service = dbServices.find(s => s.slug === serviceId);
      if (service) {
        // Vérifier si c'est un forfait ou un service simple
        const packageType = packages && packages[serviceId];
        if (packageType === 'forfait' && service.forfaitPrice) {
          calculatedPrice += service.forfaitPrice;
        } else {
          // Utiliser le prix promo s'il existe, sinon le prix normal
          calculatedPrice += service.promoPrice || service.price;
        }
      }
    }
    
    // Utiliser le prix calculé pour garantir l'exactitude
    const finalPrice = calculatedPrice > 0 ? calculatedPrice : totalPrice;
    
    console.log('Prix calculé:', calculatedPrice, 'Prix reçu:', totalPrice, 'Prix final:', finalPrice);
    
    // Déterminer si c'est un abonnement
    let isSubscription = false;
    if (packages) {
      const packagesObj = typeof packages === 'string' ? JSON.parse(packages) : packages;
      isSubscription = Object.values(packagesObj).includes('abonnement');
    }
    
    // Créer la réservation avec statut 'pending' (en attente de validation admin)
    const reservation = await prisma.reservation.create({
      data: {
        userId: userId,
        services: JSON.stringify(services),
        packages: packages ? JSON.stringify(packages) : '{}',
        isSubscription,
        date: new Date(date),
        time,
        notes,
        totalPrice: finalPrice,
        status: 'pending' // Toujours en attente de validation admin
      }
    });
    
    // Envoyer une notification WhatsApp à l'admin
    const adminPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+33683717050';
    if (user) {
      const adminMessage = `🔔 *Nouvelle réservation à valider*\n\n` +
        `Client: ${user.name}\n` +
        `Date: ${new Date(date).toLocaleDateString('fr-FR')}\n` +
        `Heure: ${time}\n` +
        `Services: ${services.join(', ')}\n` +
        `Total: ${totalPrice}€\n\n` +
        `Connectez-vous pour valider: https://laiaskin.fr/admin`;
      
      // Envoi asynchrone sans bloquer
      sendWhatsAppMessage({
        to: adminPhone,
        message: adminMessage
      }).catch(console.error);
    }

    // Envoyer l'email de confirmation au client
    if (user?.email) {
      const serviceNames = services.map((s: string) => {
        const serviceMap: any = {
          'hydronaissance': "Hydro'Naissance",
          'hydro-naissance': "Hydro'Naissance",
          'hydrocleaning': "Hydro'Cleaning",
          'hydro-cleaning': "Hydro'Cleaning", 
          'renaissance': 'Renaissance',
          'bb-glow': 'BB Glow',
          'led-therapie': 'LED Thérapie',
          'ledtherapy': 'LED Thérapie'
        };
        return serviceMap[s] || s;
      });

      try {
        const emailSent = await sendConfirmationEmail({
          to: user.email,
          clientName: user.name || 'Cliente',
          date: new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: time,
          services: serviceNames,
          totalPrice: totalPrice,
          reservationId: reservation.id
        });
        
        if (emailSent) {
          console.log('✅ Email de confirmation envoyé à:', user.email);
        } else {
          console.log('⚠️ Email non envoyé (service non configuré)');
        }
      } catch (error) {
        console.error('Erreur envoi email:', error);
        // Ne pas bloquer la réservation si l'email échoue
      }
    }

    // Incrémenter le nombre de séances et le montant total dépensé
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSpent: { increment: totalPrice },
        lastVisit: new Date()
      }
    });

    // Vérifier si le client a droit à une réduction
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    let loyaltyMessage = '';
    // TODO: Réactiver la logique de fidélité quand les champs seront disponibles
    
    return NextResponse.json({
      id: reservation.id,
      reservation,
      message: 'Votre demande de réservation a été enregistrée. Elle sera validée dans les plus brefs délais.' + loyaltyMessage
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: decoded.userId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(reservations.map(r => ({
      ...r,
      services: JSON.parse(r.services),
    })));
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}