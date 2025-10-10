"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Sparkles,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { formatDateLocal } from "@/lib/date-utils";

// Heures d'ouverture
const businessHours = {
  start: 9,
  end: 19,
  slots: 30 // intervalles de 30 minutes
};

export default function AdminPlanning() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les réservations depuis l'API
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/admin/reservations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Transformer les données pour le format du calendrier
          const formattedReservations = data.map((r: any) => ({
            id: r.id,
            client: r.user?.name || 'Client inconnu',
            service: r.service?.name || 'Service inconnu',
            date: formatDateLocal(r.date), // Conversion UTC vers date locale
            heure: r.time,
            duree: r.service?.duration || 60,
            prix: r.service?.price || 0,
            status: r.status,
            telephone: r.user?.phone || '',
            email: r.user?.email || ''
          }));
          setReservations(formattedReservations);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Générer les créneaux horaires
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtenir les jours de la semaine
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedDate);

  // Vérifier si un créneau est occupé
  const isSlotOccupied = (date: string, time: string) => {
    return reservations.some(r => {
      if (r.date !== date) return false;
      const [resHour, resMin] = r.heure.split(':').map(Number);
      const [slotHour, slotMin] = time.split(':').map(Number);
      const resStart = resHour * 60 + resMin;
      const resEnd = resStart + r.duree;
      const slotTime = slotHour * 60 + slotMin;
      return slotTime >= resStart && slotTime < resEnd;
    });
  };

  // Obtenir la réservation pour un créneau
  const getReservationForSlot = (date: string, time: string) => {
    return reservations.find(r => r.date === date && r.heure === time);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#d4b5a0]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-serif font-semibold text-[#2c3e50]">LAIA SKIN Admin</span>
              </Link>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                Dashboard
              </Link>
              <Link href="/admin/planning" className="text-[#d4b5a0] font-semibold">
                Planning
              </Link>
              <Link href="/admin/reservations" className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                Réservations
              </Link>
              <Link href="/admin/clients" className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                Clients
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNewReservation(true)}
                className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle réservation
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded-lg ${viewMode === 'day' ? 'bg-[#fdfbf7] text-[#d4b5a0]' : 'text-[#2c3e50]/70 hover:bg-gray-50'}`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-lg ${viewMode === 'week' ? 'bg-[#fdfbf7] text-[#d4b5a0]' : 'text-[#2c3e50]/70 hover:bg-gray-50'}`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-lg ${viewMode === 'month' ? 'bg-[#fdfbf7] text-[#d4b5a0]' : 'text-[#2c3e50]/70 hover:bg-gray-50'}`}
                >
                  Mois
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                <Filter className="w-5 h-5" />
              </button>
              <button className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-serif font-semibold text-[#2c3e50]">
              {formatDate(selectedDate)}
            </h2>
            
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto mb-4"></div>
            <p className="text-[#2c3e50]/60">Chargement du planning...</p>
          </div>
        )}

        {/* Calendar Grid */}
        {!isLoading && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-4 bg-[#fdfbf7]">
              <CalendarIcon className="w-5 h-5 text-[#d4b5a0] mx-auto" />
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-4 text-center border-l border-gray-200 bg-[#fdfbf7]">
                <div className="font-semibold text-[#2c3e50]">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className="text-2xl font-serif text-[#d4b5a0]">
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-3 text-sm font-medium text-[#2c3e50]/70 bg-gray-50">
                  {time}
                </div>
                {weekDays.map((day, index) => {
                  const dateStr = formatDateLocal(day);
                  const reservation = getReservationForSlot(dateStr, time);
                  const isOccupied = isSlotOccupied(dateStr, time);
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 border-l border-gray-100 min-h-[60px] cursor-pointer transition-all ${
                        isOccupied 
                          ? 'bg-gradient-to-r from-[#d4b5a0]/20 to-[#c9a084]/20' 
                          : 'hover:bg-[#fdfbf7]'
                      }`}
                      onClick={() => {
                        if (reservation) {
                          setSelectedReservation(reservation);
                        } else if (!isOccupied) {
                          setShowNewReservation(true);
                        }
                      }}
                    >
                      {reservation && (
                        <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white p-2 rounded-lg text-xs">
                          <div className="font-semibold truncate">{reservation.client}</div>
                          <div className="truncate">{reservation.service}</div>
                          <div>{reservation.duree} min</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded"></div>
              <span className="text-[#2c3e50]/70">Réservation confirmée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span className="text-[#2c3e50]/70">Créneau disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-[#2c3e50]/70">En attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Détails Réservation */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedReservation(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-serif font-semibold text-[#2c3e50]">Détails de la réservation</h3>
              <button onClick={() => setSelectedReservation(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-[#2c3e50]/60">Client</span>
                <p className="font-semibold text-[#2c3e50]">{selectedReservation.client}</p>
              </div>
              <div>
                <span className="text-sm text-[#2c3e50]/60">Service</span>
                <p className="font-semibold text-[#2c3e50]">{selectedReservation.service}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-[#2c3e50]/60">Date</span>
                  <p className="font-semibold text-[#2c3e50]">{formatDate(new Date(selectedReservation.date))}</p>
                </div>
                <div>
                  <span className="text-sm text-[#2c3e50]/60">Heure</span>
                  <p className="font-semibold text-[#2c3e50]">{selectedReservation.heure}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-[#2c3e50]/60">Durée</span>
                  <p className="font-semibold text-[#2c3e50]">{selectedReservation.duree} min</p>
                </div>
                <div>
                  <span className="text-sm text-[#2c3e50]/60">Prix</span>
                  <p className="font-semibold text-[#d4b5a0]">{selectedReservation.prix}€</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-[#2c3e50]/60">Téléphone</span>
                <p className="font-semibold text-[#2c3e50]">{selectedReservation.telephone}</p>
              </div>
              <div>
                <span className="text-sm text-[#2c3e50]/60">Email</span>
                <p className="font-semibold text-[#2c3e50]">{selectedReservation.email}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                <Check className="w-4 h-4 inline mr-2" />
                Confirmer
              </button>
              <button className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-all">
                <X className="w-4 h-4 inline mr-2" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}