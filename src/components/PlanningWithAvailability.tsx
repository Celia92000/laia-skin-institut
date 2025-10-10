"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import { 
  Calendar, Clock, User, X, Plus, Ban, Lock, Unlock, 
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle 
} from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  time: string;
  userName?: string;
  userEmail: string;
  services: any[];
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

interface PlanningWithAvailabilityProps {
  reservations: Reservation[];
  onNewReservation?: () => void;
}

export default function PlanningWithAvailability({ reservations, onNewReservation }: PlanningWithAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockingSlot, setBlockingSlot] = useState<{ date: string; time?: string; allDay?: boolean }>({ date: '' });
  const [blockReason, setBlockReason] = useState('');

  // Charger les créneaux bloqués depuis l'API
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

  const daysInWeek = 7;
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);

  const isSlotBlocked = (date: Date, time: string) => {
    const dateStr = formatDateLocal(date);
    return blockedSlots.some(slot =>
      slot.date === dateStr && (slot.allDay || slot.time === time)
    );
  };

  const isSlotOccupied = (date: Date, time: string) => {
    const dateStr = formatDateLocal(date);
    return reservations.some(r =>
      formatDateLocal(r.date) === dateStr &&
      r.time === time &&
      r.status !== 'cancelled'
    );
  };

  const getReservationForSlot = (date: Date, time: string) => {
    const dateStr = formatDateLocal(date);
    return reservations.find(r =>
      formatDateLocal(r.date) === dateStr &&
      r.time === time &&
      r.status !== 'cancelled'
    );
  };

  const handleSlotClick = async (date: Date, time: string) => {
    const dateStr = formatDateLocal(date);
    
    // Si le créneau a une réservation, ne rien faire
    if (isSlotOccupied(date, time)) {
      return;
    }

    // Si le créneau est bloqué, le débloquer
    if (isSlotBlocked(date, time)) {
      const slotToRemove = blockedSlots.find(slot => 
        slot.date === dateStr && (slot.time === time || slot.allDay)
      );
      
      if (slotToRemove) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/admin/blocked-slots?id=${slotToRemove.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setBlockedSlots(blockedSlots.filter(slot => slot.id !== slotToRemove.id));
          }
        } catch (error) {
          console.error('Erreur lors du déblocage:', error);
        }
      }
      return;
    }

    // Sinon, ouvrir le modal pour bloquer
    setBlockingSlot({ date: dateStr, time });
    setShowBlockModal(true);
  };

  const handleDayBlock = async (date: Date) => {
    const dateStr = formatDateLocal(date);
    
    // Si le jour est déjà entièrement bloqué, le débloquer
    const dayBlocked = blockedSlots.find(slot => 
      slot.date === dateStr && slot.allDay
    );
    
    if (dayBlocked) {
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
        }
      } catch (error) {
        console.error('Erreur lors du déblocage:', error);
      }
    } else {
      setBlockingSlot({ date: dateStr, allDay: true });
      setShowBlockModal(true);
    }
  };

  const confirmBlock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: blockingSlot.date,
          time: blockingSlot.time,
          allDay: blockingSlot.allDay,
          reason: blockReason || 'Indisponible'
        })
      });
      
      if (response.ok) {
        const newBlock = await response.json();
        setBlockedSlots([...blockedSlots, newBlock]);
      }
    } catch (error) {
      console.error('Erreur lors du blocage:', error);
    }
    
    setShowBlockModal(false);
    setBlockingSlot({ date: '' });
    setBlockReason('');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-6">
      {/* En-tête avec navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#2c3e50]" />
          </button>
          <h3 className="text-xl font-bold text-[#2c3e50]">
            Semaine du {startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </h3>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#2c3e50]" />
          </button>
        </div>
        
        {/* Légende */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-[#2c3e50]/70">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-[#2c3e50]/70">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-[#2c3e50]/70">Bloqué</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Cliquez sur un créneau pour le bloquer/débloquer. Cliquez sur l'en-tête d'un jour pour bloquer toute la journée.
        </p>
      </div>

      {/* Tableau planning */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 text-sm font-semibold text-[#2c3e50] border-b border-[#d4b5a0]/20">
                Heure
              </th>
              {Array.from({ length: daysInWeek }, (_, i) => {
                const currentDate = new Date(startOfWeek);
                currentDate.setDate(startOfWeek.getDate() + i);
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const dayBlocked = blockedSlots.some(slot =>
                  slot.date === formatDateLocal(currentDate) && slot.allDay
                );
                
                return (
                  <th 
                    key={i} 
                    className={`p-2 text-sm font-semibold border-b border-[#d4b5a0]/20 cursor-pointer hover:bg-[#d4b5a0]/5 transition-colors ${
                      isToday ? 'bg-[#d4b5a0]/10' : ''
                    } ${dayBlocked ? 'bg-gray-100' : ''}`}
                    onClick={() => handleDayBlock(currentDate)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[#2c3e50]">
                        {currentDate.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                      <span className={`text-lg ${isToday ? 'text-[#d4b5a0] font-bold' : 'text-[#2c3e50]'}`}>
                        {currentDate.getDate()}
                      </span>
                      {dayBlocked && (
                        <Lock className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} className="hover:bg-[#fdfbf7] transition-colors">
                <td className="p-2 text-sm font-medium text-[#2c3e50] border-b border-[#d4b5a0]/10">
                  {time}
                </td>
                {Array.from({ length: daysInWeek }, (_, i) => {
                  const currentDate = new Date(startOfWeek);
                  currentDate.setDate(startOfWeek.getDate() + i);
                  const isBlocked = isSlotBlocked(currentDate, time);
                  const reservation = getReservationForSlot(currentDate, time);
                  const isToday = currentDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <td 
                      key={i} 
                      className={`p-2 border-b border-[#d4b5a0]/10 cursor-pointer transition-all ${
                        reservation ? 'bg-blue-100 hover:bg-blue-200' :
                        isBlocked ? 'bg-gray-100 hover:bg-gray-200' :
                        'bg-green-50 hover:bg-green-100'
                      } ${isToday ? 'border-l-2 border-r-2 border-[#d4b5a0]' : ''}`}
                      onClick={() => handleSlotClick(currentDate, time)}
                    >
                      {reservation ? (
                        <div className="text-xs">
                          <p className="font-semibold text-blue-900 truncate">
                            {reservation.userName || 'Client'}
                          </p>
                          <p className="text-blue-700 truncate">
                            {reservation.totalPrice}€
                          </p>
                        </div>
                      ) : isBlocked ? (
                        <div className="flex items-center justify-center">
                          <Ban className="w-4 h-4 text-gray-500" />
                        </div>
                      ) : (
                        <div className="text-center text-xs text-green-600">
                          Libre
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de blocage */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
              Bloquer {blockingSlot.allDay ? 'la journée' : 'le créneau'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-[#2c3e50]/70 mb-2">
                {blockingSlot.allDay 
                  ? `Journée du ${new Date(blockingSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`
                  : `${new Date(blockingSlot.date).toLocaleDateString('fr-FR')} à ${blockingSlot.time}`
                }
              </p>
              
              <input
                type="text"
                placeholder="Raison (optionnel)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockingSlot({ date: '' });
                  setBlockReason('');
                }}
                className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmBlock}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg"
              >
                <Ban className="w-4 h-4 inline mr-2" />
                Bloquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}