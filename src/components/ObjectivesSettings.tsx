'use client';

import { useState, useEffect } from 'react';
import { Target, Save, TrendingUp, Euro, Calendar, Edit3, X, Check } from 'lucide-react';

interface ObjectivesSettingsProps {
  onClose?: () => void;
  onSave?: (objectives: Objectives) => void;
}

interface Objectives {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  servicesPerDay: number;
  averageTicket: number;
  conversionRate: number;
}

export default function ObjectivesSettings({ onClose, onSave }: ObjectivesSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [objectives, setObjectives] = useState<Objectives>({
    daily: 500,
    weekly: 5000,
    monthly: 20000,
    yearly: 240000,
    servicesPerDay: 8,
    averageTicket: 80,
    conversionRate: 75
  });

  const [tempObjectives, setTempObjectives] = useState<Objectives>(objectives);

  useEffect(() => {
    // Charger les objectifs depuis le localStorage
    const savedObjectives = localStorage.getItem('businessObjectives');
    if (savedObjectives) {
      const parsed = JSON.parse(savedObjectives);
      setObjectives(parsed);
      setTempObjectives(parsed);
    }
  }, []);

  const handleSave = () => {
    // Sauvegarder dans le localStorage
    localStorage.setItem('businessObjectives', JSON.stringify(tempObjectives));
    setObjectives(tempObjectives);
    setIsEditing(false);
    
    // Callback pour notifier le parent
    if (onSave) {
      onSave(tempObjectives);
    }
  };

  const handleCancel = () => {
    setTempObjectives(objectives);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Objectifs de Performance</h2>
            <p className="text-sm text-gray-600">Personnalisez vos objectifs commerciaux</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Valider
              </button>
            </>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Objectifs de chiffre d'affaires */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Euro className="w-4 h-4 text-green-600" />
          Objectifs de Chiffre d'Affaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              CA Journalier
            </label>
            <div className="relative">
              <input
                type="number"
                value={isEditing ? tempObjectives.daily : objectives.daily}
                onChange={(e) => setTempObjectives({ ...tempObjectives, daily: Number(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                  isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Par jour</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              CA Hebdomadaire
            </label>
            <div className="relative">
              <input
                type="number"
                value={isEditing ? tempObjectives.weekly : objectives.weekly}
                onChange={(e) => setTempObjectives({ ...tempObjectives, weekly: Number(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                  isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Par semaine</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              CA Mensuel
            </label>
            <div className="relative">
              <input
                type="number"
                value={isEditing ? tempObjectives.monthly : objectives.monthly}
                onChange={(e) => setTempObjectives({ ...tempObjectives, monthly: Number(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                  isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Par mois</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              CA Annuel
            </label>
            <div className="relative">
              <input
                type="number"
                value={isEditing ? tempObjectives.yearly : objectives.yearly}
                onChange={(e) => setTempObjectives({ ...tempObjectives, yearly: Number(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                  isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Par an</p>
          </div>
        </div>
      </div>

      {/* Objectifs opérationnels */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Objectifs Opérationnels
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nombre de prestations/jour
            </label>
            <input
              type="number"
              value={isEditing ? tempObjectives.servicesPerDay : objectives.servicesPerDay}
              onChange={(e) => setTempObjectives({ ...tempObjectives, servicesPerDay: Number(e.target.value) })}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">Services par jour</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Panier moyen cible
            </label>
            <div className="relative">
              <input
                type="number"
                value={isEditing ? tempObjectives.averageTicket : objectives.averageTicket}
                onChange={(e) => setTempObjectives({ ...tempObjectives, averageTicket: Number(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                  isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Par client</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Taux de conversion cible
            </label>
            <div className="relative">
              <input
                type="number"
                value={isEditing ? tempObjectives.conversionRate : objectives.conversionRate}
                onChange={(e) => setTempObjectives({ ...tempObjectives, conversionRate: Number(e.target.value) })}
                disabled={!isEditing}
                min="0"
                max="100"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#d4b5a0] ${
                  isEditing ? 'border-[#d4b5a0] bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Réservations confirmées</p>
          </div>
        </div>
      </div>

      {/* Calculs automatiques */}
      {!isEditing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">Calculs automatiques basés sur vos objectifs :</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-blue-700">CA/heure :</span>
              <span className="font-semibold text-blue-900 ml-1">
                {(objectives.daily / 8).toFixed(0)}€
              </span>
            </div>
            <div>
              <span className="text-blue-700">Services/semaine :</span>
              <span className="font-semibold text-blue-900 ml-1">
                {objectives.servicesPerDay * 6}
              </span>
            </div>
            <div>
              <span className="text-blue-700">CA moyen/service :</span>
              <span className="font-semibold text-blue-900 ml-1">
                {(objectives.daily / objectives.servicesPerDay).toFixed(0)}€
              </span>
            </div>
            <div>
              <span className="text-blue-700">Clients/mois :</span>
              <span className="font-semibold text-blue-900 ml-1">
                {Math.round(objectives.monthly / objectives.averageTicket)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}