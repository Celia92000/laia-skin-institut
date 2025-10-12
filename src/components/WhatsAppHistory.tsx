'use client';

import React, { useState, useEffect } from 'react';
import { formatDateLocal } from '@/lib/date-utils';
import { 
  MessageCircle, Search, Filter, Download, Eye,
  CheckCheck, Check, Clock, X, AlertCircle,
  Calendar, User, Phone, Mail, Tag, TrendingUp,
  ChevronDown, ChevronUp, RefreshCw, Trash2,
  Send, FileText, BarChart, PieChart, Activity,
  Users, Target, Zap, Copy, ExternalLink
} from 'lucide-react';

interface MessageHistory {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  message: string;
  messageType: 'manual' | 'automation' | 'campaign' | 'reminder';
  automationName?: string;
  campaignName?: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  errorMessage?: string;
  tags?: string[];
  metadata?: {
    service?: string;
    appointmentDate?: string;
    templateUsed?: string;
    variables?: Record<string, string>;
  };
}

interface MessageStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  avgResponseTime: string;
  topAutomations: { name: string; count: number }[];
  topClients: { name: string; count: number }[];
}

export default function WhatsAppHistory() {
  const [messages, setMessages] = useState<MessageHistory[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'automation' | 'campaign' | 'reminder'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'delivered' | 'read' | 'failed'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMessage, setSelectedMessage] = useState<MessageHistory | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'stats' | 'clients'>('list');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    avgResponseTime: '2h 15min',
    topAutomations: [],
    topClients: []
  });

  useEffect(() => {
    loadMessageHistory();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [searchTerm, filterType, filterStatus, dateRange, messages]);

  const loadMessageHistory = async () => {
    setLoading(true);
    // Simuler le chargement des données
    const mockMessages: MessageHistory[] = [
      {
        id: '1',
        clientId: 'c1',
        clientName: 'Marie Dupont',
        clientPhone: '+33612345678',
        clientEmail: 'marie.dupont@email.com',
        message: '📅 Rappel de votre RDV demain\n\nBonjour Marie,\n\nJe vous attends demain à 14h00 pour votre soin Hydro\'Naissance.\n\n📍 LAIA SKIN Institut\n💆 Durée : 60 min\n\nÀ demain ! 💕',
        messageType: 'automation',
        automationName: 'Rappel RDV 24h',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30),
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
        status: 'read',
        tags: ['Rappel', 'RDV'],
        metadata: {
          service: 'Hydro\'Naissance',
          appointmentDate: '2024-11-22',
          templateUsed: 'reminder_24h',
          variables: {
            clientName: 'Marie',
            appointmentTime: '14h00',
            serviceName: 'Hydro\'Naissance',
            duration: '60 min'
          }
        }
      },
      {
        id: '2',
        clientId: 'c2',
        clientName: 'Sophie Martin',
        clientPhone: '+33687654321',
        clientEmail: 'sophie.martin@email.com',
        message: '🌟 OFFRE EXCLUSIVE Sophie ! 🌟\n\n-20% sur tous les soins ce mois-ci !\n✨ BB Glow\n✨ Hydro\'Naissance\n✨ LED Thérapie\n\nRéservez vite : laiaskin.com',
        messageType: 'campaign',
        campaignName: 'Black Friday 2024',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 45),
        status: 'delivered',
        tags: ['Promo', 'Black Friday']
      },
      {
        id: '3',
        clientId: 'c3',
        clientName: 'Julie Bernard',
        clientPhone: '+33698765432',
        clientEmail: 'julie.bernard@email.com',
        message: 'Bonjour Julie ! Merci pour votre visite aujourd\'hui. N\'hésitez pas si vous avez des questions sur les soins post-traitement. Belle journée ! 💕',
        messageType: 'manual',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 20),
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'read',
        tags: ['Suivi', 'Manuel']
      },
      {
        id: '4',
        clientId: 'c4',
        clientName: 'Emma Rousseau',
        clientPhone: '+33611223344',
        clientEmail: 'emma.rousseau@email.com',
        message: '🎂 Joyeux anniversaire Emma ! 🎉\n\nPour célébrer, profitez de -30% sur le soin de votre choix ce mois-ci !\n\nÀ bientôt,\nLaïa 💕',
        messageType: 'automation',
        automationName: 'Anniversaire client',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000 * 60),
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
        status: 'read',
        tags: ['Anniversaire', 'Fidélité'],
        metadata: {
          templateUsed: 'birthday',
          variables: {
            clientName: 'Emma'
          }
        }
      },
      {
        id: '5',
        clientId: 'c5',
        clientName: 'Claire Dubois',
        clientPhone: '+33655443322',
        clientEmail: 'claire.dubois@email.com',
        message: 'Message non délivré',
        messageType: 'campaign',
        campaignName: 'Relance inactive',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        status: 'failed',
        errorMessage: 'Numéro WhatsApp non valide',
        tags: ['Échec', 'À vérifier']
      },
      {
        id: '6',
        clientId: 'c1',
        clientName: 'Marie Dupont',
        clientPhone: '+33612345678',
        clientEmail: 'marie.dupont@email.com',
        message: '🌟 Félicitations Marie ! 🌟\n\nVous avez atteint 5 visites ! 🎉\n\nVotre récompense :\n🎁 1 soin LED OFFERT (valeur 60€)\n\nRéservez : laiaskin.com',
        messageType: 'automation',
        automationName: 'Programme fidélité',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
        deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 96 + 1000 * 40),
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 95),
        status: 'read',
        tags: ['Fidélité', 'Récompense']
      }
    ];

    setMessages(mockMessages);
    calculateStats(mockMessages);
    setLoading(false);
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.clientPhone.includes(searchTerm) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.automationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.campaignName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(msg => msg.messageType === filterType);
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(msg => msg.status === filterStatus);
    }

    // Filtre par date
    if (dateRange.start) {
      filtered = filtered.filter(msg => 
        new Date(msg.sentAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(msg => 
        new Date(msg.sentAt) <= new Date(dateRange.end)
      );
    }

    setFilteredMessages(filtered);
  };

  const calculateStats = (messageList: MessageHistory[]) => {
    const total = messageList.length;
    const sent = messageList.filter(m => m.status === 'sent').length;
    const delivered = messageList.filter(m => m.status === 'delivered').length;
    const read = messageList.filter(m => m.status === 'read').length;
    const failed = messageList.filter(m => m.status === 'failed').length;

    // Top automatisations
    const automationCounts: Record<string, number> = {};
    messageList.forEach(msg => {
      if (msg.automationName) {
        automationCounts[msg.automationName] = (automationCounts[msg.automationName] || 0) + 1;
      }
    });
    const topAutomations = Object.entries(automationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top clients
    const clientCounts: Record<string, number> = {};
    messageList.forEach(msg => {
      clientCounts[msg.clientName] = (clientCounts[msg.clientName] || 0) + 1;
    });
    const topClients = Object.entries(clientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      total,
      sent,
      delivered,
      read,
      failed,
      avgResponseTime: '2h 15min',
      topAutomations,
      topClients
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'sent': return <Check className="w-4 h-4 text-gray-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <X className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-700';
      case 'automation': return 'bg-green-100 text-green-700';
      case 'campaign': return 'bg-purple-100 text-purple-700';
      case 'reminder': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Client', 'Téléphone', 'Type', 'Statut', 'Message', 'Automatisation/Campagne'],
      ...filteredMessages.map(msg => [
        new Date(msg.sentAt).toLocaleString('fr-FR'),
        msg.clientName,
        msg.clientPhone,
        msg.messageType,
        msg.status,
        msg.message.replace(/\n/g, ' '),
        msg.automationName || msg.campaignName || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-history-${formatDateLocal(new Date())}.csv`;
    a.click();
  };

  // Grouper les messages par client
  const messagesByClient = filteredMessages.reduce((acc, msg) => {
    if (!acc[msg.clientId]) {
      acc[msg.clientId] = {
        client: {
          id: msg.clientId,
          name: msg.clientName,
          phone: msg.clientPhone,
          email: msg.clientEmail
        },
        messages: []
      };
    }
    acc[msg.clientId].messages.push(msg);
    return acc;
  }, {} as Record<string, { client: any, messages: MessageHistory[] }>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-green-500" />
            Historique des messages WhatsApp
          </h2>
          <p className="text-gray-600 mt-1">
            Suivez tous les messages envoyés et leur statut
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMessageHistory}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-6 h-6 text-gray-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600">Total envoyés</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-6 h-6 text-blue-500" />
            <span className="text-2xl font-bold text-blue-900">{stats.sent}</span>
          </div>
          <p className="text-sm text-blue-700">En cours</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCheck className="w-6 h-6 text-green-500" />
            <span className="text-2xl font-bold text-green-900">{stats.delivered}</span>
          </div>
          <p className="text-sm text-green-700">Délivrés</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-6 h-6 text-purple-500" />
            <span className="text-2xl font-bold text-purple-900">{stats.read}</span>
          </div>
          <p className="text-sm text-purple-700">Lus</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-2xl font-bold text-red-900">{stats.failed}</span>
          </div>
          <p className="text-sm text-red-700">Échecs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'list'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Liste des messages
        </button>
        <button
          onClick={() => setActiveView('clients')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'clients'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Par client
        </button>
        <button
          onClick={() => setActiveView('stats')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'stats'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart className="w-4 h-4 inline mr-2" />
          Statistiques
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par client, téléphone, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Tous les types</option>
          <option value="manual">Manuel</option>
          <option value="automation">Automatisation</option>
          <option value="campaign">Campagne</option>
          <option value="reminder">Rappel</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="sent">Envoyé</option>
          <option value="delivered">Délivré</option>
          <option value="read">Lu</option>
          <option value="failed">Échec</option>
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Contenu selon la vue active */}
      {activeView === 'list' && (
        <div className="space-y-3">
          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedMessage(msg)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-bold">
                    {msg.clientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {msg.clientName}
                      </h4>
                      <span className="text-sm text-gray-500">{msg.clientPhone}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(msg.messageType)}`}>
                        {msg.messageType === 'manual' ? 'Manuel' :
                         msg.messageType === 'automation' ? 'Auto' :
                         msg.messageType === 'campaign' ? 'Campagne' : 'Rappel'}
                      </span>
                      {msg.automationName && (
                        <span className="text-xs text-gray-500">
                          • {msg.automationName}
                        </span>
                      )}
                      {msg.campaignName && (
                        <span className="text-xs text-gray-500">
                          • {msg.campaignName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.sentAt).toLocaleString('fr-FR')}
                      </span>
                      {msg.tags && msg.tags.length > 0 && (
                        <div className="flex gap-1">
                          {msg.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(msg.status)}
                  {msg.status === 'failed' && msg.errorMessage && (
                    <span className="text-xs text-red-500">{msg.errorMessage}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun message trouvé</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'clients' && (
        <div className="space-y-4">
          {Object.values(messagesByClient).map(({ client, messages }) => (
            <div key={client.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-bold">
                    {client.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{messages.length}</span>
                  <p className="text-sm text-gray-500">messages</p>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {messages.map(msg => (
                    <div key={msg.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 line-clamp-1">{msg.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.sentAt).toLocaleDateString('fr-FR')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(msg.messageType)}`}>
                            {msg.messageType}
                          </span>
                        </div>
                      </div>
                      {getStatusIcon(msg.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'stats' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Top automatisations</h3>
              <div className="space-y-3">
                {stats.topAutomations.map((auto, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{auto.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(auto.count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {auto.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Temps de réponse moyen</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">{stats.avgResponseTime}</p>
                <p className="text-sm text-gray-500 mt-2">Sur les 30 derniers jours</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Clients les plus actifs</h3>
              <div className="space-y-3">
                {stats.topClients.map((client, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{client.name}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {client.count} messages
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Taux de lecture</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages lus</span>
                  <span className="text-sm font-medium">{Math.round((stats.read / stats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                    style={{ width: `${(stats.read / stats.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {stats.read} sur {stats.total} messages ont été lus
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Détails du message</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-bold">
                  {selectedMessage.clientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedMessage.clientName}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{selectedMessage.clientPhone}</span>
                    <span>•</span>
                    <span>{selectedMessage.clientEmail}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getTypeColor(selectedMessage.messageType)}`}>
                    {selectedMessage.messageType}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Statut</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedMessage.status)}
                    <span className="text-sm font-medium">{selectedMessage.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Envoyé le</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedMessage.sentAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                {selectedMessage.readAt && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Lu le</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedMessage.readAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {selectedMessage.metadata && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Variables utilisées</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedMessage.metadata.variables || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMessage.tags && selectedMessage.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedMessage.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selectedMessage.message);
                    setCopySuccess('Message copié !');
                    setTimeout(() => setCopySuccess(null), 2000);
                  } catch (err) {
                    setCopySuccess('Erreur lors de la copie');
                    setTimeout(() => setCopySuccess(null), 2000);
                  }
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 relative"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? copySuccess : 'Copier'}
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}