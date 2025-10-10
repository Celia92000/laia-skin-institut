"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle, Check } from "lucide-react";

interface WorkingHours {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  time?: string | null;
  allDay: boolean;
  reason: string;
}

export default function AdminDisponibilitesTabSync() {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState({ date: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Charger les données au démarrage
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/admin/availability');
      if (response.ok) {
        const data = await response.json();
        
        // Formater les dates bloquées
        const formattedBlockedDates = data.blockedSlots.map((slot: any) => ({
          id: slot.id,
          date: formatDateLocal(new Date(slot.date)),
          time: slot.time,
          allDay: slot.allDay,
          reason: slot.reason
        }));
        
        setBlockedDates(formattedBlockedDates);
        setWorkingHours(data.workingHours);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      showMessage('Erreur lors du chargement des disponibilités', 'error');
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleWorkingHoursUpdate = (dayOfWeek: number, field: keyof WorkingHours, value: any) => {
    setWorkingHours(hours => 
      hours.map(h => 
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const saveWorkingHours = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workingHours })
      });

      if (response.ok) {
        showMessage('Horaires sauvegardés avec succès', 'success');
      } else {
        const error = await response.json();
        showMessage(error.error || 'Erreur lors de la sauvegarde', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur lors de la sauvegarde des horaires', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockedDate.date || !newBlockedDate.reason) {
      showMessage('Veuillez remplir tous les champs', 'error');
      return;
    }

    // Vérifier si la date est déjà bloquée
    const isAlreadyBlocked = blockedDates.some(d => d.date === newBlockedDate.date && d.allDay);
    if (isAlreadyBlocked) {
      showMessage('Cette date est déjà bloquée', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/availability', {
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
        setBlockedDates([...blockedDates, {
          id: data.id,
          date: formatDateLocal(new Date(data.date)),
          time: data.time,
          allDay: data.allDay,
          reason: data.reason
        }]);
        setNewBlockedDate({ date: '', reason: '' });
        showMessage('Date bloquée avec succès', 'success');
      } else {
        const error = await response.json();
        showMessage(error.error || 'Erreur lors du blocage', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur lors du blocage de la date', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeBlockedDate = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/availability?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBlockedDates(blockedDates.filter(d => d.id !== id));
        showMessage('Date débloquée avec succès', 'success');
      } else {
        const error = await response.json();
        showMessage(error.error || 'Erreur lors du déblocage', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur lors du déblocage de la date', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
        Gestion des Disponibilités
      </h2>

      {/* Message de confirmation */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {messageType === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Horaires d'ouverture */}
      <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Horaires d'ouverture</h3>
        <div className="space-y-3">
          {workingHours.map((hours) => (
            <div key={hours.dayOfWeek} className="flex items-center justify-between p-3 bg-[#fdfbf7] rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-medium text-[#2c3e50] w-24">
                  {dayNames[hours.dayOfWeek]}
                </span>
                
                {hours.isOpen ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4b5a0]" />
                    <input
                      type="time"
                      value={hours.startTime}
                      onChange={(e) => handleWorkingHoursUpdate(hours.dayOfWeek, 'startTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <span className="text-[#2c3e50]/60">à</span>
                    <input
                      type="time"
                      value={hours.endTime}
                      onChange={(e) => handleWorkingHoursUpdate(hours.dayOfWeek, 'endTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                ) : (
                  <span className="text-[#2c3e50]/60">Fermé</span>
                )}
              </div>

              <button
                onClick={() => handleWorkingHoursUpdate(hours.dayOfWeek, 'isOpen', !hours.isOpen)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  hours.isOpen 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {hours.isOpen ? 'Fermer' : 'Ouvrir'}
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={saveWorkingHours}
          disabled={loading}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Sauvegarder les horaires
        </button>
      </div>

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

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {blockedDates.length === 0 ? (
            <p className="text-[#2c3e50]/60 text-center py-4">Aucune date bloquée</p>
          ) : (
            blockedDates
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(blocked => (
                <div key={blocked.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-[#2c3e50]">
                      {new Date(blocked.date + 'T12:00:00').toLocaleDateString('fr-FR', {
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
                    disabled={loading}
                    className="text-red-600 hover:bg-red-100 p-2 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}