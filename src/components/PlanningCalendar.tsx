"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, ChevronLeft, ChevronRight, Eye, CalendarDays, 
  Grid3x3, CalendarRange, User, Clock, Euro, Ban, Plus,
  X, Check, AlertCircle
} from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  time: string;
  userName?: string;
  userEmail: string;
  services: any[];
  serviceName?: string;
  serviceDuration?: number;
  status: string;
  totalPrice: number;
}

interface BlockedSlot {
  id: string;
  date: string;
  time?: string;
  allDay?: boolean;
  reason?: string;
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

interface PlanningCalendarProps {
  reservations: Reservation[];
  services?: Record<string, string>;
  dbServices?: any[];
  onNewReservation?: () => void;
  onDateClick?: (date: Date) => void;
}

export default function PlanningCalendar({ reservations, services, dbServices, onNewReservation, onDateClick }: PlanningCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Pour forcer le rafraîchissement des vues
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationDetail, setShowReservationDetail] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string[]>([]);
  const [dragDate, setDragDate] = useState<Date | null>(null);
  const [showQuickReservation, setShowQuickReservation] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: Date, time: string, endTime?: string, slots?: string[]} | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [localServices, setLocalServices] = useState<any[]>([]);
  const [isBlockMode, setIsBlockMode] = useState(false);

  useEffect(() => {
    fetchBlockedSlots();
  }, []);

  const fetchBlockedSlots = async () => {
    try {
      const response = await fetch('/api/admin/blocked-slots');
      if (response.ok) {
        const data = await response.json();
        setBlockedSlots(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux bloqués:', error);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

  // Helper pour obtenir le prix d'un service depuis la base de données
  const getServicePrice = (serviceSlug: string): number => {
    if (!dbServices) return 0;
    const service = dbServices.find(s => s.slug === serviceSlug);
    return service ? (service.promoPrice || service.price) : 0;
  };

  // Helper pour obtenir la durée d'un service en minutes
  const getServiceDuration = (serviceName: string, reservation?: any): number => {
    // Si la durée est déjà dans la réservation, l'utiliser
    if (reservation?.serviceDuration) {
      return reservation.serviceDuration;
    }
    
    // Sinon, chercher dans dbServices si disponible
    if (dbServices && reservation?.services && reservation.services.length > 0) {
      const serviceId = reservation.services[0];
      const service = dbServices.find(s => s.id === serviceId);
      if (service?.duration) {
        return service.duration;
      }
    }
    
    // Valeur par défaut
    return 60;
  };

  // Vérifier si un créneau est disponible (pas de chevauchement)
  const isSlotAvailable = (date: Date, startTime: string, duration: number): boolean => {
    const dateStr = formatDateLocal(date);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration + 15; // +15 min de préparation

    // Vérifier les réservations existantes
    const dayReservations = reservations.filter(r => 
      r.date.split('T')[0] === dateStr && r.status === 'confirmed'
    );

    for (const reservation of dayReservations) {
      const resStartMinutes = timeToMinutes(reservation.time);
      // Estimer la durée de la réservation existante (par défaut 60 min)
      const resEndMinutes = resStartMinutes + 60 + 15; // +15 min de préparation

      // Vérifier le chevauchement
      if ((startMinutes >= resStartMinutes && startMinutes < resEndMinutes) ||
          (endMinutes > resStartMinutes && endMinutes <= resEndMinutes) ||
          (startMinutes <= resStartMinutes && endMinutes >= resEndMinutes)) {
        return false;
      }
    }

    // Vérifier les créneaux bloqués
    const blockedInRange = blockedSlots.filter(slot => 
      slot.date === dateStr
    );

    for (const blocked of blockedInRange) {
      if (blocked.time) {
        const blockMinutes = timeToMinutes(blocked.time);
        if (startMinutes <= blockMinutes && blockMinutes < endMinutes) {
          return false;
        }
      }
    }

    return true;
  };

  // Convertir l'heure en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convertir les minutes en heure
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Navigation
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch(viewMode) {
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtenir les réservations pour une date (seulement les confirmées pour le calendrier)
  const getReservationsForDate = (date: Date) => {
    // Formater la date en YYYY-MM-DD en heure locale
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Récupérer les réservations à jour depuis le localStorage
    const storedReservations = JSON.parse(localStorage.getItem('admin_reservations') || '[]');
    const allReservations = [...reservations, ...storedReservations.filter((sr: any) => 
      !reservations.some(r => r.id === sr.id)
    )];
    
    return allReservations.filter(r => 
      r.date.split('T')[0] === dateStr && 
      r.status === 'confirmed' // Seulement les réservations confirmées dans le calendrier
    );
  };

  // Vérifier si une date est bloquée
  const isDateBlocked = (date: Date) => {
    // Formater la date en YYYY-MM-DD en heure locale
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return blockedSlots.some(slot => slot.date === dateStr && slot.allDay);
  };

  // Obtenir le nombre de créneaux bloqués pour une date
  const getBlockedSlotsCount = (date: Date) => {
    // Formater la date en YYYY-MM-DD en heure locale
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return blockedSlots.filter(slot => 
      slot.date === dateStr && !slot.allDay
    ).length;
  };

  // Fonction pour formater une date en YYYY-MM-DD en heure locale
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fonctions pour la sélection par glisser-déposer
  const handleMouseDown = (time: string, date: Date = currentDate) => {
    const dateStr = formatDateLocal(date);
    const hasReservation = reservations.some(r => 
      r.date.split('T')[0] === dateStr && r.time === time && r.status === 'confirmed'
    );
    const isBlocked = blockedSlots.some(slot => 
      slot.date === dateStr && slot.time === time
    );
    
    // Ne permettre le drag que si pas de réservation
    if (!hasReservation && !isDateBlocked(date)) {
      // En mode blocage on peut sélectionner tous les créneaux
      // En mode normal, seulement les créneaux non bloqués
      if (isBlockMode || !isBlocked) {
        setIsDragging(true);
        setDragStartTime(time);
        setDragDate(date);
        setSelectedTimeRange([time]);
      }
    }
  };

  const handleMouseEnter = (time: string) => {
    if (isDragging && dragStartTime) {
      const startIdx = timeSlots.indexOf(dragStartTime);
      const endIdx = timeSlots.indexOf(time);
      const minIdx = Math.min(startIdx, endIdx);
      const maxIdx = Math.max(startIdx, endIdx);
      
      const range = [];
      for (let i = minIdx; i <= maxIdx; i++) {
        range.push(timeSlots[i]);
      }
      
      setSelectedTimeRange(range);
    }
  };

  const handleMouseUp = async () => {
    if (isDragging && selectedTimeRange.length > 0 && dragDate) {
      if (isBlockMode) {
        // En mode blocage, bloquer directement les créneaux
        const dateStr = formatDateLocal(dragDate);
        const unblockedSlots = selectedTimeRange.filter(time => 
          !blockedSlots.some(s => s.date === dateStr && s.time === time)
        );
        
        if (unblockedSlots.length > 0) {
          try {
              const token = localStorage.getItem('token');
              for (const time of unblockedSlots) {
                const response = await fetch('/api/admin/blocked-slots', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    date: dateStr,
                    time: time,
                    reason: 'Bloqué via calendrier'
                  })
                });
                if (response.ok) {
                  const newBlock = await response.json();
                  setBlockedSlots(prev => [...prev, newBlock]);
                  setRefreshKey(prev => prev + 1);
                }
              }
            } catch (error) {
              console.error('Erreur lors du blocage:', error);
            }
        }
      } else {
        // En mode normal, ouvrir le modal de création
        setSelectedSlot({ 
          date: dragDate, 
          time: selectedTimeRange[0],
          endTime: selectedTimeRange[selectedTimeRange.length - 1],
          slots: selectedTimeRange
        });
        setShowQuickReservation(true);
      }
    }
    
    setIsDragging(false);
    setDragStartTime(null);
    setDragDate(null);
    setSelectedTimeRange([]);
  };

  // Bloquer/débloquer une journée
  const toggleDayBlock = async (date: Date) => {
    const dateStr = formatDateLocal(date);
    const dayBlocked = blockedSlots.find(slot => 
      slot.date === dateStr && slot.allDay
    );

    if (dayBlocked) {
      // Débloquer
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/blocked-slots?id=${dayBlocked.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setBlockedSlots(blockedSlots.filter(slot => slot.id !== dayBlocked.id));
          setRefreshKey(prev => prev + 1); // Forcer le rafraîchissement
        }
      } catch (error) {
        console.error('Erreur lors du déblocage:', error);
      }
    } else {
      // Bloquer
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: dateStr,
            allDay: true,
            reason: 'Jour fermé'
          })
        });
        
        if (response.ok) {
          const newBlock = await response.json();
          setBlockedSlots([...blockedSlots, newBlock]);
          setRefreshKey(prev => prev + 1); // Forcer le rafraîchissement
        }
      } catch (error) {
        console.error('Erreur lors du blocage:', error);
      }
    }
  };

  // Vue Jour
  const DayView = () => {
    const dayReservations = getReservationsForDate(currentDate);
    const dayBlocked = isDateBlocked(currentDate);

    return (
      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#2c3e50]">
            {currentDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          {isBlockMode && (
            <button
              onClick={() => toggleDayBlock(currentDate)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                dayBlocked 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Ban className="w-4 h-4" />
              {dayBlocked ? 'Débloquer la journée' : 'Bloquer la journée'}
            </button>
          )}
        </div>

        {dayBlocked ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Ban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Journée bloquée</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 gap-2" 
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {timeSlots.map(time => {
              const reservation = dayReservations.find(r => r.time === time);
              const isBlocked = blockedSlots.some(slot => 
                slot.date === formatDateLocal(currentDate) && 
                slot.time === time
              );
              const isSelected = selectedTimeRange.includes(time);
              
              // Vérifier si le créneau est dans une plage réservée (incluant temps de préparation)
              const timeMin = timeToMinutes(time);
              const isInReservedRange = dayReservations.some(r => {
                const resStart = timeToMinutes(r.time);
                // Récupérer la durée du service ou utiliser la durée par défaut
                const resDuration = r.serviceDuration || getServiceDuration(r.serviceName || '', r);
                const resEnd = resStart + resDuration + 15; // +15 min préparation
                return timeMin >= resStart && timeMin < resEnd;
              });

              // Calculer si ce créneau est le début d'une réservation et sa durée
              const isReservationStart = reservation !== undefined;
              let reservationSpan = 1;
              let showReservationBlock = false;
              
              if (isReservationStart && reservation) {
                const duration = reservation.serviceDuration || getServiceDuration(reservation.serviceName || '', reservation);
                reservationSpan = Math.ceil((duration + 15) / 30); // Nombre de créneaux de 30 min (incluant préparation)
                showReservationBlock = true;
              }

              // Ne pas afficher les créneaux qui sont dans la continuité d'une réservation
              if (!showReservationBlock && isInReservedRange && !reservation) {
                return (
                  <div
                    key={time}
                    className="p-3 rounded-lg border-2 bg-orange-50 border-orange-200 cursor-not-allowed opacity-75 select-none"
                  >
                    <div className="flex items-center justify-between text-gray-500">
                      <span className="text-sm font-medium">{time}</span>
                      <span className="text-xs">Occupé</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={time}
                  className={`relative ${showReservationBlock ? '' : 'p-3'} rounded-lg border-2 transition-all select-none ${
                    reservation 
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer' 
                      : isInReservedRange
                      ? 'bg-orange-50 border-orange-200 cursor-not-allowed opacity-75'
                      : isBlocked
                      ? 'bg-red-100 border-red-300 hover:bg-red-200 cursor-pointer'
                      : isSelected
                      ? 'bg-yellow-100 border-yellow-400 cursor-pointer'
                      : 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                  } ${showReservationBlock ? `row-span-${reservationSpan}` : ''}`}
                  style={showReservationBlock ? {
                    gridRow: `span ${reservationSpan}`,
                    minHeight: `${reservationSpan * 60}px`
                  } : {}}
                  onMouseDown={() => !reservation && handleMouseDown(time)}
                  onMouseEnter={() => handleMouseEnter(time)}
                  onClick={async () => {
                    // Si on est en train de sélectionner, ne pas déclencher le click
                    if (isDragging) return;
                    
                    if (reservation) {
                      // Afficher les détails de la réservation
                      setSelectedReservation(reservation);
                      setShowReservationDetail(true);
                    } else if (isBlockMode) {
                      // En mode blocage
                      const dateStr = formatDateLocal(currentDate);
                      const slot = blockedSlots.find(s => 
                        s.date === dateStr && s.time === time
                      );
                      
                      if (isBlocked && slot) {
                        // Débloquer
                        try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`/api/admin/blocked-slots?id=${slot.id}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            if (response.ok) {
                              setBlockedSlots(prev => prev.filter(s => s.id !== slot.id));
                              setRefreshKey(prev => prev + 1); // Forcer le rafraîchissement
                            }
                          } catch (error) {
                            console.error('Erreur lors du déblocage:', error);
                          }
                      } else if (!isBlocked) {
                        // Bloquer
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch('/api/admin/blocked-slots', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              date: dateStr,
                              time: time,
                              reason: 'Bloqué via calendrier'
                            })
                          });
                          
                          if (response.ok) {
                            const newBlock = await response.json();
                            setBlockedSlots(prev => [...prev, newBlock]);
                            setRefreshKey(prev => prev + 1); // Forcer le rafraîchissement
                          }
                        } catch (error) {
                          console.error('Erreur lors du blocage:', error);
                        }
                      }
                    } else if (!isBlocked && !dayBlocked && selectedTimeRange.length === 0) {
                      // En mode normal, ouvrir le modal de création pour les créneaux disponibles
                      setSelectedSlot({ date: currentDate, time, slots: [time] });
                      setShowQuickReservation(true);
                    }
                  }}
                >
                  {showReservationBlock && reservation ? (
                    // Affichage étendu pour les réservations
                    <div className="p-3 h-full flex flex-col justify-between bg-gradient-to-b from-blue-100 to-blue-50">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[#2c3e50]">{time}</span>
                          <span className="text-xs text-blue-600">
                            {Math.floor((reservation.serviceDuration || getServiceDuration(reservation.serviceName || '', reservation)) / 60)}h
                            {((reservation.serviceDuration || getServiceDuration(reservation.serviceName || '', reservation)) % 60) > 0 ? 
                              `${(reservation.serviceDuration || getServiceDuration(reservation.serviceName || '', reservation)) % 60}min` : ''}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-700" />
                            <span className="text-sm font-semibold text-blue-800">
                              {reservation.userName}
                            </span>
                          </div>
                          <div className="text-xs text-blue-700">
                            {reservation.serviceName || reservation.services?.[0]?.name || reservation.service || 'Service'}
                          </div>
                          <div className="text-sm font-semibold text-blue-900">
                            {reservation.totalPrice}€
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Affichage normal pour les créneaux sans réservation
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#2c3e50]">{time}</span>
                      {isBlocked ? (
                        <span className="text-sm text-red-700 font-medium flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Bloqué
                        </span>
                      ) : isSelected ? (
                        <span className="text-sm text-yellow-600">Sélectionné</span>
                      ) : (
                        <span className="text-sm text-green-600">Disponible</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Vue Semaine
  const WeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    const [weekSelectedSlots, setWeekSelectedSlots] = useState<{date: string, time: string}[]>([]);

    const handleWeekMouseDown = (time: string, date: Date) => {
      if (!isBlockMode) return; // Seulement en mode blocage
      
      const dateStr = formatDateLocal(date);
      const hasReservation = reservations.some(r => 
        r.date.split('T')[0] === dateStr && r.time === time && r.status === 'confirmed'
      );
      
      if (!hasReservation && !isDateBlocked(date)) {
        setIsDragging(true);
        setDragStartTime(time);
        setDragDate(date);
        setWeekSelectedSlots([{date: dateStr, time}]);
      }
    };

    const handleWeekMouseEnter = (time: string, date: Date) => {
      if (isDragging && dragStartTime && dragDate && isBlockMode) {
        const sameDateStr = formatDateLocal(dragDate);
        const currentDateStr = formatDateLocal(date);
        
        // Permettre seulement la sélection sur la même journée
        if (sameDateStr === currentDateStr) {
          const startIdx = timeSlots.indexOf(dragStartTime);
          const endIdx = timeSlots.indexOf(time);
          const minIdx = Math.min(startIdx, endIdx);
          const maxIdx = Math.max(startIdx, endIdx);
          
          const newSelection = [];
          for (let i = minIdx; i <= maxIdx; i++) {
            newSelection.push({date: sameDateStr, time: timeSlots[i]});
          }
          
          setWeekSelectedSlots(newSelection);
        }
      }
    };

    const handleWeekMouseUp = async () => {
      if (isDragging && weekSelectedSlots.length > 0 && isBlockMode) {
        const dateStr = weekSelectedSlots[0].date;
        const date = new Date(dateStr + 'T12:00:00');
        const dateFormatted = date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
        
        const startTime = weekSelectedSlots[0].time;
        const endTime = weekSelectedSlots[weekSelectedSlots.length - 1].time;
        
        // Bloquer directement sans confirmation
        if (true) {
          try {
            const token = localStorage.getItem('token');
            
            for (const slot of weekSelectedSlots) {
              const existingBlock = blockedSlots.find(s => s.date === slot.date && s.time === slot.time);
              
              if (!existingBlock) {
                const response = await fetch('/api/admin/blocked-slots', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    date: slot.date,
                    time: slot.time,
                    reason: 'Plage horaire bloquée'
                  })
                });
                
                if (response.ok) {
                  const newBlock = await response.json();
                  setBlockedSlots(prev => [...prev, newBlock]);
                  setRefreshKey(prev => prev + 1);
                }
              }
            }
          } catch (error) {
            console.error('Erreur lors du blocage:', error);
          }
        }
      }
      
      setIsDragging(false);
      setDragStartTime(null);
      setDragDate(null);
      setWeekSelectedSlots([]);
    };

    return (
      <div className="bg-white rounded-xl p-4" onMouseUp={handleWeekMouseUp} onMouseLeave={handleWeekMouseUp}>
        <div className="grid grid-cols-8 gap-1 text-sm">
          <div className="font-semibold text-[#2c3e50] p-2">Heure</div>
          {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + dayOffset);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayReservations = getReservationsForDate(date);
            const dayBlocked = isDateBlocked(date);

            return (
              <div 
                key={dayOffset}
                className={`font-semibold text-center p-2 cursor-pointer hover:bg-[#d4b5a0]/10 ${
                  isToday ? 'bg-[#d4b5a0]/20' : ''
                } ${dayBlocked ? 'bg-red-100 border-red-300' : ''}`}
                onClick={() => {
                  if (isBlockMode) {
                    toggleDayBlock(date);
                  } else if (onDateClick) {
                    onDateClick(date);
                  } else {
                    // En mode normal, ouvrir le détail de la journée
                    setSelectedDate(date);
                    setShowDayDetail(true);
                  }
                }}
              >
                <div className="text-[#2c3e50]">
                  {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${isToday ? 'text-[#d4b5a0] font-bold' : ''}`}>
                  {date.getDate()}
                </div>
                {dayReservations.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {dayReservations.length} RDV
                  </div>
                )}
              </div>
            );
          })}

          {timeSlots.map(time => (
            <>
              <div key={`time-${time}`} className="text-[#2c3e50] p-2 border-t">
                {time}
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + dayOffset);
                const reservation = getReservationsForDate(date).find(r => r.time === time);
                const dateStr = formatDateLocal(date);
                const isBlocked = blockedSlots.some(slot => 
                  slot.date === dateStr && 
                  (slot.allDay || slot.time === time)
                );
                const isSelected = weekSelectedSlots.some(s => s.date === dateStr && s.time === time);

                return (
                  <div
                    key={`${dayOffset}-${time}`}
                    className={`p-1 border-t text-xs cursor-pointer transition-all select-none ${
                      reservation 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : isBlocked
                        ? 'bg-red-100 hover:bg-red-200 border-red-300'
                        : isSelected
                        ? 'bg-yellow-100 border-yellow-400'
                        : 'hover:bg-green-100'
                    }`}
                    onMouseDown={() => isBlockMode && !reservation && !isBlocked && handleWeekMouseDown(time, date)}
                    onMouseEnter={() => handleWeekMouseEnter(time, date)}
                    onClick={async () => {
                      if (isDragging) return;
                      
                      if (reservation) {
                        // Afficher les détails de la réservation
                        setSelectedReservation(reservation);
                        setShowReservationDetail(true);
                      } else if (isBlockMode) {
                        // En mode blocage
                        const slot = blockedSlots.find(s => 
                          s.date === dateStr && (s.allDay || s.time === time)
                        );
                        
                        if (slot && !slot.allDay) {
                          // Débloquer le créneau
                          try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(`/api/admin/blocked-slots?id=${slot.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              if (response.ok) {
                                setBlockedSlots(prev => prev.filter(s => s.id !== slot.id));
                                setRefreshKey(prev => prev + 1);
                              }
                            } catch (error) {
                              console.error('Erreur lors du déblocage:', error);
                            }
                        } else if (!slot) {
                          // Bloquer le créneau
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch('/api/admin/blocked-slots', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                date: dateStr,
                                time: time,
                                reason: 'Bloqué via calendrier'
                              })
                            });
                              
                            if (response.ok) {
                              const newBlock = await response.json();
                              setBlockedSlots(prev => [...prev, newBlock]);
                              setRefreshKey(prev => prev + 1);
                            }
                          } catch (error) {
                            console.error('Erreur lors du blocage:', error);
                          }
                        }
                      } else {
                        // En mode normal, ouvrir le formulaire de création
                        // (même si le créneau est bloqué, on peut vouloir voir le détail)
                        if (!isBlocked) {
                          setSelectedSlot({ 
                            date: date, 
                            time: time,
                            slots: [time]
                          });
                          setShowQuickReservation(true);
                        }
                      }
                    }}
                  >
                    {reservation && (
                      <div className="truncate">
                        <p className="font-semibold text-blue-900">
                          {reservation.userName?.split(' ')[0]}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    );
  };

  // Vue Mois
  const MonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
    
    const [monthDragging, setMonthDragging] = useState(false);
    const [selectedDays, setSelectedDays] = useState<Date[]>([]);
    const [dragStartDate, setDragStartDate] = useState<Date | null>(null);

    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const handleMonthMouseDown = (date: Date) => {
      const isCurrentMonth = date.getMonth() === month;
      if (isCurrentMonth && !isDateBlocked(date) && isBlockMode) {
        setMonthDragging(true);
        setDragStartDate(date);
        setSelectedDays([date]);
      }
    };

    const handleMonthMouseEnter = (date: Date) => {
      if (monthDragging && dragStartDate) {
        const isCurrentMonth = date.getMonth() === month;
        if (isCurrentMonth) {
          const start = new Date(Math.min(dragStartDate.getTime(), date.getTime()));
          const end = new Date(Math.max(dragStartDate.getTime(), date.getTime()));
          
          const selection = [];
          const current = new Date(start);
          
          while (current <= end) {
            if (current.getMonth() === month && !isDateBlocked(current)) {
              selection.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
          }
          
          setSelectedDays(selection);
        }
      }
    };

    const handleMonthMouseUp = async () => {
      if (monthDragging && selectedDays.length > 0 && isBlockMode) {
        const startDate = selectedDays[0];
        const endDate = selectedDays[selectedDays.length - 1];
        
        // Bloquer directement en mode blocage
        if (isBlockMode) {
          try {
            const token = localStorage.getItem('token');
            
            for (const day of selectedDays) {
              const dateStr = formatDateLocal(day);
              const existingBlock = blockedSlots.find(s => s.date === dateStr && s.allDay);
              
              if (!existingBlock) {
                const response = await fetch('/api/admin/blocked-slots', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    date: dateStr,
                    allDay: true,
                    reason: 'Journée bloquée'
                  })
                });
                
                if (response.ok) {
                  const newBlock = await response.json();
                  setBlockedSlots(prev => [...prev, newBlock]);
                  setRefreshKey(prev => prev + 1);
                }
              }
            }
          } catch (error) {
            console.error('Erreur lors du blocage:', error);
          }
        }
      }
      
      setMonthDragging(false);
      setDragStartDate(null);
      setSelectedDays([]);
    };

    return (
      <div className="bg-white rounded-xl p-6" onMouseUp={handleMonthMouseUp} onMouseLeave={handleMonthMouseUp}>
        <div className="grid grid-cols-7 gap-1">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center font-semibold text-[#2c3e50] p-2">
              {day}
            </div>
          ))}
          
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === new Date().toDateString();
            const dayReservations = getReservationsForDate(date);
            const dayBlocked = isDateBlocked(date);
            const blockedCount = getBlockedSlotsCount(date);
            const isDaySelected = selectedDays.some(d => d.toDateString() === date.toDateString());

            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all select-none ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' :
                  isToday ? 'bg-[#d4b5a0]/20 border-[#d4b5a0]' :
                  dayBlocked ? 'bg-red-100 border-red-300' :
                  isDaySelected ? 'bg-yellow-100 border-yellow-400' :
                  'bg-white hover:bg-[#fdfbf7]'
                } ${dayReservations.length > 0 ? 'border-blue-200' : 'border-gray-200'}`}
                onMouseDown={() => handleMonthMouseDown(date)}
                onMouseEnter={() => handleMonthMouseEnter(date)}
                onClick={() => {
                  if (!monthDragging) {
                    if (isBlockMode) {
                      // En mode blocage, bloquer/débloquer le jour
                      toggleDayBlock(date);
                    } else {
                      // En mode normal, ouvrir le détail du jour
                      setSelectedDate(date);
                      setShowDayDetail(true);
                    }
                  }
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-[#d4b5a0]' : ''}`}>
                    {date.getDate()}
                  </span>
                  {dayBlocked && <Ban className="w-4 h-4 text-red-600" />}
                </div>
                
                {dayBlocked ? (
                  <div className="text-xs">
                    <div className="bg-red-500 text-white px-1 py-0.5 rounded font-medium">
                      BLOQUÉ
                    </div>
                  </div>
                ) : dayReservations.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                      {dayReservations.length} RDV
                    </div>
                  </div>
                )}
                
                {blockedCount > 0 && !dayBlocked && (
                  <div className="text-xs mt-1">
                    <div className="bg-red-100 text-red-600 px-1 py-0.5 rounded">
                      {blockedCount} bloqué{blockedCount > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Vue Année
  const YearView = () => {
    const year = currentDate.getFullYear();
    const months = [];
    let yearTotalReservations = 0;
    let yearTotalBlocked = 0;
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      let totalReservations = 0;
      let totalBlocked = 0;
      
      // Compter les réservations et jours bloqués du mois
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        totalReservations += getReservationsForDate(date).length;
        if (isDateBlocked(date)) totalBlocked++;
      }
      
      yearTotalReservations += totalReservations;
      yearTotalBlocked += totalBlocked;
      
      months.push({
        date: monthDate,
        reservations: totalReservations,
        blocked: totalBlocked
      });
    }

    return (
      <div className="bg-white rounded-xl p-6">
        {/* Récapitulatif de l'année */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-lg">
          <h3 className="text-lg font-bold text-[#2c3e50] mb-2">
            Année {year}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-[#2c3e50]">
                <span className="font-semibold">{yearTotalReservations}</span> réservation{yearTotalReservations !== 1 ? 's' : ''} au total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              <span className="text-[#2c3e50]">
                <span className="font-semibold">{yearTotalBlocked}</span> jour{yearTotalBlocked !== 1 ? 's' : ''} bloqué{yearTotalBlocked !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {months.map((monthData, index) => {
            const isCurrentMonth = monthData.date.getMonth() === new Date().getMonth() && 
                                  year === new Date().getFullYear();
            
            return (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isCurrentMonth 
                    ? 'bg-[#d4b5a0]/10 border-[#d4b5a0]' 
                    : 'border-gray-200 hover:border-[#d4b5a0]/50'
                }`}
                onClick={() => {
                  setCurrentDate(monthData.date);
                  setViewMode('month');
                }}
              >
                <h4 className="font-semibold text-[#2c3e50] mb-2">
                  {monthData.date.toLocaleDateString('fr-FR', { month: 'long' })}
                </h4>
                
                {monthData.reservations > 0 && (
                  <div className="text-sm text-blue-600 mb-1">
                    {monthData.reservations} réservations
                  </div>
                )}
                
                {monthData.blocked > 0 && (
                  <div className="text-sm text-gray-600">
                    {monthData.blocked} jour{monthData.blocked > 1 ? 's' : ''} bloqué{monthData.blocked > 1 ? 's' : ''}
                  </div>
                )}
                
                {monthData.reservations === 0 && monthData.blocked === 0 && (
                  <div className="text-sm text-gray-400">
                    Aucune activité
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Sélecteur de vue et mode blocage */}
          <div className="flex gap-2 items-center">
            <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                viewMode === 'day' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                viewMode === 'week' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                viewMode === 'month' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Mois
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                viewMode === 'year' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Année
            </button>
            </div>

            {/* Bouton Mode Blocage */}
            <div className="border-l pl-4 ml-2">
              <button
                onClick={() => setIsBlockMode(!isBlockMode)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium ${
                  isBlockMode 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Ban className="w-4 h-4" />
                {isBlockMode ? 'Mode Blocage Actif' : 'Mode Blocage'}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigatePeriod('prev')}
              className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#2c3e50]" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-[#d4b5a0]/10 text-[#2c3e50] rounded-lg hover:bg-[#d4b5a0]/20 transition-colors"
            >
              Aujourd'hui
            </button>
            
            <button
              onClick={() => navigatePeriod('next')}
              className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#2c3e50]" />
            </button>
          </div>

          {/* Titre de la période */}
          <div className="text-xl font-bold text-[#2c3e50]">
            {viewMode === 'day' && currentDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
            {viewMode === 'week' && `Semaine du ${currentDate.toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long' 
            })}`}
            {viewMode === 'month' && currentDate.toLocaleDateString('fr-FR', { 
              month: 'long', 
              year: 'numeric' 
            })}
            {viewMode === 'year' && currentDate.getFullYear()}
          </div>

          {/* Bouton nouvelle réservation */}
          <button
            onClick={onNewReservation}
            className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle réservation
          </button>
        </div>
      </div>

      {/* Vue sélectionnée */}
      {viewMode === 'day' && <DayView key={`day-${refreshKey}`} />}
      {viewMode === 'week' && <WeekView key={`week-${refreshKey}`} />}
      {viewMode === 'month' && <MonthView key={`month-${refreshKey}`} />}
      {viewMode === 'year' && <YearView key={`year-${refreshKey}`} />}

      {/* Modal détail jour (depuis vue mois) */}
      {showDayDetail && selectedDate && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Si on clique sur le fond (backdrop)
            if (e.target === e.currentTarget) {
              setShowDayDetail(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2c3e50]">
                {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </h3>
              <button
                onClick={() => setShowDayDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Boutons d'action */}
            <div className="mb-4 space-y-2">
              <button
                onClick={() => {
                  // Ouvrir directement le modal de création pour cette date à 09h00
                  setShowDayDetail(false);
                  setSelectedSlot({ 
                    date: selectedDate, 
                    time: '09:00',
                    slots: ['09:00']
                  });
                  setShowQuickReservation(true);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer une nouvelle réservation
              </button>
              
              <button
                onClick={() => {
                  setShowDayDetail(false);
                  // Ouvrir la vue jour pour cette date
                  setCurrentDate(selectedDate);
                  setViewMode('day');
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Voir le détail de la journée
              </button>
            </div>
            
            {/* Afficher les détails du jour sélectionné */}
            <div className="space-y-2">
              {getReservationsForDate(selectedDate).map(reservation => (
                <div 
                  key={reservation.id} 
                  className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setShowReservationDetail(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#2c3e50]">
                        {reservation.time} - {reservation.userName}
                      </p>
                      <p className="text-sm text-[#2c3e50]/70">
                        {reservation.totalPrice}€
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              ))}
              
              {getReservationsForDate(selectedDate).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Aucune réservation pour ce jour
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal détail réservation */}
      {showReservationDetail && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2c3e50]">
                Détails de la réservation
              </h3>
              <button
                onClick={() => {
                  setShowReservationDetail(false);
                  setSelectedReservation(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informations client */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <h4 className="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#d4b5a0]" />
                  Informations client
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Nom:</span>
                    <span className="font-medium">{selectedReservation.userName || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Email:</span>
                    <span className="font-medium">{selectedReservation.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Date et heure */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <h4 className="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#d4b5a0]" />
                  Date et heure
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedReservation.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Heure:</span>
                    <span className="font-medium">{selectedReservation.time}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <h4 className="font-semibold text-[#2c3e50] mb-3">Services réservés</h4>
                <div className="space-y-2">
                  {selectedReservation.services && selectedReservation.services.length > 0 ? (
                    selectedReservation.services.map((service: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{service.name || service}</span>
                        {service.price && <span className="font-medium">{service.price}€</span>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#2c3e50]/70">Aucun service spécifié</p>
                  )}
                </div>
              </div>

              {/* Prix et statut */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[#2c3e50]">Prix total:</span>
                  <span className="text-xl font-bold text-[#d4b5a0]">{selectedReservation.totalPrice}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#2c3e50]">Statut:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedReservation.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700'
                      : selectedReservation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : selectedReservation.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedReservation.status === 'confirmed' && 'Confirmée'}
                    {selectedReservation.status === 'pending' && 'En attente'}
                    {selectedReservation.status === 'cancelled' && 'Annulée'}
                    {selectedReservation.status === 'completed' && 'Terminée'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#d4b5a0]/20">
                <button
                  onClick={() => {
                    setShowReservationDetail(false);
                    setSelectedReservation(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#2c3e50] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
                {selectedReservation.status !== 'cancelled' && (
                  <button
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création rapide de réservation */}
      {showQuickReservation && selectedSlot && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Si on clique sur le fond (backdrop)
            if (e.target === e.currentTarget) {
              // Vérifier si des données ont été saisies
              const hasData = selectedService || clientName || clientEmail || clientPhone;
              
              if (hasData) {
                // Demander confirmation avant de fermer
                if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                  setShowQuickReservation(false);
                  setSelectedSlot(null);
                  setSelectedService('');
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                }
              } else {
                setShowQuickReservation(false);
                setSelectedSlot(null);
              }
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#2c3e50]">
                Nouvelle réservation
              </h3>
              <button
                onClick={() => {
                  setShowQuickReservation(false);
                  setSelectedSlot(null);
                  setSelectedService('');
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informations du créneau */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-[#2c3e50]">
                    {selectedSlot.date.toLocaleDateString('fr-FR', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-[#2c3e50]">
                    {selectedSlot.slots && selectedSlot.slots.length > 1 
                      ? `${selectedSlot.time} - ${selectedSlot.endTime} (${selectedSlot.slots.length * 30} minutes)`
                      : selectedSlot.time}
                  </span>
                </div>
              </div>

              {/* Sélection du service */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Prestation *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                >
                  <option value="">Sélectionner une prestation</option>
                  {dbServices && dbServices
                    .filter(s => s.active)
                    .map(service => (
                      <option key={service.slug} value={service.slug}>
                        {service.name} - {service.duration} min - {service.promoPrice || service.price}€
                      </option>
                    ))
                  }
                </select>
                {selectedSlot.slots && selectedSlot.slots.length > 1 && selectedService && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Durée sélectionnée : {selectedSlot.slots.length * 30} minutes
                  </p>
                )}
              </div>

              {/* Informations client */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Marie Dupont"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="marie.dupont@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t">
                <button
                  onClick={async () => {
                    if (!selectedService || !clientName || !clientEmail) {
                      alert('Veuillez remplir tous les champs obligatoires');
                      return;
                    }

                    // Vérifier la disponibilité
                    const serviceDuration = getServiceDuration(selectedService);
                    const totalDuration = selectedSlot.slots ? selectedSlot.slots.length * 30 : serviceDuration;
                    
                    if (!isSlotAvailable(selectedSlot.date, selectedSlot.time, totalDuration)) {
                      alert(`Ce créneau n'est pas disponible. Il y a un conflit avec une autre réservation ou le temps de préparation nécessaire (15 min).`);
                      return;
                    }

                    // Vérifier que la durée sélectionnée correspond au service
                    if (selectedSlot.slots && selectedSlot.slots.length > 1) {
                      const selectedDuration = selectedSlot.slots.length * 30;
                      if (Math.abs(selectedDuration - serviceDuration) > 30) {
                        if (!confirm(`⚠️ Attention: Le service ${selectedService} dure normalement ${serviceDuration} minutes mais vous avez sélectionné ${selectedDuration} minutes. Continuer quand même?`)) {
                          return;
                        }
                      }
                    }

                    try {
                      const token = localStorage.getItem('token');
                      const dateStr = formatDateLocal(selectedSlot.date);
                      
                      // Calculer l'heure de fin avec le temps de préparation
                      const endMinutes = timeToMinutes(selectedSlot.time) + totalDuration;
                      const endTime = minutesToTime(endMinutes);
                      
                      // Créer la réservation
                      const reservationData = {
                        date: dateStr,
                        time: selectedSlot.time,
                        endTime: endTime,
                        service: selectedService,
                        serviceDuration: totalDuration,
                        clientName,
                        clientEmail,
                        clientPhone,
                        status: 'confirmed',
                        totalPrice: getServicePrice(selectedService)
                      };

                      // Sauvegarder dans le localStorage
                      const existingReservations = JSON.parse(localStorage.getItem('admin_reservations') || '[]');
                      const newReservation = {
                        ...reservationData,
                        id: `res_${Date.now()}`,
                        userName: clientName,
                        userEmail: clientEmail,
                        services: [{ name: selectedService, price: getServicePrice(selectedService), duration: totalDuration }],
                        createdAt: new Date().toISOString()
                      };
                      existingReservations.push(newReservation);
                      localStorage.setItem('admin_reservations', JSON.stringify(existingReservations));

                      // Bloquer automatiquement les 15 minutes après pour la préparation
                      const prepStartMinutes = endMinutes;
                      const prepEndMinutes = prepStartMinutes + 15;
                      
                      if (prepEndMinutes <= 23 * 60) { // Si on ne dépasse pas 23h00
                        const prepTime = minutesToTime(prepStartMinutes);
                        await fetch('/api/admin/blocked-slots', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            date: dateStr,
                            time: prepTime,
                            reason: `Préparation après ${selectedService}`
                          })
                        });
                      }

                      // Rafraîchir les données sans recharger la page
                      await fetchBlockedSlots();
                      setShowQuickReservation(false);
                      setSelectedSlot(null);
                      setSelectedService('');
                      setClientName('');
                      setClientEmail('');
                      setClientPhone('');
                      setRefreshKey(prev => prev + 1); // Forcer le rafraîchissement des vues
                      alert('✅ Réservation créée avec succès!');
                    } catch (error) {
                      console.error('Erreur lors de la création:', error);
                      alert('Erreur lors de la création de la réservation');
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  disabled={!selectedService || !clientName || !clientEmail}
                >
                  <Check className="w-5 h-5" />
                  Créer la réservation
                </button>

                <button
                  onClick={() => {
                    setShowQuickReservation(false);
                    setSelectedSlot(null);
                    setSelectedService('');
                    setClientName('');
                    setClientEmail('');
                    setClientPhone('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper pour obtenir le format de date local
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}