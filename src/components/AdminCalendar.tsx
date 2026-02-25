"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, User, Euro } from "lucide-react";
import { formatDateLocal } from "@/lib/date-utils";

interface Reservation {
  id: string;
  date: string;
  time: string;
  userName?: string;
  services: string[];
  totalPrice: number;
  status: string;
}

interface AdminCalendarProps {
  reservations: Reservation[];
  onDateSelect: (date: string) => void;
}

export default function AdminCalendar({ reservations, onDateSelect }: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const services = {
    "hydroneedling": "Hydroneedling",
    "hydroface": "Hydroface",
    "nanoneedling": "Nanoneedling",
    "led-therapie": "LED Thérapie"
  };

  // Obtenir le premier jour du mois
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay() || 7; // Convertir dimanche (0) en 7
  
  // Créer un tableau pour tous les jours du calendrier
  const calendarDays: (Date | null)[] = [];
  
  // Ajouter les jours vides du début
  for (let i = 1; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Ajouter tous les jours du mois
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  // Fonctions pour obtenir les réservations d'un jour
  const getReservationsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = formatDateLocal(date);
    return reservations.filter(r => r.date.startsWith(dateStr));
  };

  const getTotalRevenueForDay = (date: Date | null) => {
    const dayReservations = getReservationsForDay(date);
    return dayReservations.reduce((sum, r) => sum + r.totalPrice, 0);
  };

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(formatDateLocal(date));
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onDateSelect(formatDateLocal(today));
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header du calendrier */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#2c3e50]" />
          </button>
          <h2 className="text-xl font-bold text-[#2c3e50]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#2c3e50]" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {dayNames.map(day => (
          <div key={day} className="text-center py-2 text-sm font-semibold text-[#2c3e50]/70">
            {day}
          </div>
        ))}
        
        {/* Jours du calendrier */}
        {calendarDays.map((date, index) => {
          const dayReservations = getReservationsForDay(date);
          const revenue = getTotalRevenueForDay(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();
          const isPast = date && date < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                ${!date ? 'bg-gray-50 cursor-default' : ''}
                ${isToday ? 'border-2 border-[#d4b5a0] bg-[#d4b5a0]/5' : 'border-gray-200'}
                ${isSelected ? 'bg-[#d4b5a0]/10 ring-2 ring-[#d4b5a0]' : ''}
                ${isPast && !isToday ? 'bg-gray-50' : ''}
                ${date && !isPast ? 'hover:bg-[#d4b5a0]/5' : ''}
              `}
            >
              {date && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-[#d4b5a0]' : 'text-[#2c3e50]'}`}>
                      {date.getDate()}
                    </span>
                    {dayReservations.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#d4b5a0] text-white text-xs rounded-full">
                        {dayReservations.length}
                      </span>
                    )}
                  </div>
                  
                  {dayReservations.length > 0 && (
                    <div className="space-y-1">
                      {dayReservations.slice(0, 2).map((res, i) => (
                        <div key={i} className="text-xs truncate">
                          <span className="text-[#2c3e50]/60">{res.time}</span>
                          <span className="ml-1 text-[#2c3e50]/80">{res.userName?.split(' ')[0]}</span>
                        </div>
                      ))}
                      {dayReservations.length > 2 && (
                        <div className="text-xs text-[#d4b5a0] font-medium">
                          +{dayReservations.length - 2} autres
                        </div>
                      )}
                      {revenue > 0 && (
                        <div className="text-xs font-semibold text-green-600 mt-1">
                          {revenue}€
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé du jour sélectionné */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-[#fdfbf7] rounded-xl">
          <h3 className="font-semibold text-[#2c3e50] mb-3">
            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {getReservationsForDay(selectedDate).length === 0 ? (
            <p className="text-[#2c3e50]/60 text-sm">Aucune réservation pour ce jour</p>
          ) : (
            <div className="space-y-2">
              {getReservationsForDay(selectedDate).map(res => (
                <div key={res.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="font-medium text-sm">{res.time}</span>
                    <User className="w-4 h-4 text-[#2c3e50]/60" />
                    <span className="text-sm text-[#2c3e50]">{res.userName}</span>
                    <div className="flex gap-1">
                      {res.services.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-[#d4b5a0]/10 text-xs rounded">
                          {services[s as keyof typeof services] || s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">{res.totalPrice}€</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="font-semibold text-[#2c3e50]">Total du jour :</span>
                <span className="font-bold text-lg text-[#d4b5a0]">
                  {getTotalRevenueForDay(selectedDate)}€
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}