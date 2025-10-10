"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar, Clock, Ban, Plus, Trash2, X,
  CalendarX, AlertCircle, Check
} from "lucide-react";
import { formatDateLocal } from "@/lib/date-utils";

interface BlockedSlot {
  id: string;
  date: string;
  time?: string;
  allDay?: boolean;
  reason?: string;
}

// Composant pour la sélection des créneaux avec glissement
function TimeSlotSelector({ 
  timeSlots, 
  selectedTimeSlots, 
  onSelectionChange 
}: {
  timeSlots: string[];
  selectedTimeSlots: string[];
  onSelectionChange: (slots: string[]) => void;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        onSelectionChange(Array.from(currentSelection));
        setSelectionStart(null);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isSelecting, currentSelection, onSelectionChange]);

  const handleMouseDown = (index: number, time: string) => {
    setIsSelecting(true);
    setSelectionStart(index);
    
    // Si le créneau est déjà sélectionné, on le désélectionne
    if (selectedTimeSlots.includes(time)) {
      const newSelection = selectedTimeSlots.filter(t => t !== time);
      setCurrentSelection(new Set(newSelection));
    } else {
      // Sinon on l'ajoute à la sélection
      setCurrentSelection(new Set([...selectedTimeSlots, time]));
    }
  };

  const handleMouseEnter = (index: number, time: string) => {
    if (isSelecting && selectionStart !== null) {
      // Calculer la plage de sélection
      const start = Math.min(selectionStart, index);
      const end = Math.max(selectionStart, index);
      
      // Créer une nouvelle sélection basée sur la plage
      const rangeSelection = new Set(selectedTimeSlots);
      for (let i = start; i <= end; i++) {
        rangeSelection.add(timeSlots[i]);
      }
      setCurrentSelection(rangeSelection);
    }
  };

  const toggleSingleSlot = (time: string) => {
    if (!isSelecting) {
      if (selectedTimeSlots.includes(time)) {
        onSelectionChange(selectedTimeSlots.filter(t => t !== time));
      } else {
        onSelectionChange([...selectedTimeSlots, time]);
      }
    }
  };

  const displaySelection = isSelecting ? currentSelection : new Set(selectedTimeSlots);

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
        ref={containerRef}
        className="grid grid-cols-4 gap-1 p-3 border-2 border-[#d4b5a0]/20 rounded-lg bg-white select-none"
        style={{ userSelect: 'none' }}
      >
        {timeSlots.map((time, index) => {
          const isSelected = displaySelection.has(time);
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
              onMouseEnter={() => handleMouseEnter(index, time)}
              onClick={() => toggleSingleSlot(time)}
            >
              {time}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500">
        💡 Astuce : Cliquez et glissez pour sélectionner une plage de créneaux
      </div>
    </div>
  );
}

export default function QuickBlockManager() {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [blockType, setBlockType] = useState<'single' | 'range' | 'specific' | 'timeRange'>('single');
  
  // Note: formatDateLocal est importé depuis @/lib/date-utils
  
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [selectedTime, setSelectedTime] = useState('');
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/blocked-slots', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBlockedSlots(data);
      } else {
        console.error('Erreur lors du chargement des créneaux bloqués:', response.status);
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
    } else if (blockType === 'specific') {
      // Bloquer des créneaux spécifiques (déjà gérés via selectedTimeSlots)
      if (selectedTimeSlots.length > 0) {
        selectedTimeSlots.forEach(time => {
          slotsToBlock.push({
            date: selectedDate,
            time,
            reason: blockReason || 'Indisponible'
          });
        });
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
      
      // Créer les créneaux entre startTime et endTime
      const startIdx = timeSlots.indexOf(startTime);
      const endIdx = timeSlots.indexOf(endTime);
      
      if (startIdx !== -1 && endIdx !== -1) {
        dates.forEach(date => {
          for (let i = startIdx; i <= endIdx; i++) {
            slotsToBlock.push({
              date,
              time: timeSlots[i],
              reason: blockReason || 'Plage horaire bloquée'
            });
          }
        });
      }
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
    setBlockReason('');
    setAllDay(false);
    
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
                      <div className="ml-8 space-y-1">
                        {slots.map(slot => (
                          <div key={slot.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-[#2c3e50]/70">
                                {slot.time || 'Journée entière'}
                              </span>
                              {slot.reason && slot.reason !== 'Indisponible' && (
                                <span className="text-xs text-gray-500">
                                  ({slot.reason})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => deleteBlockedSlot(slot.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
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

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
              Bloquer des créneaux
            </h3>

            <div className="space-y-4">
              {/* Type de blocage */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Type de blocage
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                  <button
                    onClick={() => setBlockType('specific')}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      blockType === 'specific'
                        ? 'bg-[#d4b5a0] text-white border-[#d4b5a0]'
                        : 'border-gray-300 hover:border-[#d4b5a0]'
                    }`}
                  >
                    Créneaux
                  </button>
                </div>
              </div>

              {/* Date(s) */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  {blockType === 'range' ? 'Date de début' : 'Date'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={formatDateLocal(new Date())}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                />
              </div>

              {(blockType === 'range' || blockType === 'timeRange') && (
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Date de fin {blockType === 'timeRange' && '(optionnel)'}
                  </label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    min={selectedDate}
                    onChange={(e) => setSelectedEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  />
                </div>
              )}

              {/* Journée entière ou créneaux */}
              {blockType !== 'timeRange' && (
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
              )}

              {/* Plage horaire pour blockType === 'timeRange' */}
              {blockType === 'timeRange' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#2c3e50]">
                    Plage horaire à bloquer
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#2c3e50]/70 mb-1">De</label>
                      <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#2c3e50]/70 mb-1">À</label>
                      <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Tous les créneaux entre {startTime} et {endTime} seront bloqués
                    </p>
                  </div>
                </div>
              )}

              {/* Sélection des créneaux pour blockType === 'specific' */}
              {!allDay && blockType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Créneaux à bloquer
                  </label>
                  <p className="text-xs text-[#2c3e50]/60 mb-2">
                    Cliquez sur un créneau pour le sélectionner, ou cliquez et maintenez pour sélectionner plusieurs créneaux
                  </p>
                  <TimeSlotSelector
                    timeSlots={timeSlots}
                    selectedTimeSlots={selectedTimeSlots}
                    onSelectionChange={setSelectedTimeSlots}
                  />
                  {selectedTimeSlots.length > 0 && (
                    <p className="text-xs text-[#d4b5a0] mt-2">
                      {selectedTimeSlots.length} créneaux sélectionnés
                    </p>
                  )}
                </div>
              )}

              {/* Raison */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Raison (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Congés, Formation, Rendez-vous..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
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
                  setBlockReason('');
                  setAllDay(false);
                }}
                className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={blockSlots}
                disabled={
                  blockType === 'timeRange' 
                    ? false 
                    : (!allDay && selectedTimeSlots.length === 0)
                }
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