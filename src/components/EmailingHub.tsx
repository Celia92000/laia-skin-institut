'use client';

import React, { useState } from 'react';
import { Mail, Users, Zap, Filter, Send, BarChart3, ExternalLink, Settings, PenTool, Inbox, FileText } from 'lucide-react';
import ClientSegmentation from './ClientSegmentation';
import EmailAutomations from './EmailAutomations';
import EmailCampaignHistory from './EmailCampaignHistory';
import EmailComposer from './EmailComposer';
import EmailInbox from './EmailInbox';
import EmailTemplateManager from './EmailTemplateManager';

export default function EmailingHub() {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'compose' | 'campaigns' | 'automations' | 'history' | 'templates'>('inbox');

  return (
    <div>
      {/* Header avec sous-onglets */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-500" />
            Centre Emailing
          </h2>
          <div className="flex gap-2">
            <a
              href="https://dashboard.emailjs.com/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 shadow-md"
            >
              <Settings className="w-4 h-4" />
              Gérer mes Templates
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="border-l border-gray-300 mx-2"></div>
            <button
              onClick={() => setActiveSubTab('inbox')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'inbox'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Boîte de réception
            </button>
            <button
              onClick={() => setActiveSubTab('compose')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'compose'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Composer un Email
            </button>
            <button
              onClick={() => setActiveSubTab('campaigns')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'campaigns'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send className="w-4 h-4" />
              Campagnes & Segmentation
            </button>
            <button
              onClick={() => setActiveSubTab('automations')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'automations'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              Automatisations
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Historique & Rapports
            </button>
            <button
              onClick={() => setActiveSubTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'templates'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Carte d'information EmailJS */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Configuration EmailJS Active
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-gray-600 mb-1">Service ID</p>
                <p className="font-mono font-semibold text-gray-900">default_service</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-gray-600 mb-1">Template Confirmation</p>
                <p className="font-mono font-semibold text-gray-900">template_myu4emv</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-gray-600 mb-1">Template Avis</p>
                <p className="font-mono font-semibold text-gray-900">template_36zodeb</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Emails actifs
              </span>
              <span className="text-gray-600">
                Email professionnel : <strong>contact@laia.skininstitut.fr</strong>
              </span>
            </div>
          </div>
          <div className="ml-4">
            <a
              href="https://dashboard.emailjs.com/admin/templates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Modifier les templates
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Contenu des sous-onglets */}
      {activeSubTab === 'inbox' && <EmailInbox />}
      {activeSubTab === 'compose' && <EmailComposer />}
      {activeSubTab === 'campaigns' && <ClientSegmentation />}
      {activeSubTab === 'automations' && <EmailAutomations />}
      {activeSubTab === 'history' && <EmailCampaignHistory />}
      {activeSubTab === 'templates' && <EmailTemplateManager />}
    </div>
  );
}