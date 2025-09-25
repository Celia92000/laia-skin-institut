'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Clock, Users, Calendar, TrendingUp, 
  Settings, History, Zap, Star, Phone, ChevronRight, 
  CheckCircle, AlertCircle, Sparkles, Target, BarChart3,
  MessageSquare, Bell, Gift, Heart, Smile
} from 'lucide-react';

interface Stats {
  totalSent: number;
  deliveryRate: number;
  responseRate: number;
  activeConversations: number;
}

interface Template {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
  usage: number;
  successRate: number;
}

export default function WhatsAppModern() {
  const [activeView, setActiveView] = useState<'dashboard' | 'send' | 'templates' | 'automation' | 'history'>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalSent: 1247,
    deliveryRate: 98.5,
    responseRate: 67.3,
    activeConversations: 23
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const templates: Template[] = [
    { id: 'reminder', name: 'Rappel de RDV', icon: Bell, category: 'Automatique', usage: 423, successRate: 99 },
    { id: 'birthday', name: 'Anniversaire', icon: Gift, category: 'Fidélité', usage: 156, successRate: 100 },
    { id: 'promo', name: 'Promotion', icon: Sparkles, category: 'Marketing', usage: 89, successRate: 78 },
    { id: 'followup', name: 'Suivi post-soin', icon: Heart, category: 'Service', usage: 234, successRate: 92 },
    { id: 'review', name: 'Demande d\'avis', icon: Star, category: 'Feedback', usage: 67, successRate: 45 }
  ];

  const quickStats = [
    { label: 'Messages aujourd\'hui', value: '47', change: '+12%', color: 'from-green-500 to-emerald-500' },
    { label: 'Taux d\'ouverture', value: '94%', change: '+3%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Réponses', value: '31', change: '+8%', color: 'from-purple-500 to-pink-500' },
    { label: 'Nouveaux contacts', value: '8', change: '+2', color: 'from-orange-500 to-red-500' }
  ];

  const sendMessage = async () => {
    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
          template: selectedTemplate
        })
      });

      if (response.ok) {
        // Message envoyé avec succès
        setMessage('');
        setPhoneNumber('');
        setSelectedTemplate('');
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header moderne */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Centre WhatsApp Business</h1>
                <p className="text-sm text-gray-500">Gérez vos communications clients en temps réel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Connecté</span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation moderne */}
          <div className="flex gap-2 mt-6 border-b border-gray-100">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
              { id: 'send', label: 'Envoyer', icon: Send },
              { id: 'templates', label: 'Templates', icon: MessageSquare },
              { id: 'automation', label: 'Automatisation', icon: Zap },
              { id: 'history', label: 'Historique', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeView === tab.id
                    ? 'text-green-600 border-green-600 bg-green-50/50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Graphiques et insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance des templates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des Templates</h3>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <template.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.usage} envois</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{template.successRate}%</p>
                      <p className="text-xs text-gray-500">Taux de succès</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activité récente */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
              <div className="space-y-3">
                {[
                  { time: 'Il y a 5 min', action: 'Rappel envoyé', client: 'Marie Dupont', status: 'delivered' },
                  { time: 'Il y a 12 min', action: 'Message de bienvenue', client: 'Sophie Martin', status: 'read' },
                  { time: 'Il y a 1h', action: 'Promotion', client: 'Liste VIP (23)', status: 'sent' },
                  { time: 'Il y a 2h', action: 'Confirmation RDV', client: 'Julie Bernard', status: 'delivered' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'read' ? 'bg-blue-500' :
                        activity.status === 'delivered' ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.client}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'send' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Envoyer un message</h2>
            
            {/* Sélection du template */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <template.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Tapez votre message ici..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {message.length}/1600 caractères
              </p>
            </div>

            {/* Bouton d'envoi */}
            <button
              onClick={sendMessage}
              disabled={!phoneNumber || !message || sendingMessage}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingMessage ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeView === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <template.icon className="w-6 h-6 text-green-600" />
                </div>
                <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-lg">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Utilisations</span>
                  <span className="font-medium">{template.usage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taux de succès</span>
                  <span className="font-medium text-green-600">{template.successRate}%</span>
                </div>
              </div>
              <button className="w-full py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Utiliser ce template
              </button>
            </div>
          ))}
        </div>
      )}

      {activeView === 'automation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Automatisations actives</h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Rappel 24h avant RDV',
                  description: 'Envoie automatiquement un rappel la veille du rendez-vous',
                  active: true,
                  sent: 423,
                  icon: Clock
                },
                {
                  name: 'Message d\'anniversaire',
                  description: 'Souhaite l\'anniversaire avec une offre spéciale',
                  active: true,
                  sent: 156,
                  icon: Gift
                },
                {
                  name: 'Suivi post-soin',
                  description: '48h après la prestation pour prendre des nouvelles',
                  active: false,
                  sent: 234,
                  icon: Heart
                },
                {
                  name: 'Demande d\'avis',
                  description: '7 jours après la visite pour collecter les retours',
                  active: true,
                  sent: 67,
                  icon: Star
                }
              ].map((automation, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <automation.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{automation.name}</h4>
                      <p className="text-sm text-gray-500">{automation.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{automation.sent} messages envoyés</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={automation.active}
                      className="sr-only peer"
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}