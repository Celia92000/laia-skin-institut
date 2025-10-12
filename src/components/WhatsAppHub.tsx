'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Zap, MessageSquare, FileText, History, Key } from 'lucide-react';
import WhatsAppCampaigns from './WhatsAppCampaigns';
import WhatsAppAutomations from './WhatsAppAutomations';
import WhatsAppReal from './WhatsAppReal';
import WhatsAppHistory from './WhatsAppHistory';
import WhatsAppSimple from './WhatsAppSimple';
import WhatsAppAPISync from './WhatsAppAPISync';

export default function WhatsAppHub() {
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'conversations' | 'campaigns' | 'automations' | 'history' | 'sync'>('conversations');

  return (
    <div>
      {/* Header avec sous-onglets */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-green-500" />
            Centre WhatsApp
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <button
              onClick={() => setActiveSubTab('conversations')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                activeSubTab === 'conversations'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Conversations</span>
              <span className="sm:hidden">💬</span>
            </button>
            <button
              onClick={() => setActiveSubTab('campaigns')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                activeSubTab === 'campaigns'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Campagnes</span>
              <span className="sm:hidden">📤</span>
            </button>
            <button
              onClick={() => setActiveSubTab('automations')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                activeSubTab === 'automations'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Automatisations</span>
              <span className="sm:hidden">⚡</span>
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                activeSubTab === 'history'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">🕒</span>
            </button>
            <button
              onClick={() => setActiveSubTab('templates')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                activeSubTab === 'templates'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden">📄</span>
            </button>
            <button
              onClick={() => setActiveSubTab('sync')}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                activeSubTab === 'sync'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">API Sync</span>
              <span className="sm:hidden">🔑</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu des sous-onglets */}
      {activeSubTab === 'templates' && <WhatsAppSimple />}
      {activeSubTab === 'conversations' && <WhatsAppReal />}
      {activeSubTab === 'campaigns' && <WhatsAppCampaigns />}
      {activeSubTab === 'automations' && <WhatsAppAutomations />}
      {activeSubTab === 'history' && <WhatsAppHistory />}
      {activeSubTab === 'sync' && <WhatsAppAPISync />}
    </div>
  );
}