"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar, Clock, Ban, Plus, Trash2, X,
  CalendarX, AlertCircle, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import { formatDateLocal } from "@/lib/date-utils";

interface BlockedSlot {
  id: string;
  date: string;
  time?: string;
  allDay?: boolean;
  reason?: string;
}

// Composant pour la sélection de dates avec glissement
function DateRangeSelector({ 
  selectedDate,
  selectedEndDate,
  onDateChange,
  onEndDateChange,
  mode
}: {
  selectedDate: string;
  selectedEndDate: string;
  onDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  mode: 'single' | 'range';
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Ajouter des jours vides pour aligner le calendrier
    const startDayOfWeek = firstDay.getDay() || 7; // Lundi = 1, Dimanche = 7
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ajouter tous les jours du mois
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const isDateInRange = (date: Date) => {
    if (!selectedDate || !selectedEndDate) return false;
    const dateStr = formatDate(date);
    return dateStr >= selectedDate && dateStr <= selectedEndDate;
  };
  
  const handleMouseDown = (date: Date) => {
    if (mode === 'single') {
      onDateChange(formatDate(date));
    } else {
      setIsSelecting(true);
      setSelectionStart(date);
      const dateStr = formatDate(date);
      onDateChange(dateStr);
      onEndDateChange(dateStr);
    }
  };
  
  const handleMouseEnter = (date: Date) => {
    if (isSelecting && selectionStart && mode === 'range') {
      const startStr = formatDate(selectionStart);
      const dateStr = formatDate(date);
      
      if (startStr <= dateStr) {
        onDateChange(startStr);
        onEndDateChange(dateStr);
      } else {
        onDateChange(dateStr);
        onEndDateChange(startStr);
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsSelecting(false);
  };
  
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  return (
    <div className="bg-white rounded-lg p-4 border border-[#d4b5a0]/20">
      {/* Navigation du mois */}
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-[#2c3e50]">
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendrier */}
      <div className="grid grid-cols-7 gap-1" style={{ userSelect: 'none' }}>
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-8" />;
          }
          
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const isEnd = dateStr === selectedEndDate;
          const isInRange = mode === 'range' && isDateInRange(date);
          const isToday = formatDate(new Date()) === dateStr;
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <div
              key={dateStr}
              className={`
                h-8 flex items-center justify-center text-sm rounded cursor-pointer
                ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                ${isSelected || isEnd ? 'bg-[#d4b5a0] text-white font-semibold' : ''}
                ${isInRange && !isSelected && !isEnd ? 'bg-[#d4b5a0]/30' : ''}
                ${!isSelected && !isEnd && !isInRange && !isPast ? 'hover:bg-gray-100' : ''}
                ${isToday ? 'ring-2 ring-blue-400' : ''}
              `}
              onMouseDown={() => !isPast && handleMouseDown(date)}
              onMouseEnter={() => !isPast && handleMouseEnter(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
      
      {mode === 'range' && selectedDate && selectedEndDate && (
        <div className="mt-3 text-sm text-center text-[#2c3e50]/70">
          Du {new Date(selectedDate).toLocaleDateString('fr-FR')} au {new Date(selectedEndDate).toLocaleDateString('fr-FR')}
        </div>
      )}
    </div>
  );
}

// Composant pour la sélection d'heures avec glissement
function TimeSlotSelectorEnhanced({ 
  timeSlots, 
  selectedTimeSlots, 
  onSelectionChange,
  mode = 'multiple'
}: {
  timeSlots: string[];
  selectedTimeSlots: string[];
  onSelectionChange: (slots: string[]) => void;
  mode?: 'single' | 'multiple' | 'range';
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  
  const handleMouseDown = (index: number, time: string) => {
    if (mode === 'single') {
      onSelectionChange([time]);
    } else {
      setIsSelecting(true);
      setSelectionStart(index);
      
      if (selectedTimeSlots.includes(time)) {
        onSelectionChange(selectedTimeSlots.filter(t => t !== time));
      } else {
        onSelectionChange([...selectedTimeSlots, time]);
      }
    }
  };
  
  const handleMouseEnter = (index: number) => {
    if (isSelecting && selectionStart !== null && mode !== 'single') {
      const start = Math.min(selectionStart, index);
      const end = Math.max(selectionStart, index);
      
      const rangeSelection = [];
      for (let i = start; i <= end; i++) {
        rangeSelection.push(timeSlots[i]);
      }
      onSelectionChange(rangeSelection);
    }
  };
  
  const handleMouseUp = () => {
    setIsSelecting(false);
  };
  
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => onSelectionChange(timeSlots)}
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Tout sélectionner
        </button>
        <button
          type="button"
          onClick={() => onSelectionChange([])}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Tout désélectionner
        </button>
      </div>
      
      <div 
        className="grid grid-cols-4 gap-1 p-3 border-2 border-[#d4b5a0]/20 rounded-lg bg-white"
        style={{ userSelect: 'none' }}
      >
        {timeSlots.map((time, index) => {
          const isSelected = selectedTimeSlots.includes(time);
          return (
            <div
              key={time}
              className={`
                px-3 py-2 text-sm text-center rounded cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-[#d4b5a0] text-white font-medium shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100 text-[#2c3e50]'
                }
              `}
              onMouseDown={() => handleMouseDown(index, time)}
              onMouseEnter={() => handleMouseEnter(index)}
            >
              {time}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500">
        💡 {mode === 'single' ? 'Cliquez pour sélectionner un créneau' : 'Cliquez et glissez pour sélectionner une plage'}
      </div>
    </div>
  );
}

export default function QuickBlockManagerEnhanced() {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [blockType, setBlockType] = useState<'single' | 'range' | 'timeRange'>('single');

  // Note: formatDateLocal est importé depuis @/lib/date-utils
  
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [blockReason, setBlockReason] = useState('');
  const [allDay, setAllDay] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

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

  const blockSlots = async () => {
    const slotsToBlock = [];
    
    if (blockType === 'single') {
      // Bloquer un seul jour
      if (allDay) {
        slotsToBlock.push({
          date: selectedDate,
          allDay: true,
          reason: blockReason || 'Indisponible'
        });
      } else if (selectedTimeSlots.length > 0) {
        selectedTimeSlots.forEach(time => {
          slotsToBlock.push({
            date: selectedDate,
            time,
            reason: blockReason || 'Indisponible'
          });
        });
      }
    } else if (blockType === 'range') {
      // Bloquer une période
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedEndDate || selectedDate);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDateLocal(d);
        
        if (allDay) {
          slotsToBlock.push({
            date: dateStr,
            allDay: true,
            reason: blockReason || 'Indisponible'
          });
        } else if (selectedTimeSlots.length > 0) {
          selectedTimeSlots.forEach(time => {
            slotsToBlock.push({
              date: dateStr,
              time,
              reason: blockReason || 'Indisponible'
            });
          });
        }
      }
    } else if (blockType === 'timeRange') {
      // Bloquer une plage horaire sur une ou plusieurs dates
      const dates = [];
      if (selectedEndDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedEndDate);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dates.push(formatDateLocal(d));
        }
      } else {
        dates.push(selectedDate);
      }
      
      // Utiliser les créneaux sélectionnés
      dates.forEach(date => {
        selectedTimeSlots.forEach(time => {
          slotsToBlock.push({
            date,
            time,
            reason: blockReason || 'Plage horaire bloquée'
          });
        });
      });
    }

    // Envoyer les blocages au serveur
    const token = localStorage.getItem('token');
    for (const slot of slotsToBlock) {
      try {
        await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slot)
        });
      } catch (error) {
        console.error('Erreur lors du blocage:', error);
      }
    }

    // Rafraîchir la liste
    await fetchBlockedSlots();
    
    // Réinitialiser le formulaire
    setShowAddModal(false);
    setSelectedTimeSlots([]);
    setBlockReason("");
    setAllDay(false);
    setSelectedEndDate("");
    
    alert(`${slotsToBlock.length} créneaux bloqués avec succès`);
  };

  const deleteBlockedSlot = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/blocked-slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setBlockedSlots(blockedSlots.filter(slot => slot.id !== id));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Grouper les créneaux bloqués par date
  const groupedSlots = blockedSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, BlockedSlot[]>);

  // Trier les dates
  const sortedDates = Object.keys(groupedSlots).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Filtrer les dates futures uniquement
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDates = sortedDates.filter(date => {
    const d = new Date(date + 'T00:00:00');
    return d >= today;
  });

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2c3e50] mb-2">
            Blocages ponctuels
          </h3>
          <p className="text-sm text-[#2c3e50]/70">
            Bloquez des jours ou créneaux spécifiques (vacances, rendez-vous, etc.)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Ban className="w-4 h-4" />
          Bloquer des créneaux
        </button>
      </div>

      {/* Liste des créneaux bloqués */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {futureDates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CalendarX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun créneau bloqué</p>
            <p className="text-sm text-gray-500 mt-2">
              Cliquez sur "Bloquer des créneaux" pour commencer
            </p>
          </div>
        ) : (
          futureDates.map(date => {
            const slots = groupedSlots[date];
            const dayBlocked = slots.some(s => s.allDay);
            
            return (
              <div key={date} className="border border-[#d4b5a0]/20 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-[#d4b5a0]" />
                      <span className="font-medium text-[#2c3e50]">
                        {(() => {
                          const [year, month, day] = date.split('-').map(Number);
                          const d = new Date(year, month - 1, day, 12, 0, 0);
                          return d.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          });
                        })()}
                      </span>
                      {dayBlocked && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          Journée entière
                        </span>
                      )}
                    </div>
                    
                    {!dayBlocked && (
                      <div className="ml-8 flex flex-wrap gap-1">
                        {slots.map(slot => (
                          <span 
                            key={slot.id} 
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            <Clock className="w-3 h-3 text-gray-500" />
                            {slot.time || 'Journée'}
                            <button
                              onClick={() => deleteBlockedSlot(slot.id)}
                              className="ml-1 text-red-600 hover:bg-red-50 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {dayBlocked && slots[0].reason && (
                      <p className="text-sm text-[#2c3e50]/60 ml-8">
                        Raison: {slots[0].reason}
                      </p>
                    )}
                  </div>
                  
                  {dayBlocked && (
                    <button
                      onClick={() => deleteBlockedSlot(slots[0].id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal d'ajout améliorée */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
              Bloquer des créneaux
            </h3>

            <div className="space-y-4">
              {/* Type de blocage */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Type de blocage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBlockType('single')}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      blockType === 'single'
                        ? 'bg-[#d4b5a0] text-white border-[#d4b5a0]'
                        : 'border-gray-300 hover:border-[#d4b5a0]'
                    }`}
                  >
                    Un jour
                  </button>
                  <button
                    onClick={() => setBlockType('range')}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      blockType === 'range'
                        ? 'bg-[#d4b5a0] text-white border-[#d4b5a0]'
                        : 'border-gray-300 hover:border-[#d4b5a0]'
                    }`}
                  >
                    Période
                  </button>
                  <button
                    onClick={() => setBlockType('timeRange')}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      blockType === 'timeRange'
                        ? 'bg-[#d4b5a0] text-white border-[#d4b5a0]'
                        : 'border-gray-300 hover:border-[#d4b5a0]'
                    }`}
                  >
                    Plage horaire
                  </button>
                </div>
              </div>

              {/* Sélection de date avec calendrier */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  {blockType === 'range' ? 'Sélectionnez la période (cliquez et glissez)' : 
                   blockType === 'timeRange' ? 'Sélectionnez les dates' : 
                   'Sélectionnez la date'}
                </label>
                <DateRangeSelector
                  selectedDate={selectedDate}
                  selectedEndDate={selectedEndDate}
                  onDateChange={setSelectedDate}
                  onEndDateChange={setSelectedEndDate}
                  mode={blockType === 'single' ? 'single' : 'range'}
                />
              </div>

              {/* Journée entière ou créneaux */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => {
                      setAllDay(e.target.checked);
                      if (e.target.checked) {
                        setSelectedTimeSlots([]);
                      }
                    }}
                    className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                  />
                  <span className="text-sm font-medium text-[#2c3e50]">
                    Bloquer toute la journée
                  </span>
                </label>
              </div>

              {/* Sélection des créneaux horaires */}
              {!allDay && (
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Sélectionnez les créneaux horaires (cliquez et glissez)
                  </label>
                  <TimeSlotSelectorEnhanced
                    timeSlots={timeSlots}
                    selectedTimeSlots={selectedTimeSlots}
                    onSelectionChange={setSelectedTimeSlots}
                    mode="multiple"
                  />
                </div>
              )}

              {/* Raison */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Raison du blocage (optionnel)
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Congés, Formation, Rendez-vous..."
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                />
              </div>

              {/* Avertissement */}
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Les clients ne pourront pas réserver ces créneaux
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTimeSlots([]);
                  setBlockReason("");
                  setAllDay(false);
                  setSelectedEndDate("");
                }}
                className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={blockSlots}
                disabled={!allDay && selectedTimeSlots.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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