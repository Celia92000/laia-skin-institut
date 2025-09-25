import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, time } = await request.json();
    
    // Normaliser la date pour éviter les problèmes de timezone
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // Créer une plage de dates pour la journée entière
    const startOfDay = new Date(checkDate);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Vérifier si le créneau est déjà pris
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        time: time,
        status: {
          notIn: ['cancelled'] // On ignore les réservations annulées
        }
      }
    });

    if (existingReservation) {
      console.log('Créneau déjà réservé:', date, time, 'Réservation:', existingReservation);
      return NextResponse.json({ 
        available: false, 
        message: 'Ce créneau est déjà réservé' 
      });
    }

    return NextResponse.json({ 
      available: true,
      message: 'Créneau disponible'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date requise' }, { status: 400 });
    }

    // Récupérer les créneaux bloqués par l'admin
    const blockedSlotsResponse = await fetch(`${request.url.replace('/api/availability', '/api/admin/blocked-slots')}`);
    let blockedSlots: any[] = [];
    if (blockedSlotsResponse.ok) {
      blockedSlots = await blockedSlotsResponse.json();
    }

    // Vérifier si toute la journée est bloquée
    const dayBlocked = blockedSlots.some(slot => 
      slot.date === date && slot.allDay
    );

    // Si toute la journée est bloquée, retourner tous les créneaux comme indisponibles
    if (dayBlocked) {
      const allSlots = [];
      for (let hour = 9; hour <= 23; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 23) {
          allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
      
      return NextResponse.json(
        allSlots.map(slot => ({
          time: slot,
          available: false,
          reason: 'Journée bloquée'
        }))
      );
    }

    // Normaliser la date pour éviter les problèmes de timezone
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const startOfDay = new Date(checkDate);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Récupérer toutes les réservations pour cette date
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['cancelled']
        }
      },
      select: {
        time: true,
        services: true
      }
    });

    // Créer une liste des créneaux occupés
    const bookedSlots = reservations.map(r => {
      const services = JSON.parse(r.services);
      // Calculer la durée en fonction des services
      let duration = 30; // durée minimale par défaut
      
      if (services.includes('hydro-naissance')) {
        duration = 90; // 1h30
      } else if (services.includes('hydro') || services.includes('renaissance')) {
        duration = 60; // 1h
      } else if (services.includes('bb-glow') || services.includes('led')) {
        duration = 30; // 30min
      }
      
      // Si plusieurs services, additionner les durées
      if (services.length > 1 && !services.includes('hydro-naissance')) {
        duration = services.length * 30; // approximation
      }
      
      return {
        time: r.time,
        duration: duration
      };
    });

    // Générer tous les créneaux de la journée (9h-23h par tranches de 30min)
    const allSlots = [];
    for (let hour = 9; hour <= 23; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 23) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    // Marquer les créneaux comme disponibles ou non
    const availability = allSlots.map(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotMinutes = slotHour * 60 + slotMinute;
      
      // Vérifier si ce créneau est bloqué par une réservation
      const isBooked = bookedSlots.some(booked => {
        const [bookedHour, bookedMinute] = booked.time.split(':').map(Number);
        const bookedStartMinutes = bookedHour * 60 + bookedMinute;
        const bookedEndMinutes = bookedStartMinutes + booked.duration;
        
        // Le créneau est occupé si il chevauche avec une réservation existante
        return slotMinutes >= bookedStartMinutes && slotMinutes < bookedEndMinutes;
      });
      
      // Vérifier si ce créneau est bloqué par l'admin
      const isBlockedByAdmin = blockedSlots.some(blocked => 
        blocked.date === date && blocked.time === slot
      );
      
      return {
        time: slot,
        available: !isBooked && !isBlockedByAdmin,
        reason: isBlockedByAdmin ? 'Créneau bloqué' : isBooked ? 'Déjà réservé' : null,
        // Suggérer la pause déjeuner entre 12h et 14h si pas de réservation
        suggestedBreak: (slotHour === 12 || slotHour === 13) && !isBooked && !isBlockedByAdmin
      };
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}