"use client";

import { useState } from 'react';
import { FaPlus, FaCalendarAlt, FaLightbulb, FaChartBar, FaKey, FaCog } from 'react-icons/fa';
import SimpleSocialMediaPlanner from './SimpleSocialMediaPlanner';
import DragDropCalendar from './DragDropCalendar';
import SocialMediaAPISync from '../SocialMediaAPISync';
import SocialMediaPreferences from './SocialMediaPreferences';

export default function SocialMediaHub() {
  const [activeTab, setActiveTab] = useState<'create' | 'plan' | 'stats' | 'sync' | 'preferences'>('create');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200">
            <h1 className="text-2xl font-serif font-bold text-[#8B6F5C]">
              Gestion des Réseaux Sociaux
            </h1>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 px-6 py-4 bg-amber-50/30">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaPlus className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Créer</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'plan'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaCalendarAlt className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Planifier</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaLightbulb className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Conseils</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'sync'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaKey className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">API Sync</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'preferences'
                  ? 'bg-[#8B6F5C] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <FaCog className="text-base" />
              <div className="text-left">
                <div className="font-semibold text-sm">Préférences</div>
              </div>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div>
          {activeTab === 'create' && <SimpleSocialMediaPlanner />}
          {activeTab === 'plan' && <DragDropCalendar />}
          {activeTab === 'sync' && <SocialMediaAPISync />}
          {activeTab === 'preferences' && <SocialMediaPreferences />}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stats dashboard */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-[#8B6F5C] mb-1">Engagement</h3>
                  <p className="text-3xl font-bold text-[#8B6F5C] mb-1">+45%</p>
                  <p className="text-sm text-gray-500">Cette semaine</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="text-lg font-semibold text-[#8B6F5C] mb-1">Abonnés</h3>
                  <p className="text-3xl font-bold text-[#8B6F5C] mb-1">+127</p>
                  <p className="text-sm text-gray-500">Ce mois-ci</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-lg font-semibold text-[#8B6F5C] mb-1">Publications</h3>
                  <p className="text-3xl font-bold text-[#8B6F5C] mb-1">24</p>
                  <p className="text-sm text-gray-500">Ce mois-ci</p>
                </div>
              </div>

              {/* Best performing content */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                <h2 className="text-xl font-serif font-bold text-[#8B6F5C] mb-6 flex items-center gap-2">
                  <span>🏆</span> Vos meilleurs contenus
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">📸</span>
                      <div>
                        <h4 className="font-semibold text-[#8B6F5C]">Photos avant/après</h4>
                        <p className="text-sm text-gray-600">+89% d'engagement</p>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B6F5C] w-[89%]"></div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🎬</span>
                      <div>
                        <h4 className="font-semibold text-[#8B6F5C]">Reels éducatifs</h4>
                        <p className="text-sm text-gray-600">+76% d'engagement</p>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B6F5C] w-[76%]"></div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">💡</span>
                      <div>
                        <h4 className="font-semibold text-[#8B6F5C]">Conseils beauté</h4>
                        <p className="text-sm text-gray-600">+64% d'engagement</p>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B6F5C] w-[64%]"></div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🎁</span>
                      <div>
                        <h4 className="font-semibold text-[#8B6F5C]">Promotions</h4>
                        <p className="text-sm text-gray-600">+58% d'engagement</p>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B6F5C] w-[58%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick tips */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                <h2 className="text-xl font-serif font-bold text-[#8B6F5C] mb-6 flex items-center gap-2">
                  <FaLightbulb className="text-[#8B6F5C]" /> Conseils personnalisés
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
                    <span className="text-2xl">✅</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Excellente fréquence de publication</h4>
                      <p className="text-sm text-gray-600">Vous publiez 3-4 fois par semaine, c'est parfait pour maintenir l'engagement !</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Variez vos horaires</h4>
                      <p className="text-sm text-gray-600">Testez différents horaires de publication pour toucher plus d'audience. Les stories du matin (8-10h) ont un excellent taux de visibilité.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Plus de Reels</h4>
                      <p className="text-sm text-gray-600">Les Reels génèrent 3x plus d'engagement que les posts classiques. Essayez d'en publier 2-3 par semaine.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="font-semibold text-[#8B6F5C] mb-1">Continuez les transformations</h4>
                      <p className="text-sm text-gray-600">Vos posts avant/après sont vos meilleurs performers ! Publiez-en au moins 1 par semaine.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
