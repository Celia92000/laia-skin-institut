"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, Clock, User, Euro, Calendar, Grid3x3, List, CalendarDays, Mail, Phone } from "lucide-react";
import ReservationPaymentButton from './ReservationPaymentButton';
// import { servicePricing, formatPriceDetails } from "@/lib/pricing";

interface Reservation {
  id: string;
  date: string;
  time: string;
  userName?: string;
  userEmail?: string;
  phone?: string;
  services: string[];
  serviceName?: string; // Nom du service principal depuis la DB
  packages?: Record<string, string>;
  isSubscription?: boolean;
  totalPrice: number;
  status: string;
  notes?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}

interface AdminCalendarEnhancedProps {
  reservations: Reservation[];
  onDateSelect: (date: string) => void;
}

type ViewType = 'day' | 'week' | 'month' | 'year';

export default function AdminCalendarEnhanced({ reservations, onDateSelect }: AdminCalendarEnhancedProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');

  const services = {
    "hydro-naissance": "Hydro'Naissance",
    "hydro-cleaning": "Hydro'Cleaning",
    "renaissance": "Renaissance",
    "bb-glow": "BB Glow",
    "led-therapie": "LED Thérapie"
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const dayNamesFull = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  // Fonctions pour obtenir les réservations
  const getReservationsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = formatDateLocal(date);
    return reservations.filter(r => r.date.startsWith(dateStr));
  };

  const getTotalRevenueForDay = (date: Date | null) => {
    const dayReservations = getReservationsForDay(date);
    return dayReservations.reduce((sum, r) => sum + r.totalPrice, 0);
  };

  // Navigation
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch(viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onDateSelect(formatDateLocal(today));
  };

  // Obtenir les jours de la semaine actuelle
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Obtenir les jours du mois
  const getMonthDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay() || 7;
    
    const calendarDays: (Date | null)[] = [];
    
    for (let i = 1; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    
    return calendarDays;
  };

  // Obtenir les statistiques du mois pour la vue année
  const getMonthStats = (month: number) => {
    const monthReservations = reservations.filter(r => {
      const date = new Date(r.date);
      return date.getFullYear() === currentDate.getFullYear() && date.getMonth() === month;
    });
    
    return {
      count: monthReservations.length,
      revenue: monthReservations.reduce((sum, r) => sum + r.totalPrice, 0)
    };
  };

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(formatDateLocal(date));
    }
  };

  // Titre selon la vue
  const getTitle = () => {
    switch(viewType) {
      case 'day':
        return currentDate.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        const weekDays = getWeekDays();
        const start = weekDays[0].getDate();
        const end = weekDays[6].getDate();
        return `${start} - ${end} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'year':
        return currentDate.getFullYear().toString();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header avec sélecteur de vue */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('prev')}
            className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#2c3e50]" />
          </button>
          <h2 className="text-xl font-bold text-[#2c3e50] min-w-[250px] text-center">
            {getTitle()}
          </h2>
          <button
            onClick={() => navigate('next')}
            className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#2c3e50]" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sélecteur de vue */}
          <div className="flex bg-[#d4b5a0]/10 rounded-lg p-1">
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                viewType === 'day' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'text-[#2c3e50] hover:bg-[#d4b5a0]/20'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Jour
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                viewType === 'week' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'text-[#2c3e50] hover:bg-[#d4b5a0]/20'
              }`}
            >
              <List className="w-4 h-4" />
              Semaine
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                viewType === 'month' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'text-[#2c3e50] hover:bg-[#d4b5a0]/20'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Mois
            </button>
            <button
              onClick={() => setViewType('year')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                viewType === 'year' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'text-[#2c3e50] hover:bg-[#d4b5a0]/20'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Année
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-[#2c3e50] text-white rounded-lg hover:bg-[#1e2a38] transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Vue Jour */}
      {viewType === 'day' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[#2c3e50]">Planning du jour</h3>
              <span className="text-sm text-[#2c3e50]/60">
                {getReservationsForDay(currentDate).length} réservation(s)
              </span>
            </div>
            
            {getReservationsForDay(currentDate).length === 0 ? (
              <p className="text-center text-[#2c3e50]/50 py-8">Aucune réservation pour ce jour</p>
            ) : (
              <div className="space-y-3">
                {getReservationsForDay(currentDate)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(reservation => {
                    // S'assurer que services est un tableau
                    const servicesList = reservation.services && Array.isArray(reservation.services) 
                      ? reservation.services 
                      : [];
                    
                    // Si pas de services dans le tableau mais qu'il y a serviceName, l'utiliser
                    const serviceDetails = servicesList.length > 0 
                      ? servicesList.map(serviceId => {
                          const packageType = reservation.packages?.[serviceId] || 'single';
                          // const serviceInfo = servicePricing[serviceId as keyof typeof servicePricing];
                          // if (!serviceInfo) return null;
                          
                          let price = 70; // Prix par défaut
                          let label = '';
                          
                          return {
                            name: services[serviceId as keyof typeof services] || serviceId,
                            price,
                            label,
                            packageType
                          };
                        }).filter(Boolean)
                      : (reservation as any).serviceName 
                        ? [{
                            name: (reservation as any).serviceName,
                            price: reservation.totalPrice,
                            label: '',
                            packageType: 'single'
                          }]
                        : [];
                    
                    const statusColors = {
                      'pending': 'bg-yellow-100 text-yellow-700',
                      'confirmed': 'bg-green-100 text-green-700',
                      'completed': 'bg-blue-100 text-blue-700',
                      'cancelled': 'bg-red-100 text-red-700',
                      'no_show': 'bg-gray-100 text-gray-700'
                    };
                    
                    const statusLabels = {
                      'pending': 'En attente',
                      'confirmed': 'Confirmé',
                      'completed': 'Terminé',
                      'cancelled': 'Annulé',
                      'no_show': 'Absent'
                    };
                    
                    return (
                      <div key={reservation.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-[#d4b5a0]/10">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#d4b5a0]/10 p-2 rounded-lg">
                              <Clock className="w-5 h-5 text-[#d4b5a0]" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-[#2c3e50]">{reservation.time}</span>
                              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                                {statusLabels[reservation.status as keyof typeof statusLabels] || reservation.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</span>
                            {reservation.paymentStatus === 'paid' && (
                              <div className="text-xs text-green-600 font-medium mt-1">✓ Payé</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#2c3e50]/60" />
                            <span className="font-medium text-[#2c3e50]">{reservation.userName || 'Client'}</span>
                          </div>
                          
                          {reservation.userEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-[#2c3e50]/60" />
                              <span className="text-sm text-[#2c3e50]/80">{reservation.userEmail}</span>
                            </div>
                          )}
                          
                          {reservation.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[#2c3e50]/60" />
                              <span className="text-sm text-[#2c3e50]/80">{reservation.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t border-[#d4b5a0]/10 pt-3">
                          <div className="font-medium text-sm text-[#2c3e50] mb-2">Prestations :</div>
                          <div className="space-y-1">
                            {serviceDetails.map((detail, idx) => detail && (
                              <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-[#2c3e50]">{detail.name}</span>
                                  {detail.packageType === 'forfait' && (
                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                      Forfait
                                    </span>
                                  )}
                                  {reservation.isSubscription && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      Abo
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-[#d4b5a0]">{detail.price}€</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {reservation.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-600 font-medium mb-1">Notes :</div>
                            <div className="text-xs text-gray-700">{reservation.notes}</div>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-[#d4b5a0]/10">
                          <ReservationPaymentButton
                            reservationId={reservation.id}
                            amount={reservation.totalPrice}
                            serviceName={reservation.serviceName || reservation.services[0] || 'Prestation'}
                            paymentStatus={reservation.paymentStatus || 'unpaid'}
                            paymentMethod={reservation.paymentMethod}
                            onPaymentInitiated={() => {
                              // Rafraîchir les réservations après paiement
                              window.location.reload();
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-[#d4b5a0]/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#2c3e50]">Total du jour</span>
                <span className="text-xl font-bold text-[#d4b5a0]">
                  {getTotalRevenueForDay(currentDate)}€
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue Semaine */}
      {viewType === 'week' && (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[800px]">
            {getWeekDays().map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayReservations = getReservationsForDay(date);
              const revenue = getTotalRevenueForDay(date);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    border rounded-lg p-3 cursor-pointer transition-all
                    ${isToday ? 'border-[#d4b5a0] bg-[#d4b5a0]/5' : 'border-[#d4b5a0]/20'}
                    ${isSelected ? 'ring-2 ring-[#d4b5a0]' : ''}
                    hover:shadow-md
                  `}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs text-[#2c3e50]/60">{dayNames[index]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-[#d4b5a0]' : 'text-[#2c3e50]'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  
                  {dayReservations.length > 0 && (
                    <>
                      <div className="text-xs text-[#2c3e50]/70 mb-1">
                        {dayReservations.length} RDV
                      </div>
                      <div className="text-sm font-semibold text-[#d4b5a0]">
                        {revenue}€
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue Mois */}
      {viewType === 'month' && (
        <div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-[#2c3e50]/60 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getMonthDays().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24" />;
              }
              
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayReservations = getReservationsForDay(date);
              const revenue = getTotalRevenueForDay(date);
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-24 border rounded-lg p-2 cursor-pointer transition-all
                    ${isToday ? 'border-[#d4b5a0] bg-[#d4b5a0]/5' : 'border-[#d4b5a0]/20'}
                    ${isSelected ? 'ring-2 ring-[#d4b5a0]' : ''}
                    ${isPast ? 'opacity-60' : ''}
                    hover:shadow-md
                  `}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-[#d4b5a0]' : 'text-[#2c3e50]'}`}>
                    {date.getDate()}
                  </div>
                  
                  {dayReservations.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs bg-[#d4b5a0]/10 rounded px-1 py-0.5">
                        {dayReservations.length} RDV
                      </div>
                      <div className="text-xs font-semibold text-[#d4b5a0]">
                        {revenue}€
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue Année */}
      {viewType === 'year' && (
        <div className="grid grid-cols-3 gap-4">
          {monthNames.map((month, index) => {
            const stats = getMonthStats(index);
            const isCurrentMonth = new Date().getMonth() === index && 
                                   new Date().getFullYear() === currentDate.getFullYear();
            
            return (
              <div
                key={month}
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
                  setViewType('month');
                }}
                className={`
                  border rounded-xl p-4 cursor-pointer transition-all
                  ${isCurrentMonth ? 'border-[#d4b5a0] bg-[#d4b5a0]/5' : 'border-[#d4b5a0]/20'}
                  hover:shadow-md
                `}
              >
                <h3 className={`font-bold mb-2 ${isCurrentMonth ? 'text-[#d4b5a0]' : 'text-[#2c3e50]'}`}>
                  {month}
                </h3>
                
                {stats.count > 0 ? (
                  <div className="space-y-1">
                    <div className="text-sm text-[#2c3e50]/70">
                      {stats.count} réservations
                    </div>
                    <div className="text-lg font-bold text-[#d4b5a0]">
                      {stats.revenue.toLocaleString('fr-FR')}€
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[#2c3e50]/40">
                    Aucune réservation
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Résumé détaillé des réservations du jour sélectionné */}
      {selectedDate && (
        <div className="mt-6">
          <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2c3e50]">
                📅 {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <span className="text-sm bg-white px-3 py-1 rounded-full text-[#2c3e50]">
                {getReservationsForDay(selectedDate).length} réservation(s)
              </span>
            </div>
            
            {getReservationsForDay(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#2c3e50]/50">Aucune réservation pour ce jour</p>
                <p className="text-sm text-[#2c3e50]/40 mt-2">Cliquez sur "Nouvelle réservation" pour en ajouter une</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getReservationsForDay(selectedDate)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(reservation => (
                    <div key={reservation.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        {/* Heure et statut */}
                        <div className="flex items-start gap-4">
                          <div className="text-center bg-[#d4b5a0]/10 px-3 py-2 rounded-lg">
                            <Clock className="w-5 h-5 text-[#d4b5a0] mx-auto mb-1" />
                            <span className="text-lg font-bold text-[#2c3e50]">{reservation.time}</span>
                          </div>
                          
                          {/* Informations client */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-[#d4b5a0]" />
                              <span className="font-semibold text-[#2c3e50] text-lg">
                                {reservation.userName || 'Client'}
                              </span>
                              {reservation.status === 'completed' && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                                  ✓ Effectué
                                </span>
                              )}
                              {reservation.status === 'confirmed' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                  Confirmé
                                </span>
                              )}
                              {reservation.status === 'cancelled' && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                  Annulé
                                </span>
                              )}
                            </div>
                            
                            {/* Contact */}
                            {(reservation.userEmail || reservation.phone) && (
                              <div className="flex flex-wrap gap-3 mb-2 text-sm text-[#2c3e50]/70">
                                {reservation.userEmail && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{reservation.userEmail}</span>
                                  </div>
                                )}
                                {reservation.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{reservation.phone}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Badge abonnement si applicable */}
                            {reservation.isSubscription && (
                              <div className="mb-3 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-purple-600">🔔</span>
                                  <span className="text-sm font-medium text-purple-700">Rendez-vous mensuel d'abonnement</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Services détaillés */}
                            <div className="mb-2">
                              <div className="text-xs text-[#2c3e50]/60 mb-1">Prestations</div>
                              <div className="flex flex-wrap gap-2">
                                {reservation.services && reservation.services.length > 0 ? (
                                  reservation.services.map(serviceId => (
                                    <div key={serviceId} className="bg-[#d4b5a0]/10 px-3 py-1.5 rounded-lg">
                                      <span className="text-sm font-medium text-[#2c3e50]">
                                        {services[serviceId as keyof typeof services] || serviceId}
                                        {reservation.packages && reservation.packages[serviceId] === 'abonnement' && (
                                          <span className="ml-2 text-xs text-purple-600 font-medium">(Abo)</span>
                                        )}
                                      </span>
                                      {/* {servicePricing[serviceId as keyof typeof servicePricing] && (
                                        <span className="text-xs text-[#2c3e50]/60 ml-2">• {servicePricing[serviceId as keyof typeof servicePricing]?.duration}</span>
                                      )} */}
                                    </div>
                                  ))
                                ) : reservation.serviceName ? (
                                  <div className="bg-[#d4b5a0]/10 px-3 py-1.5 rounded-lg">
                                    <span className="text-sm font-medium text-[#2c3e50]">
                                      {reservation.serviceName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#2c3e50]/60">Aucun service</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Notes */}
                            {reservation.notes && (
                              <div className="bg-yellow-50 p-2 rounded-lg mt-2">
                                <div className="text-xs text-[#2c3e50]/60 mb-0.5">Notes</div>
                                <p className="text-sm text-[#2c3e50]">{reservation.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Prix et actions */}
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-[#d4b5a0] mb-2">
                            {reservation.totalPrice}€
                          </div>
                          <ReservationPaymentButton
                            reservationId={reservation.id}
                            amount={reservation.totalPrice}
                            serviceName={reservation.serviceName || reservation.services[0] || 'Prestation'}
                            paymentStatus={reservation.paymentStatus || 'unpaid'}
                            paymentMethod={reservation.paymentMethod}
                            onPaymentInitiated={() => {
                              // Rafraîchir les réservations après paiement
                              window.location.reload();
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                
                {/* Total du jour */}
                <div className="bg-white p-4 rounded-lg border-2 border-[#d4b5a0]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#2c3e50]">Total du jour</span>
                    <span className="text-2xl font-bold text-[#d4b5a0]">
                      {getTotalRevenueForDay(selectedDate)}€
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}