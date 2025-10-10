"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import {
  Clock, Calendar, Plus, Trash2, Save, AlertCircle,
  Repeat, Ban, Check, X, Settings
} from "lucide-react";

interface RecurringBlock {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 pour weekly
  dayOfMonth?: number; // 1-31 pour monthly
  timeSlots?: string[]; // Créneaux horaires spécifiques
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export default function AvailabilityManager() {
  const [recurringBlocks, setRecurringBlocks] = useState<RecurringBlock[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBlock, setNewBlock] = useState<RecurringBlock>({
    id: '',
    type: 'weekly',
    allDay: false
  });

  const daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

  // Charger les récurrences sauvegardées
  useEffect(() => {
    loadRecurringBlocks();
  }, []);

  const loadRecurringBlocks = async () => {
    try {
      const response = await fetch('/api/admin/recurring-blocks');
      if (response.ok) {
        const data = await response.json();
        setRecurringBlocks(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des récurrences:', error);
    }
  };

  const saveRecurringBlock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/recurring-blocks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      });

      if (response.ok) {
        const savedBlock = await response.json();
        setRecurringBlocks([...recurringBlocks, savedBlock]);
        setShowAddModal(false);
        setNewBlock({ id: '', type: 'weekly', allDay: false });
        
        // Appliquer immédiatement les blocages
        applyRecurringBlocks();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const deleteRecurringBlock = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/recurring-blocks?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setRecurringBlocks(recurringBlocks.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const applyRecurringBlocks = async () => {
    // Cette fonction génère et applique tous les blocages pour les 3 prochains mois
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const blocksToCreate = [];
    const current = new Date(today);

    while (current <= endDate) {
      for (const block of recurringBlocks) {
        let shouldBlock = false;

        switch (block.type) {
          case 'daily':
            shouldBlock = true;
            break;
          case 'weekly':
            shouldBlock = current.getDay() === block.dayOfWeek;
            break;
          case 'monthly':
            shouldBlock = current.getDate() === block.dayOfMonth;
            break;
        }

        if (shouldBlock) {
          if (block.allDay) {
            blocksToCreate.push({
              date: formatDateLocal(current),
              allDay: true,
              reason: block.reason || 'Récurrence automatique'
            });
          } else if (block.timeSlots) {
            block.timeSlots.forEach(time => {
              blocksToCreate.push({
                date: formatDateLocal(current),
                time,
                reason: block.reason || 'Récurrence automatique'
              });
            });
          } else if (block.startTime && block.endTime) {
            // Bloquer une plage horaire
            const start = timeSlots.indexOf(block.startTime);
            const end = timeSlots.indexOf(block.endTime);
            for (let i = start; i <= end; i++) {
              blocksToCreate.push({
                date: formatDateLocal(current),
                time: timeSlots[i],
                reason: block.reason || 'Récurrence automatique'
              });
            }
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }

    // Envoyer tous les blocages au serveur
    for (const block of blocksToCreate) {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(block)
        });
      } catch (error) {
        console.error('Erreur lors de l\'application du blocage:', error);
      }
    }

    alert(`${blocksToCreate.length} créneaux bloqués automatiquement pour les 3 prochains mois`);
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2c3e50] mb-2">
            Gestion des disponibilités récurrentes
          </h3>
          <p className="text-sm text-[#2c3e50]/70">
            Configurez des blocages automatiques qui se répètent régulièrement
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une récurrence
        </button>
      </div>

      {/* Liste des récurrences */}
      <div className="space-y-4">
        {recurringBlocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune récurrence configurée</p>
            <p className="text-sm text-gray-500 mt-2">
              Créez des blocages récurrents pour gagner du temps
            </p>
          </div>
        ) : (
          recurringBlocks.map(block => (
            <div key={block.id} className="border border-[#d4b5a0]/20 rounded-lg p-4 hover:bg-[#fdfbf7] transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Repeat className="w-5 h-5 text-[#d4b5a0]" />
                    <span className="font-medium text-[#2c3e50]">
                      {block.type === 'daily' && 'Tous les jours'}
                      {block.type === 'weekly' && `Chaque ${daysOfWeek.find(d => d.value === block.dayOfWeek)?.label}`}
                      {block.type === 'monthly' && `Le ${block.dayOfMonth} de chaque mois`}
                    </span>
                    {block.allDay && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        Journée entière
                      </span>
                    )}
                  </div>
                  
                  {!block.allDay && (
                    <div className="text-sm text-[#2c3e50]/70 ml-8">
                      {block.timeSlots && (
                        <p>Créneaux: {block.timeSlots.join(', ')}</p>
                      )}
                      {block.startTime && block.endTime && (
                        <p>De {block.startTime} à {block.endTime}</p>
                      )}
                    </div>
                  )}
                  
                  {block.reason && (
                    <p className="text-sm text-[#2c3e50]/60 mt-2 ml-8">
                      Raison: {block.reason}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => deleteRecurringBlock(block.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton pour appliquer les récurrences */}
      {recurringBlocks.length > 0 && (
        <button
          onClick={applyRecurringBlocks}
          className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Appliquer les récurrences pour les 3 prochains mois
        </button>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
              Nouvelle récurrence
            </h3>

            <div className="space-y-4">
              {/* Type de récurrence */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Type de récurrence
                </label>
                <select
                  value={newBlock.type}
                  onChange={(e) => setNewBlock({...newBlock, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                >
                  <option value="daily">Tous les jours</option>
                  <option value="weekly">Chaque semaine</option>
                  <option value="monthly">Chaque mois</option>
                </select>
              </div>

              {/* Jour de la semaine (si weekly) */}
              {newBlock.type === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Jour de la semaine
                  </label>
                  <select
                    value={newBlock.dayOfWeek || 1}
                    onChange={(e) => setNewBlock({...newBlock, dayOfWeek: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Jour du mois (si monthly) */}
              {newBlock.type === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Jour du mois
                  </label>
                  <select
                    value={newBlock.dayOfMonth || 1}
                    onChange={(e) => setNewBlock({...newBlock, dayOfMonth: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  >
                    {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Journée entière ou créneaux spécifiques */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBlock.allDay}
                    onChange={(e) => setNewBlock({...newBlock, allDay: e.target.checked})}
                    className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                  />
                  <span className="text-sm font-medium text-[#2c3e50]">
                    Bloquer toute la journée
                  </span>
                </label>
              </div>

              {/* Plage horaire (si pas toute la journée) */}
              {!newBlock.allDay && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                        De
                      </label>
                      <select
                        value={newBlock.startTime || '09:00'}
                        onChange={(e) => setNewBlock({...newBlock, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                        À
                      </label>
                      <select
                        value={newBlock.endTime || '19:00'}
                        onChange={(e) => setNewBlock({...newBlock, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Tous les créneaux entre ces heures seront bloqués
                    </p>
                  </div>
                </div>
              )}

              {/* Raison */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Raison (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pause déjeuner, Formation, etc."
                  value={newBlock.reason || ''}
                  onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewBlock({ id: '', type: 'weekly', allDay: false });
                }}
                className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveRecurringBlock}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}