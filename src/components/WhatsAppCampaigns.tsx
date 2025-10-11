'use client';

import React, { useState, useEffect } from 'react';
import {
  Send, Plus, Users, Filter, Target, TrendingUp,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Edit2, Trash2, Copy, Eye, Search, SortDesc,
  MessageCircle, UserCheck, Activity, BarChart3,
  Sparkles, Zap, FileText, Download, Upload, Play
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  targetAudience: {
    segments: string[];
    filters: {
      age?: { min: number; max: number };
      lastVisit?: string;
      totalSpent?: { min: number };
      services?: string[];
    };
    estimatedReach: number;
  };
  message: {
    content: string;
    mediaUrl?: string;
    buttons?: Array<{
      text: string;
      url?: string;
    }>;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    date?: Date;
    time?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  status: 'draft' | 'scheduled' | 'sent' | 'active' | 'paused';
  stats?: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    replied: number;
  };
  createdAt: Date;
  sentAt?: Date;
}

export default function WhatsAppCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'scheduled' | 'draft'>('all');
  
  // États pour les filtres
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'scheduled' | 'sent' | 'draft'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchCampaign, setSearchCampaign] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name' | 'performance'>('date-desc');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    // Charger les campagnes avec des données test
    const testCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Promo Black Friday',
        description: 'Offre spéciale -30% sur tous les soins',
        targetAudience: {
          segments: ['VIP', 'Réguliers'],
          filters: {
            lastVisit: '3_months',
            totalSpent: { min: 200 }
          },
          estimatedReach: 145
        },
        message: {
          content: '🎉 BLACK FRIDAY chez LAIA SKIN ! 🎉\n\n-30% sur TOUS les soins du 24 au 27 novembre !\n\n✨ Hydra Naissance : 63€ au lieu de 90€\n✨ LED Therapy : 42€ au lieu de 60€\n\n📅 Réservez vite : laiaskin.com\n\nOffre limitée !',
          buttons: [
            { text: 'Réserver maintenant', url: 'https://laiaskin.com/booking' }
          ]
        },
        schedule: {
          type: 'scheduled',
          date: new Date('2024-11-24'),
          time: '10:00'
        },
        status: 'scheduled',
        createdAt: new Date('2024-11-20'),
        stats: {
          sent: 0,
          delivered: 0,
          read: 0,
          clicked: 0,
          replied: 0
        }
      },
      {
        id: '2',
        name: 'Rappel soins saisonniers',
        description: 'Conseils pour préparer la peau à l\'hiver',
        targetAudience: {
          segments: ['Tous les clients'],
          filters: {},
          estimatedReach: 312
        },
        message: {
          content: '❄️ L\'hiver arrive, votre peau a besoin de vous !\n\nProtégez votre peau du froid avec nos soins spécialisés :\n\n💧 Hydratation intense\n🌟 Nutrition profonde\n✨ Protection barrière\n\nProfitez de -20% sur les soins hydratants ce mois-ci !\n\n📞 06 12 34 56 78',
        },
        schedule: {
          type: 'immediate'
        },
        status: 'sent',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        stats: {
          sent: 312,
          delivered: 298,
          read: 245,
          clicked: 89,
          replied: 23
        }
      },
      {
        id: '3',
        name: 'Newsletter mensuelle',
        description: 'Actualités et conseils du mois',
        targetAudience: {
          segments: ['Newsletter'],
          filters: {},
          estimatedReach: 189
        },
        message: {
          content: '📰 Newsletter LAIA SKIN - Novembre\n\n✨ Nouveauté : Le soin Glow Booster\n📚 Article : Les 5 erreurs skincare à éviter\n🎁 Offre du mois : -15% sur les peelings\n\nRendez-vous sur notre blog pour plus de conseils !',
        },
        schedule: {
          type: 'recurring',
          frequency: 'monthly'
        },
        status: 'active',
        createdAt: new Date('2024-10-01'),
        sentAt: new Date('2024-11-01'),
        stats: {
          sent: 189,
          delivered: 180,
          read: 145,
          clicked: 67,
          replied: 12
        }
      }
    ];
    setCampaigns(testCampaigns);
  };

  const getFilteredCampaigns = () => {
    let filtered = [...campaigns];
    
    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    // Filtre par date
    if (filterDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(campaign => {
        const campaignDate = campaign.sentAt || campaign.createdAt;
        switch (filterDateRange) {
          case 'today':
            return campaignDate >= today;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return campaignDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return campaignDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    // Filtre par recherche
    if (searchCampaign) {
      const search = searchCampaign.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (b.sentAt || b.createdAt).getTime() - (a.sentAt || a.createdAt).getTime();
        case 'date-asc':
          return (a.sentAt || a.createdAt).getTime() - (b.sentAt || b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          const perfA = a.stats ? (a.stats.clicked / a.stats.sent) : 0;
          const perfB = b.stats ? (b.stats.clicked / b.stats.sent) : 0;
          return perfB - perfA;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-purple-100 text-purple-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: Campaign['status']) => {
    switch (status) {
      case 'sent': return 'Envoyée';
      case 'scheduled': return 'Programmée';
      case 'active': return 'Active';
      case 'draft': return 'Brouillon';
      case 'paused': return 'En pause';
      default: return status;
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
    avgOpenRate: campaigns.filter(c => c.stats?.sent).reduce((sum, c) => {
      return sum + ((c.stats?.read || 0) / (c.stats?.sent || 1));
    }, 0) / campaigns.filter(c => c.stats?.sent).length * 100 || 0,
    avgClickRate: campaigns.filter(c => c.stats?.sent).reduce((sum, c) => {
      return sum + ((c.stats?.clicked || 0) / (c.stats?.sent || 1));
    }, 0) / campaigns.filter(c => c.stats?.sent).length * 100 || 0
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="w-7 h-7 text-green-500" />
            Campagnes WhatsApp
          </h2>
          <p className="text-gray-600 mt-1">
            Créez et gérez vos campagnes marketing WhatsApp
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle campagne
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-blue-900">{stats.total}</span>
          </div>
          <p className="text-blue-700 text-xs font-medium">Total campagnes</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold text-purple-900">{stats.active}</span>
          </div>
          <p className="text-purple-700 text-xs font-medium">Actives</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-6 h-6 text-green-500" />
            <span className="text-xl font-bold text-green-900">{stats.totalSent}</span>
          </div>
          <p className="text-green-700 text-xs font-medium">Messages envoyés</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-orange-900">{stats.scheduled}</span>
          </div>
          <p className="text-orange-700 text-xs font-medium">Programmées</p>
        </div>
        <div className="bg-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-6 h-6 text-pink-500" />
            <span className="text-xl font-bold text-pink-900">{Math.round(stats.avgOpenRate)}%</span>
          </div>
          <p className="text-pink-700 text-xs font-medium">Taux ouverture</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold text-indigo-900">{Math.round(stats.avgClickRate)}%</span>
          </div>
          <p className="text-indigo-700 text-xs font-medium">Taux de clic</p>
        </div>
      </div>

      {/* Filtres simplifiés */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'all' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'scheduled' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Programmées
            </button>
            <button
              onClick={() => setFilterStatus('sent')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'sent' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Envoyées
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1">
            <button
              onClick={() => setFilterDateRange('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterDateRange === 'all' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterDateRange('today')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterDateRange === 'today' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setFilterDateRange('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterDateRange === 'week' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setFilterDateRange('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterDateRange === 'month' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ce mois
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une campagne..."
              value={searchCampaign}
              onChange={(e) => setSearchCampaign(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SortDesc className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="date-desc">Plus récent</option>
            <option value="date-asc">Plus ancien</option>
            <option value="name">Par nom</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="space-y-4">
        {getFilteredCampaigns().map(campaign => (
          <div
            key={campaign.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {campaign.targetAudience.estimatedReach} contacts
                  </span>
                  {campaign.stats && campaign.stats.sent > 0 && (
                    <>
                      <span className="flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        {campaign.stats.sent} envoyés
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {Math.round((campaign.stats.read / campaign.stats.sent) * 100)}% lus
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {Math.round((campaign.stats.clicked / campaign.stats.sent) * 100)}% cliqués
                      </span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {campaign.sentAt 
                      ? new Date(campaign.sentAt).toLocaleDateString('fr-FR')
                      : new Date(campaign.createdAt).toLocaleDateString('fr-FR')
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {campaign.status === 'scheduled' && (
                  <button 
                    onClick={() => {
                      const updatedCampaigns = campaigns.map(c => 
                        c.id === campaign.id ? { ...c, status: 'active' as const } : c
                      );
                      setCampaigns(updatedCampaigns);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Lancer maintenant"
                  >
                    <Play className="w-4 h-4 text-green-600" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    const duplicatedCampaign: Campaign = {
                      ...campaign,
                      id: Date.now().toString(),
                      name: `${campaign.name} (copie)`,
                      status: 'draft',
                      createdAt: new Date(),
                      sentAt: undefined,
                      stats: {
                        ...campaign.stats,
                        sent: 0,
                        delivered: 0,
                        read: 0,
                        clicked: 0,
                        replied: 0
                      }
                    };
                    setCampaigns([...campaigns, duplicatedCampaign]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Dupliquer la campagne"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setEditingCampaign(campaign)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaign.name}" ?`)) {
                      setCampaigns(campaigns.filter(c => c.id !== campaign.id));
                    }
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer la campagne"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {getFilteredCampaigns().length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune campagne trouvée
            </h3>
            <p className="text-gray-600">
              Modifiez vos critères de recherche ou créez une nouvelle campagne
            </p>
          </div>
        )}
      </div>

      {/* Modal de création/édition de campagne */}
      {(showCreateModal || editingCampaign) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne WhatsApp'}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Informations générales</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la campagne
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Promo Black Friday"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brève description de la campagne"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Message</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Contenu du message
                      </label>
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                          Template promo
                        </button>
                        <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          Template info
                        </button>
                        <button className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                          Template rappel
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={6}
                      placeholder="Écrivez votre message ici...&#10;&#10;Astuce: Vous pouvez utiliser des émojis 😊 et des sauts de ligne"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Variables disponibles : {'{nom}'}, {'{prenom}'}, {'{points}'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audience */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Audience cible</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Segments
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Tous les clients</span>
                      </label>
                      <label className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">VIP</span>
                      </label>
                      <label className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Réguliers</span>
                      </label>
                      <label className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Inactifs</span>
                      </label>
                      <label className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Nouveaux</span>
                      </label>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Portée estimée :</strong> 145 contacts
                    </p>
                  </div>
                </div>
              </div>

              {/* Programmation */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Programmation</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex items-center px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500">
                      <input type="radio" name="schedule" value="immediate" className="mr-2" defaultChecked />
                      <div>
                        <p className="text-sm font-medium">Envoi immédiat</p>
                        <p className="text-xs text-gray-600">Envoyer maintenant</p>
                      </div>
                    </label>
                    <label className="flex items-center px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500">
                      <input type="radio" name="schedule" value="scheduled" className="mr-2" />
                      <div>
                        <p className="text-sm font-medium">Programmé</p>
                        <p className="text-xs text-gray-600">Choisir date et heure</p>
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex items-center justify-between">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCampaign(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Enregistrer comme brouillon
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {editingCampaign ? 'Mettre à jour' : 'Créer et envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}