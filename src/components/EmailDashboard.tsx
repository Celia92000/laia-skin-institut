'use client';

import React, { useState } from 'react';
import { Mail, Send, Inbox, Clock, Zap, BarChart3, Settings, History, Users, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import EmailComposer from './EmailComposer';
import EmailHistory from './EmailHistory';
import EmailInbox from './EmailInbox';
import EmailAutomationsEnhanced from './EmailAutomationsEnhanced';
import ClientSegmentation from './ClientSegmentation';

type TabType = 'compose' | 'inbox' | 'history' | 'automations' | 'campaigns' | 'analytics';

export default function EmailDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('compose');

  const tabs = [
    { id: 'compose' as TabType, label: 'Composer', icon: Send, color: 'blue' },
    { id: 'inbox' as TabType, label: 'Boîte mail', icon: Inbox, color: 'green' },
    { id: 'history' as TabType, label: 'Historique', icon: History, color: 'purple' },
    { id: 'automations' as TabType, label: 'Automatisations', icon: Zap, color: 'orange' },
    { id: 'campaigns' as TabType, label: 'Campagnes', icon: Users, color: 'pink' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3, color: 'indigo' }
  ];

  // Stats temps réel
  const stats = {
    emailsSentToday: 12,
    emailsReceivedToday: 8,
    activeAutomations: 5,
    campaignsActive: 2,
    openRate: 67,
    clickRate: 23
  };

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="w-8 h-8" />
              Centre de Communication Email
            </h2>
            <p className="text-blue-100 mt-1">
              Gérez tous vos emails depuis un seul endroit
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Adresse email professionnelle</p>
            <p className="font-semibold">contact@laia.skininstitut.fr</p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <Send className="w-4 h-4" />
              <span className="text-xl font-bold">{stats.emailsSentToday}</span>
            </div>
            <p className="text-xs text-blue-100">Envoyés aujourd'hui</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <Inbox className="w-4 h-4" />
              <span className="text-xl font-bold">{stats.emailsReceivedToday}</span>
            </div>
            <p className="text-xs text-blue-100">Reçus aujourd'hui</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xl font-bold">{stats.activeAutomations}</span>
            </div>
            <p className="text-xs text-blue-100">Automatisations</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xl font-bold">{stats.campaignsActive}</span>
            </div>
            <p className="text-xs text-blue-100">Campagnes actives</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xl font-bold">{stats.openRate}%</span>
            </div>
            <p className="text-xs text-blue-100">Taux ouverture</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xl font-bold">{stats.clickRate}%</span>
            </div>
            <p className="text-xs text-blue-100">Taux de clic</p>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={activeTab === tab.id ? {
                  background: tab.color === 'blue' ? '#3B82F6' :
                              tab.color === 'green' ? '#10B981' :
                              tab.color === 'purple' ? '#8B5CF6' :
                              tab.color === 'orange' ? '#F97316' :
                              tab.color === 'pink' ? '#EC4899' :
                              '#6366F1'
                } : {}}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'compose' && <EmailComposer />}
        {activeTab === 'inbox' && <EmailInbox />}
        {activeTab === 'history' && <EmailHistory />}
        {activeTab === 'automations' && <EmailAutomationsEnhanced />}
        {activeTab === 'campaigns' && <ClientSegmentation />}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-500" />
              Analytics Email
            </h3>

            <div className="grid grid-cols-3 gap-6">
              {/* Performance globale */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Performance Globale</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Taux d'ouverture</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Taux de clic</span>
                      <span className="font-medium">23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Taux de conversion</span>
                      <span className="font-medium">12%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top campagnes */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Top Campagnes</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">🎂 Anniversaires</span>
                    <span className="text-sm font-medium text-green-600">89% ouverture</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">📅 Rappels RDV</span>
                    <span className="text-sm font-medium text-blue-600">76% ouverture</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">⭐ Demandes avis</span>
                    <span className="text-sm font-medium text-purple-600">45% conversion</span>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Activité Récente</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Email ouvert par Marie D.</span>
                    <span className="text-gray-400 text-xs">Il y a 5 min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Lien cliqué par Sophie M.</span>
                    <span className="text-gray-400 text-xs">Il y a 23 min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Avis laissé par Julie B.</span>
                    <span className="text-gray-400 text-xs">Il y a 1h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Campagne envoyée (12 destinataires)</span>
                    <span className="text-gray-400 text-xs">Il y a 2h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Emails envoyés (30 derniers jours)</h4>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 45, 78, 52, 89, 72, 91, 68, 85, 79, 94, 88, 76, 83, 90].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Répartition par type</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-700 flex-1">Automatisations</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700 flex-1">Campagnes</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm text-gray-700 flex-1">Emails manuels</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conseils d'amélioration */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils pour améliorer vos performances</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vos emails d'anniversaire ont le meilleur taux d'ouverture - continuez ainsi !</li>
                <li>• Essayez d'envoyer vos campagnes entre 10h et 11h pour de meilleurs résultats</li>
                <li>• Ajoutez plus d'émojis dans vos objets pour augmenter le taux d'ouverture</li>
                <li>• Segmentez davantage vos listes pour des messages plus personnalisés</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}