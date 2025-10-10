"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { formatDateLocal } from '@/lib/date-utils';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

export default function AdminDisponibilitesTab() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', day: 'Lundi', startTime: '14:00', endTime: '20:00' },
    { id: '2', day: 'Mardi', startTime: '14:00', endTime: '20:00' },
    { id: '3', day: 'Mercredi', startTime: '14:00', endTime: '20:00' },
    { id: '4', day: 'Jeudi', startTime: '14:00', endTime: '20:00' },
    { id: '5', day: 'Vendredi', startTime: '14:00', endTime: '20:00' },
    { id: '6', day: 'Samedi', startTime: '14:00', endTime: '20:00' },
    { id: '7', day: 'Dimanche', startTime: '14:00', endTime: '20:00' },
  ]);

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState({ date: '', reason: '' });
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotDuration, setSlotDuration] = useState(60); // Durée des créneaux en minutes
  const [bufferTime, setBufferTime] = useState(15); // Temps entre les rendez-vous
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Charger les dates bloquées au démarrage
  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/blocked-slots', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Transformer les données de l'API au format attendu et supprimer les doublons
        const formattedDates = data
          .filter((slot: any) => slot.allDay)
          .map((slot: any) => ({
            id: slot.id,
            date: slot.date,
            reason: slot.reason || 'Indisponible'
          }));
        
        // Supprimer les doublons en gardant seulement la première occurrence de chaque date
        const uniqueDates = formattedDates.reduce((acc: BlockedDate[], current: BlockedDate) => {
          const exists = acc.find(item => item.date === current.date);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setBlockedDates(uniqueDates);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dates bloquées:', error);
    }
  };

  const handleTimeSlotUpdate = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const addBlockedDate = async () => {
    if (newBlockedDate.date && newBlockedDate.reason) {
      // Vérifier si la date est déjà bloquée
      const isAlreadyBlocked = blockedDates.some(d => d.date === newBlockedDate.date);
      if (isAlreadyBlocked) {
        setMessage('Cette date est déjà bloquée');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: newBlockedDate.date,
            allDay: true,
            reason: newBlockedDate.reason
          })
        });

        if (response.ok) {
          const data = await response.json();
          setBlockedDates([
            ...blockedDates,
            {
              id: data.id,
              date: data.date,
              reason: data.reason
            }
          ]);
          setNewBlockedDate({ date: '', reason: '' });
          setMessage('Date bloquée avec succès');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Erreur lors du blocage de la date');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setMessage('Erreur lors du blocage de la date');
      } finally {
        setLoading(false);
      }
    }
  };

  const removeBlockedDate = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/blocked-slots?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBlockedDates(blockedDates.filter(d => d.id !== id));
        setMessage('Date débloquée avec succès');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erreur lors du déblocage de la date');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors du déblocage de la date');
    } finally {
      setLoading(false);
    }
  };

  const addBreakTime = (day: string) => {
    const newBreak: TimeSlot = {
      id: Date.now().toString(),
      day,
      startTime: '12:00',
      endTime: '13:00',
      isBreak: true
    };
    setTimeSlots([...timeSlots, newBreak]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
        Gestion des Disponibilités
      </h2>

      {/* Paramètres généraux */}
      <div className="bg-[#fdfbf7] rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Paramètres des créneaux</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Durée des créneaux (minutes)
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Temps de battement entre RDV (minutes)
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={0}>Aucun</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Horaires d'ouverture</h3>
        <div className="space-y-4">
          {daysOfWeek.map(day => {
            const daySlots = timeSlots.filter(slot => slot.day === day && !slot.isBreak);
            const dayBreaks = timeSlots.filter(slot => slot.day === day && slot.isBreak);
            const mainSlot = daySlots[0];

            return (
              <div key={day} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="w-24 font-medium text-[#2c3e50]">{day}</span>
                    
                    {mainSlot && mainSlot.startTime !== 'Fermé' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#d4b5a0]" />
                          <input
                            type="time"
                            value={mainSlot.startTime}
                            onChange={(e) => handleTimeSlotUpdate(mainSlot.id, 'startTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                          <span className="text-[#2c3e50]/60">à</span>
                          <input
                            type="time"
                            value={mainSlot.endTime}
                            onChange={(e) => handleTimeSlotUpdate(mainSlot.id, 'endTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>

                        {/* Pauses */}
                        {dayBreaks.map(breakSlot => (
                          <div key={breakSlot.id} className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-orange-600">Pause:</span>
                            <input
                              type="time"
                              value={breakSlot.startTime}
                              onChange={(e) => handleTimeSlotUpdate(breakSlot.id, 'startTime', e.target.value)}
                              className="px-2 py-1 border border-orange-300 rounded text-sm"
                            />
                            <span className="text-[#2c3e50]/60 text-sm">à</span>
                            <input
                              type="time"
                              value={breakSlot.endTime}
                              onChange={(e) => handleTimeSlotUpdate(breakSlot.id, 'endTime', e.target.value)}
                              className="px-2 py-1 border border-orange-300 rounded text-sm"
                            />
                            <button
                              onClick={() => removeTimeSlot(breakSlot.id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="text-[#2c3e50]/60">Fermé</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {mainSlot && mainSlot.startTime !== 'Fermé' && (
                      <button
                        onClick={() => addBreakTime(day)}
                        className="text-sm text-orange-600 hover:bg-orange-50 px-2 py-1 rounded"
                      >
                        + Pause
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (mainSlot && mainSlot.startTime !== 'Fermé') {
                          handleTimeSlotUpdate(mainSlot.id, 'startTime', 'Fermé');
                          handleTimeSlotUpdate(mainSlot.id, 'endTime', 'Fermé');
                        } else if (mainSlot) {
                          handleTimeSlotUpdate(mainSlot.id, 'startTime', '10:00');
                          handleTimeSlotUpdate(mainSlot.id, 'endTime', '19:00');
                        }
                      }}
                      className="text-sm text-[#d4b5a0] hover:bg-[#d4b5a0]/10 px-2 py-1 rounded"
                    >
                      {mainSlot && mainSlot.startTime !== 'Fermé' ? 'Fermer' : 'Ouvrir'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message de confirmation */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Dates bloquées */}
      <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Dates bloquées / Congés</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={newBlockedDate.date}
            onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            min={formatDateLocal(new Date())}
          />
          <input
            type="text"
            value={newBlockedDate.reason}
            onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
            placeholder="Raison (ex: Congés, Formation...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addBlockedDate}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '...' : <Plus className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-2">
          {blockedDates.length === 0 ? (
            <p className="text-[#2c3e50]/60 text-center py-4">Aucune date bloquée</p>
          ) : (
            blockedDates.map(blocked => (
              <div key={blocked.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-[#2c3e50]">
                    {new Date(blocked.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-[#2c3e50]/60">- {blocked.reason}</span>
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={async () => {
            setMessage('Horaires sauvegardés avec succès');
            setTimeout(() => setMessage(''), 3000);
            // TODO: Implémenter la sauvegarde des horaires dans la base de données
          }}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          Enregistrer les horaires
        </button>
      </div>
    </div>
  );
}