// Utilitaires pour la gestion du temps et des créneaux

/**
 * Convertit une heure au format "HH:MM" en minutes depuis minuit
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convertit des minutes depuis minuit en format "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Vérifie si deux plages horaires se chevauchent
 * @param start1 Heure de début de la première plage
 * @param duration1 Durée de la première plage en minutes (incluant le temps de préparation)
 * @param start2 Heure de début de la deuxième plage
 * @param duration2 Durée de la deuxième plage en minutes
 */
export function hasTimeConflict(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number = 30 // Par défaut un créneau = 30 min
): boolean {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = start1Minutes + duration1;

  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = start2Minutes + duration2;

  // Vérifier si les plages se chevauchent
  return (
    (start1Minutes < end2Minutes && end1Minutes > start2Minutes) ||
    (start2Minutes < end1Minutes && end2Minutes > start1Minutes) ||
    (start1Minutes === start2Minutes) // Même heure de début
  );
}

/**
 * Récupère la durée d'un service à partir de ses informations
 * Ajoute automatiquement 15 minutes de préparation
 */
export function getServiceDurationWithPrep(service: any): number {
  // Si le service a une durée définie
  if (service?.duration) {
    return service.duration + 15; // Ajouter 15 min de préparation
  }

  // Durée par défaut : 60 min + 15 min de préparation
  return 75;
}

/**
 * Calcule la durée totale de plusieurs services
 * Inclut 15 minutes de préparation à la fin
 */
export function getTotalDuration(services: any[]): number {
  if (!services || services.length === 0) return 75; // Défaut: 60 + 15

  const servicesDuration = services.reduce((total, service) => {
    if (service?.duration) {
      return total + service.duration;
    }
    return total + 60; // Durée par défaut d'un service
  }, 0);

  return servicesDuration + 15; // Ajouter 15 min de préparation
}

/**
 * Vérifie si un créneau est disponible en tenant compte de la durée de la réservation
 */
export function isTimeSlotAvailable(
  slotTime: string,
  slotDate: Date,
  reservations: any[],
  dbServices?: any[]
): boolean {
  return !reservations.some(reservation => {
    // Vérifier que c'est la même date
    if (new Date(reservation.date).toDateString() !== slotDate.toDateString()) {
      return false;
    }

    // Ignorer les réservations annulées
    if (reservation.status === 'cancelled') {
      return false;
    }

    // Calculer la durée de la réservation existante
    let reservationDuration = 75; // Par défaut

    // Si on a accès aux services de la DB
    if (dbServices && reservation.services) {
      const services = typeof reservation.services === 'string'
        ? JSON.parse(reservation.services)
        : reservation.services;

      if (Array.isArray(services)) {
        reservationDuration = services.reduce((total, serviceId) => {
          const service = dbServices.find(s => s.slug === serviceId);
          return total + (service?.duration || 60);
        }, 15); // 15 min de préparation
      }
    }

    // Vérifier s'il y a conflit entre ce créneau et la réservation
    return hasTimeConflict(
      reservation.time,
      reservationDuration,
      slotTime,
      30 // Un créneau fait 30 minutes
    );
  });
}