"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Calendar, Clock, Ban, Save, Trash2, X, 
  CalendarX, AlertCircle, Check, MousePointer,
  Grid, ChevronLeft, ChevronRight
} from "lucide-react";

interface BlockedSlot {
  id?: string;
  date: string;
  time?: string;
  allDay?: boolean;
  reason?: string;
}

interface TimeSlotGrid {
  date: string;
  slots: {
    time: string;
    blocked: boolean;
    id?: string;
    reason?: string;
  }[];
}

export default function AdvancedBlockManager() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const selectionStartRef = useRef<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Heures de travail
  const workHours = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    fetchBlockedSlots();
  }, [currentMonth]);

  const fetchBlockedSlots = async () => {
    try {
      const response = await fetch('/api/admin/blocked-slots');
      if (response.ok) {
        const data = await response.json();
        setBlockedSlots(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  // Obtenir les dates de la semaine courante
  const getWeekDates = () => {
    const startOfWeek = new Date(currentMonth);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Obtenir les dates du mois
  const getMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSlotKey = (date: string, time: string) => `${date}_${time}`;

  const isSlotBlocked = (date: string, time: string) => {
    return blockedSlots.some(slot => {
      if (slot.date === date) {
        if (slot.allDay) return true;
        if (slot.time === time) return true;
      }
      return false;
    });
  };

  // Gestion de la sélection par glissement
  const handleMouseDown = (date: string, time: string) => {
    const key = getSlotKey(date, time);
    if (!isSlotBlocked(date, time)) {
      setIsSelecting(true);
      selectionStartRef.current = key;
      setSelectedSlots(new Set([key]));
    }
  };

  const handleMouseEnter = (date: string, time: string) => {
    const key = getSlotKey(date, time);
    setHoveredSlot(key);

    if (isSelecting && selectionStartRef.current && !isSlotBlocked(date, time)) {
      const startParts = selectionStartRef.current.split('_');
      const startDate = startParts[0];
      const startTime = startParts[1];

      // Créer une sélection rectangulaire
      const newSelection = new Set<string>();
      
      const dates = viewMode === 'week' ? getWeekDates() : [new Date(date)];
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(date);
      
      const minDate = startDateObj <= endDateObj ? startDate : date;
      const maxDate = startDateObj <= endDateObj ? date : startDate;
      
      const startTimeIdx = workHours.indexOf(startTime);
      const endTimeIdx = workHours.indexOf(time);
      const minTimeIdx = Math.min(startTimeIdx, endTimeIdx);
      const maxTimeIdx = Math.max(startTimeIdx, endTimeIdx);

      // Sélectionner tous les créneaux dans le rectangle
      dates.forEach(d => {
        const dateStr = formatDate(d);
        if (dateStr >= minDate && dateStr <= maxDate) {
          for (let i = minTimeIdx; i <= maxTimeIdx; i++) {
            const slotKey = getSlotKey(dateStr, workHours[i]);
            if (!isSlotBlocked(dateStr, workHours[i])) {
              newSelection.add(slotKey);
            }
          }
        }
      });

      setSelectedSlots(newSelection);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectedSlots.size > 0) {
      setIsSelecting(false);
      setShowReasonModal(true);
    }
  };

  // Sauvegarder les créneaux sélectionnés
  const saveSelectedSlots = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const slotsToBlock = Array.from(selectedSlots).map(key => {
      const [date, time] = key.split('_');
      return {
        date,
        time,
        reason: blockReason || 'Créneaux bloqués'
      };
    });

    try {
      for (const slot of slotsToBlock) {
        await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slot)
        });
      }
      
      await fetchBlockedSlots();
      setSelectedSlots(new Set());
      setBlockReason("");
      setShowReasonModal(false);
      
      alert(`${slotsToBlock.length} créneaux bloqués avec succès`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du blocage des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const deleteBlockedSlot = async (slot: BlockedSlot) => {
    if (!slot.id) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/blocked-slots/${slot.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchBlockedSlots();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const dates = viewMode === 'week' ? getWeekDates() : getMonthDates();

  return (
    <div className="bg-white rounded-xl p-6" onMouseUp={handleMouseUp}>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2c3e50] mb-2">
            Gestion avancée des disponibilités
          </h3>
          <p className="text-sm text-[#2c3e50]/70">
            <MousePointer className="w-4 h-4 inline mr-1" />
            Cliquez et glissez pour sélectionner plusieurs créneaux à bloquer
          </p>
        </div>

        {/* Contrôles de vue */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'week'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'month'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            const newDate = new Date(currentMonth);
            if (viewMode === 'week') {
              newDate.setDate(newDate.getDate() - 7);
            } else {
              newDate.setMonth(newDate.getMonth() - 1);
            }
            setCurrentMonth(newDate);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h4 className="text-lg font-semibold text-[#2c3e50]">
          {viewMode === 'week' ? (
            <>Semaine du {dates[0]?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</>
          ) : (
            currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          )}
        </h4>

        <button
          onClick={() => {
            const newDate = new Date(currentMonth);
            if (viewMode === 'week') {
              newDate.setDate(newDate.getDate() + 7);
            } else {
              newDate.setMonth(newDate.getMonth() + 1);
            }
            setCurrentMonth(newDate);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Grille des créneaux */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {viewMode === 'week' ? (
          // Vue semaine
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-xs font-medium text-gray-600 border-r">Heure</th>
                  {dates.map((date, idx) => {
                    const dateStr = formatDate(date);
                    const hasBlockedSlots = blockedSlots.some(s => s.date === dateStr);
                    return (
                      <th key={dateStr} className="p-2 text-center border-r">
                        <div className="text-xs font-medium text-gray-600">
                          {daysOfWeek[idx]}
                        </div>
                        <div className="text-sm font-semibold">
                          {date.getDate()}
                        </div>
                        {hasBlockedSlots && (
                          <div className="text-xs text-red-600">
                            <Ban className="w-3 h-3 inline" />
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {workHours.map(time => (
                  <tr key={time} className="border-t">
                    <td className="p-2 text-sm font-medium text-gray-600 border-r bg-gray-50">
                      {time}
                    </td>
                    {dates.map(date => {
                      const dateStr = formatDate(date);
                      const slotKey = getSlotKey(dateStr, time);
                      const isBlocked = isSlotBlocked(dateStr, time);
                      const isSelected = selectedSlots.has(slotKey);
                      const isHovered = hoveredSlot === slotKey;
                      const blockedSlot = blockedSlots.find(s => 
                        s.date === dateStr && (s.time === time || s.allDay)
                      );

                      return (
                        <td
                          key={slotKey}
                          className={`
                            relative p-0 border-r border-b cursor-pointer select-none
                            ${isBlocked ? 'bg-red-100' : 'hover:bg-blue-50'}
                            ${isSelected ? 'bg-blue-200' : ''}
                            ${isHovered && !isBlocked ? 'bg-blue-100' : ''}
                          `}
                          onMouseDown={() => handleMouseDown(dateStr, time)}
                          onMouseEnter={() => handleMouseEnter(dateStr, time)}
                          style={{ userSelect: 'none' }}
                        >
                          <div className="w-full h-10 p-1 relative">
                            {isBlocked && (
                              <div className="flex items-center justify-center h-full">
                                <Ban className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                            {isSelected && !isBlocked && (
                              <div className="flex items-center justify-center h-full">
                                <Check className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            {blockedSlot && blockedSlot.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlockedSlot(blockedSlot);
                                }}
                                className="absolute top-0 right-0 p-1 opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Vue mois simplifiée
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}
              {dates.map(date => {
                const dateStr = formatDate(date);
                const dayBlocked = blockedSlots.some(s => s.date === dateStr && s.allDay);
                const hasSlots = blockedSlots.some(s => s.date === dateStr && !s.allDay);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const isPast = date < today;

                return (
                  <div
                    key={dateStr}
                    className={`
                      p-2 border rounded-lg min-h-[60px] cursor-pointer
                      ${dayBlocked ? 'bg-red-100 border-red-300' : ''}
                      ${hasSlots ? 'bg-yellow-50 border-yellow-300' : ''}
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${isPast ? 'opacity-50' : ''}
                      hover:bg-gray-50
                    `}
                    onClick={() => {
                      if (!dayBlocked && !isPast) {
                        setSelectedSlots(new Set([`${dateStr}_allDay`]));
                        setShowReasonModal(true);
                      }
                    }}
                  >
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    {dayBlocked && (
                      <div className="mt-1">
                        <Ban className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                    {hasSlots && !dayBlocked && (
                      <div className="mt-1 text-xs text-yellow-700">
                        Partiellement bloqué
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Indicateur de sélection */}
      {selectedSlots.size > 0 && !showReasonModal && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {selectedSlots.size} créneaux sélectionnés
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSlots(new Set())}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => setShowReasonModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Bloquer
            </button>
          </div>
        </div>
      )}

      {/* Modal de raison */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
              Bloquer {selectedSlots.size} créneaux
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Raison du blocage (optionnel)
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Congés, Formation, Rendez-vous..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Les clients ne pourront pas réserver ces créneaux
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedSlots(new Set());
                  setBlockReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveSelectedSlots}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  'Blocage en cours...'
                ) : (
                  <>
                    <Ban className="w-4 h-4 inline mr-2" />
                    Bloquer les créneaux
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Comment utiliser :</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Vue semaine :</strong> Cliquez et glissez pour sélectionner plusieurs créneaux</li>
          <li>• <strong>Vue mois :</strong> Cliquez sur un jour pour le bloquer entièrement</li>
          <li>• <strong>Supprimer :</strong> Cliquez sur le X qui apparaît au survol d'un créneau bloqué</li>
          <li>• Les créneaux en rouge sont déjà bloqués</li>
        </ul>
      </div>
    </div>
  );
}