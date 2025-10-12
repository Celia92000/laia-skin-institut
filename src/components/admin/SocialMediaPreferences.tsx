"use client";

import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface DayPreference {
  day: number;
  categories: string[];
  contentTypes: ('post' | 'reel' | 'story')[];
}

const categories = [
  { id: 'prestations', label: 'Prestations', emoji: '💆', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'conseils', label: 'Conseils', emoji: '💡', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'avant-apres', label: 'Avant/Après', emoji: '✨', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'personnel', label: 'Personnel', emoji: '💕', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'promotion', label: 'Promotion', emoji: '🔥', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'temoignage', label: 'Témoignage', emoji: '⭐', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { id: 'coulisses', label: 'Coulisses', emoji: '📸', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'nouveaute', label: 'Nouveauté', emoji: '🎁', color: 'bg-rose-100 text-rose-800 border-rose-300' }
];

const contentTypes = [
  { type: 'post' as const, label: 'Publication', emoji: '📄', color: 'bg-blue-500', description: 'Post classique avec image et texte' },
  { type: 'reel' as const, label: 'Reel', emoji: '🎬', color: 'bg-purple-500', description: 'Vidéo courte verticale' },
  { type: 'story' as const, label: 'Story', emoji: '📸', color: 'bg-pink-500', description: 'Contenu éphémère 24h' }
];

const daysOfWeek = [
  { index: 0, name: 'Lundi', short: 'Lun' },
  { index: 1, name: 'Mardi', short: 'Mar' },
  { index: 2, name: 'Mercredi', short: 'Mer' },
  { index: 3, name: 'Jeudi', short: 'Jeu' },
  { index: 4, name: 'Vendredi', short: 'Ven' },
  { index: 5, name: 'Samedi', short: 'Sam' },
  { index: 6, name: 'Dimanche', short: 'Dim' }
];

const defaultPreferences: DayPreference[] = [
  { day: 0, categories: ['prestations', 'nouveaute'], contentTypes: ['post', 'reel'] },
  { day: 1, categories: ['conseils', 'avant-apres'], contentTypes: ['reel', 'story'] },
  { day: 2, categories: ['promotion', 'temoignage'], contentTypes: ['post'] },
  { day: 3, categories: ['prestations', 'coulisses'], contentTypes: ['story', 'reel'] },
  { day: 4, categories: ['personnel', 'conseils'], contentTypes: ['post', 'story'] },
  { day: 5, categories: ['promotion', 'avant-apres'], contentTypes: ['reel'] },
  { day: 6, categories: ['personnel', 'coulisses'], contentTypes: ['story'] }
];

export default function SocialMediaPreferences() {
  const [preferences, setPreferences] = useState<DayPreference[]>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    const saved = localStorage.getItem('socialMediaPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement préférences:', e);
      }
    }
  };

  const savePreferences = () => {
    localStorage.setItem('socialMediaPreferences', JSON.stringify(preferences));
    setHasChanges(false);
    alert('✅ Préférences sauvegardées !');
  };

  const resetToDefaults = () => {
    if (confirm('Voulez-vous vraiment réinitialiser vos préférences ?')) {
      setPreferences(defaultPreferences);
      localStorage.setItem('socialMediaPreferences', JSON.stringify(defaultPreferences));
      setHasChanges(false);
      alert('✅ Préférences réinitialisées !');
    }
  };

  const toggleCategory = (dayIndex: number, categoryId: string) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.day === dayIndex) {
        const categories = pref.categories.includes(categoryId)
          ? pref.categories.filter(c => c !== categoryId)
          : [...pref.categories, categoryId];
        return { ...pref, categories };
      }
      return pref;
    }));
    setHasChanges(true);
  };

  const toggleContentType = (dayIndex: number, type: 'post' | 'reel' | 'story') => {
    setPreferences(prev => prev.map(pref => {
      if (pref.day === dayIndex) {
        const contentTypes = pref.contentTypes.includes(type)
          ? pref.contentTypes.filter(t => t !== type)
          : [...pref.contentTypes, type];
        return { ...pref, contentTypes };
      }
      return pref;
    }));
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#8B6F5C] mb-2 flex items-center gap-2">
                ⚙️ Préférences de Publication
              </h1>
              <p className="text-gray-600">
                Configurez vos jours préférés pour chaque type de contenu et catégorie
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>
              <button
                onClick={savePreferences}
                disabled={!hasChanges}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  hasChanges
                    ? 'bg-[#8B6F5C] text-white hover:bg-[#6d5847] shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>

          {hasChanges && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
              ⚠️ Vous avez des modifications non sauvegardées
            </div>
          )}
        </div>

        {/* Content Types Legend */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#8B6F5C] mb-4">📋 Types de contenu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentTypes.map(type => (
              <div
                key={type.type}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200"
              >
                <div className={`${type.color} text-white p-3 rounded-lg text-2xl`}>
                  {type.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6">
          <h2 className="text-xl font-semibold text-[#8B6F5C] mb-6">📅 Configuration par jour de la semaine</h2>

          <div className="space-y-6">
            {daysOfWeek.map(day => {
              const dayPref = preferences.find(p => p.day === day.index) || { day: day.index, categories: [], contentTypes: [] };

              return (
                <div key={day.index} className="border-2 border-amber-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#8B6F5C]">{day.name}</h3>
                    <div className="text-sm text-gray-500">
                      {dayPref.contentTypes.length} type(s) • {dayPref.categories.length} catégorie(s)
                    </div>
                  </div>

                  {/* Content Types Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Types de contenu à publier :
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {contentTypes.map(type => {
                        const isSelected = dayPref.contentTypes.includes(type.type);
                        return (
                          <button
                            key={type.type}
                            onClick={() => toggleContentType(day.index, type.type)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                              isSelected
                                ? `${type.color} text-white border-transparent shadow-md scale-105`
                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <span className="text-lg">{type.emoji}</span>
                            <span className="font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Categories Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Catégories de contenu :
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => {
                        const isSelected = dayPref.categories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggleCategory(day.index, cat.id)}
                            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-sm ${
                              isSelected
                                ? `${cat.color} shadow-md scale-105 font-semibold`
                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save reminder */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 bg-[#8B6F5C] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <Save className="w-5 h-5" />
            <span className="font-medium">N'oubliez pas de sauvegarder !</span>
          </div>
        )}
      </div>
    </div>
  );
}
