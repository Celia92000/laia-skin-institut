import { prisma } from '@/lib/prisma';

export interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Vérifie si un créneau est disponible pour une date donnée
 */
export async function isSlotAvailable(date: Date, time: string): Promise<boolean> {
  // Normaliser la date à minuit
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // 1. Vérifier si la date est bloquée complètement
  const dayBlocked = await prisma.blockedSlot.findFirst({
    where: {
      date: normalizedDate,
      allDay: true
    }
  });

  if (dayBlocked) {
    return false;
  }

  // 2. Vérifier si ce créneau spécifique est bloqué
  const slotBlocked = await prisma.blockedSlot.findFirst({
    where: {
      date: normalizedDate,
      time: time,
      allDay: false
    }
  });

  if (slotBlocked) {
    return false;
  }

  // 3. Vérifier les horaires de travail
  const dayOfWeek = normalizedDate.getDay();
  const workingHours = await prisma.workingHours.findUnique({
    where: { dayOfWeek }
  });

  if (!workingHours || !workingHours.isOpen) {
    return false;
  }

  // Vérifier si le créneau est dans les horaires de travail
  const [slotHour, slotMinute] = time.split(':').map(Number);
  const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

  const slotMinutes = slotHour * 60 + slotMinute;
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
    return false;
  }

  // 4. Vérifier s'il y a déjà une réservation confirmée à ce créneau
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      date: normalizedDate,
      time: time,
      status: {
        in: ['confirmed', 'pending']
      }
    }
  });

  return !existingReservation;
}

/**
 * Récupère tous les créneaux disponibles pour une date donnée
 */
export async function getAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Vérifier si la journée est bloquée
  const dayBlocked = await prisma.blockedSlot.findFirst({
    where: {
      date: normalizedDate,
      allDay: true
    }
  });

  if (dayBlocked) {
    return [];
  }

  // Récupérer les horaires de travail
  const dayOfWeek = normalizedDate.getDay();
  const workingHours = await prisma.workingHours.findUnique({
    where: { dayOfWeek }
  });

  if (!workingHours || !workingHours.isOpen) {
    return [];
  }

  // Générer tous les créneaux possibles (toutes les heures)
  const slots: TimeSlot[] = [];
  const [startHour] = workingHours.startTime.split(':').map(Number);
  const [endHour] = workingHours.endTime.split(':').map(Number);

  for (let hour = startHour; hour < endHour; hour++) {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const available = await isSlotAvailable(normalizedDate, timeStr);
    slots.push({ time: timeStr, available });
  }

  return slots;
}

/**
 * Récupère toutes les dates bloquées pour un mois donné
 */
export async function getBlockedDatesForMonth(year: number, month: number): Promise<Date[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      },
      allDay: true
    }
  });

  return blockedSlots.map(slot => slot.date);
}

/**
 * Récupère les horaires de travail
 */
export async function getWorkingHours() {
  return prisma.workingHours.findMany({
    orderBy: { dayOfWeek: 'asc' }
  });
}