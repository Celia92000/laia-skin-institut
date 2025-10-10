"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import { 
  Clock, Calendar, Save, AlertCircle, CheckCircle,
  Sun, Moon, Coffee, Sunset, X, Plus, Trash2,
  Lock, Unlock
} from "lucide-react";

interface WorkingHours {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

interface BlockedSlot {
  id: string;
  date: Date;
  time?: string;
  allDay: boolean;
  reason: string;
}

export default function AdminScheduleTab() {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'hours' | 'blocked'>('hours');
  
  // État pour nouveau créneau bloqué
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    date: formatDateLocal(new Date()),
    allDay: true,
    time: '09:00',
    reason: ''
  });

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayIcons = [Sun, Moon, Coffee, Coffee, Coffee, Coffee, Sunset];

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer les horaires de travail
      const hoursResponse = await fetch('/api/admin/working-hours', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (hoursResponse.ok) {
        const hoursData = await hoursResponse.json();
        setWorkingHours(hoursData);
      }
      
      // Récupérer les créneaux bloqués
      const blockedResponse = await fetch('/api/admin/blocked-slots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json();
        setBlockedSlots(blockedData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHours = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/working-hours', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workingHours)
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
    }
  };

  const handleToggleDay = (dayOfWeek: number) => {
    setWorkingHours(prev => prev.map(hour => 
      hour.dayOfWeek === dayOfWeek 
        ? { ...hour, isOpen: !hour.isOpen }
        : hour
    ));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prev => prev.map(hour => 
      hour.dayOfWeek === dayOfWeek 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const handleAddBlockedSlot = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: newBlock.date,
          allDay: newBlock.allDay,
          time: newBlock.allDay ? null : newBlock.time,
          reason: newBlock.reason
        })
      });

      if (response.ok) {
        await fetchScheduleData();
        setShowBlockForm(false);
        setNewBlock({
          date: formatDateLocal(new Date()),
          allDay: true,
          time: '09:00',
          reason: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du créneau bloqué:', error);
    }
  };

  const handleDeleteBlockedSlot = async (id: string) => {
    if (!confirm('Supprimer ce créneau bloqué ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/blocked-slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchScheduleData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'hours'
              ? 'bg-[#d4b5a0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Horaires d'ouverture
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'blocked'
              ? 'bg-[#d4b5a0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Dates bloquées
        </button>
      </div>

      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#2c3e50] mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#d4b5a0]" />
            Horaires d'ouverture de l'institut
          </h2>

          <div className="space-y-4">
            {workingHours.map((hour) => {
              const DayIcon = dayIcons[hour.dayOfWeek];
              return (
                <div
                  key={hour.id}
                  className={`border rounded-lg p-4 transition-all ${
                    hour.isOpen 
                      ? 'border-[#d4b5a0] bg-[#d4b5a0]/5' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DayIcon className={`w-5 h-5 ${hour.isOpen ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
                      <span className={`font-medium text-lg ${hour.isOpen ? 'text-[#2c3e50]' : 'text-gray-500'}`}>
                        {dayNames[hour.dayOfWeek]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {hour.isOpen ? (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={hour.startTime}
                              onChange={(e) => handleTimeChange(hour.dayOfWeek, 'startTime', e.target.value)}
                              className="px-3 py-1 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                            />
                            <span className="text-gray-500">à</span>
                            <input
                              type="time"
                              value={hour.endTime}
                              onChange={(e) => handleTimeChange(hour.dayOfWeek, 'endTime', e.target.value)}
                              className="px-3 py-1 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-red-500 font-medium">FERMÉ</span>
                      )}

                      <button
                        onClick={() => handleToggleDay(hour.dayOfWeek)}
                        className={`p-2 rounded-lg transition-colors ${
                          hour.isOpen 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {hour.isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600 px-4 py-2">
                <CheckCircle className="w-5 h-5" />
                <span>Horaires sauvegardés !</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 px-4 py-2">
                <AlertCircle className="w-5 h-5" />
                <span>Erreur lors de la sauvegarde</span>
              </div>
            )}
            <button
              onClick={handleSaveHours}
              disabled={saveStatus === 'saving'}
              className="px-6 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer les horaires'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#2c3e50] flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-500" />
              Dates et créneaux bloqués
            </h2>
            <button
              onClick={() => setShowBlockForm(true)}
              className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Bloquer une date
            </button>
          </div>

          {showBlockForm && (
            <div className="border-2 border-[#d4b5a0] rounded-lg p-4 mb-6 bg-[#d4b5a0]/5">
              <h3 className="font-medium text-[#2c3e50] mb-4">Nouveau blocage</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Date</label>
                  <input
                    type="date"
                    value={newBlock.date}
                    onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={newBlock.allDay}
                        onChange={() => setNewBlock({ ...newBlock, allDay: true })}
                        className="text-[#d4b5a0]"
                      />
                      <span>Journée entière</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!newBlock.allDay}
                        onChange={() => setNewBlock({ ...newBlock, allDay: false })}
                        className="text-[#d4b5a0]"
                      />
                      <span>Créneau spécifique</span>
                    </label>
                  </div>
                </div>

                {!newBlock.allDay && (
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">Heure</label>
                    <input
                      type="time"
                      value={newBlock.time}
                      onChange={(e) => setNewBlock({ ...newBlock, time: e.target.value })}
                      className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Raison</label>
                  <input
                    type="text"
                    value={newBlock.reason}
                    onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                    placeholder="Ex: Congés, Formation, Rendez-vous personnel..."
                    className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBlockForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddBlockedSlot}
                    disabled={!newBlock.reason}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    Bloquer
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {blockedSlots.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune date bloquée</p>
            ) : (
              blockedSlots.map((slot) => (
                <div key={slot.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-[#2c3e50]">
                        {new Date(slot.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {!slot.allDay && slot.time && ` à ${slot.time}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{slot.reason}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        slot.allDay 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {slot.allDay ? 'Journée entière' : 'Créneau spécifique'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedSlot(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}