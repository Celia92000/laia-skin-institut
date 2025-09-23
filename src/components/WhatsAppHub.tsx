'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Zap, MessageSquare, FileText } from 'lucide-react';
import WhatsAppCampaigns from './WhatsAppCampaigns';
import WhatsAppAutomations from './WhatsAppAutomations';
import WhatsAppReal from './WhatsAppReal';
import WhatsAppHistory from './WhatsAppHistory';
import WhatsAppSimple from './WhatsAppSimple';

export default function WhatsAppHub() {
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'conversations' | 'campaigns' | 'automations'>('templates');

  return (
    <div>
      {/* Header avec sous-onglets */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-green-500" />
            Centre WhatsApp
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'templates'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => setActiveSubTab('conversations')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'conversations'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Conversations
            </button>
            <button
              onClick={() => setActiveSubTab('campaigns')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'campaigns'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send className="w-4 h-4" />
              Campagnes
            </button>
            <button
              onClick={() => setActiveSubTab('automations')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'automations'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              Automatisations
            </button>
          </div>
        </div>
      </div>

      {/* Contenu des sous-onglets */}
      {activeSubTab === 'templates' && <WhatsAppSimple />}
      {activeSubTab === 'conversations' && <WhatsAppReal />}
      {activeSubTab === 'campaigns' && <WhatsAppCampaigns />}
      {activeSubTab === 'automations' && <WhatsAppAutomations />}
    </div>
  );
}