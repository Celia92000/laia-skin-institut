'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail, Send, Eye, MousePointer, XCircle, CheckCircle,
  AlertCircle, Calendar, Users, TrendingUp, Filter,
  Download, Search, ChevronDown, ChevronUp, BarChart3,
  Clock, Target, Activity, FileText, ExternalLink,
  UserX, UserCheck, Zap, MessageCircle, ArrowRight
} from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  openCount?: number;
  clickCount?: number;
  device?: string;
  location?: string;
}

interface CampaignHistory {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'campaign' | 'automation' | 'individual';
  sentAt: Date;
  completedAt?: Date;
  recipients: EmailRecipient[];
  stats: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed?: number;
    unsubscribed: number;
    pending: number;
  };
  performance: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    engagementScore: number;
  };
  segments?: string[];
  tags?: string[];
}

export default function EmailCampaignHistory() {
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignHistory[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignHistory | null>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced'>('all');
  const [searchRecipient, setSearchRecipient] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filtres globaux pour les campagnes
  const [filterType, setFilterType] = useState<'all' | 'campaign' | 'automation' | 'individual'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchCampaign, setSearchCampaign] = useState('');
  
  const exportToCSV = () => {
    // Préparer les données pour l'export
    const csvData = campaignHistory.map(campaign => ({
      'Nom de campagne': campaign.name,
      'Type': campaign.type === 'automation' ? 'Automatisation' : 'Campagne',
      'Date d\'envoi': new Date(campaign.sentAt).toLocaleDateString('fr-FR'),
      'Destinataires': campaign.stats.total,
      'Délivrés': campaign.stats.delivered,
      'Ouverts': campaign.stats.opened,
      'Taux d\'ouverture (%)': campaign.performance.openRate.toFixed(1),
      'Cliqués': campaign.stats.clicked,
      'Taux de clic (%)': campaign.performance.clickRate.toFixed(1),
      'Échecs': (campaign.stats.bounced || 0) + (campaign.stats.failed || 0),
      'Désabonnés': campaign.stats.unsubscribed,
      'Score engagement': campaign.performance.engagementScore
    }));
    
    // Convertir en CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${row[header as keyof typeof row] || ''}"`
        ).join(',')
      )
    ].join('\n');
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `campagnes_email_${formatDateLocal(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charger l'historique des campagnes depuis l'API
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...campaignHistory];

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }

    // Filtre par date
    if (filterDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(c => {
        const campaignDate = new Date(c.sentAt);

        if (filterDateRange === 'today') {
          return campaignDate >= today;
        } else if (filterDateRange === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return campaignDate >= weekAgo;
        } else if (filterDateRange === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return campaignDate >= monthAgo;
        }
        return true;
      });
    }

    // Filtre par recherche
    if (searchCampaign) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchCampaign.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchCampaign.toLowerCase())
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaignHistory, filterType, filterDateRange, searchCampaign]);

  const loadCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📧 Chargement des campagnes...');
      const response = await fetch('/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📧 Réponse API campaigns:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📧 Campagnes reçues:', data.length, data);
        setCampaignHistory(data);
        return;
      } else {
        console.error('📧 Erreur API:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
    }

    // En cas d'erreur, utiliser les données de démo
    const demoData: CampaignHistory[] = [
    {
      id: '1',
      name: 'Newsletter Novembre - Conseils hiver',
      subject: '❄️ Préparez votre peau pour l\'hiver',
      content: 'Découvrez nos conseils pour protéger votre peau du froid...',
      type: 'campaign',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      recipients: [
        {
          id: '1',
          email: 'marie.dupont@email.com',
          name: 'Marie Dupont',
          status: 'clicked',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000),
          openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
          clickedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3700000),
          openCount: 3,
          clickCount: 2,
          device: 'iPhone',
          location: 'Paris'
        },
        {
          id: '2',
          email: 'sophie.martin@email.com',
          name: 'Sophie Martin',
          status: 'opened',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45000),
          openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7200000),
          openCount: 1,
          device: 'Desktop',
          location: 'Lyon'
        },
        {
          id: '3',
          email: 'julie.bernard@email.com',
          name: 'Julie Bernard',
          status: 'delivered',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000),
          device: 'Android'
        },
        {
          id: '4',
          email: 'emma.leclerc@email.com',
          name: 'Emma Leclerc',
          status: 'bounced',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      stats: {
        total: 312,
        sent: 312,
        delivered: 298,
        opened: 245,
        clicked: 89,
        bounced: 14,
        unsubscribed: 2,
        pending: 0
      },
      performance: {
        deliveryRate: 95.5,
        openRate: 82.2,
        clickRate: 29.9,
        bounceRate: 4.5,
        unsubscribeRate: 0.6,
        engagementScore: 78
      },
      segments: ['Tous les clients'],
      tags: ['newsletter', 'conseils', 'hiver']
    },
    {
      id: '2',
      name: 'Rappel anniversaire - Offre spéciale',
      subject: '🎂 Joyeux anniversaire ! -20% pour vous',
      content: 'Profitez de votre offre anniversaire exclusive...',
      type: 'automation',
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recipients: [],
      stats: {
        total: 15,
        sent: 15,
        delivered: 15,
        opened: 14,
        clicked: 8,
        bounced: 0,
        unsubscribed: 0,
        pending: 0
      },
      performance: {
        deliveryRate: 100,
        openRate: 93.3,
        clickRate: 53.3,
        bounceRate: 0,
        unsubscribeRate: 0,
        engagementScore: 92
      },
      segments: ['Anniversaires du mois'],
      tags: ['anniversaire', 'promotion', 'automatisation']
    },
    {
      id: '3',
      name: 'Black Friday - Offre exclusive',
      subject: '🎉 BLACK FRIDAY : -30% sur tous les soins !',
      content: 'Offre exceptionnelle valable 3 jours seulement...',
      type: 'campaign',
      sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      recipients: [],
      stats: {
        total: 450,
        sent: 450,
        delivered: 425,
        opened: 380,
        clicked: 156,
        bounced: 25,
        unsubscribed: 5,
        pending: 0
      },
      performance: {
        deliveryRate: 94.4,
        openRate: 89.4,
        clickRate: 36.7,
        bounceRate: 5.6,
        unsubscribeRate: 1.1,
        engagementScore: 85
      },
      segments: ['VIP', 'Réguliers', 'Occasionnels'],
      tags: ['promotion', 'black-friday', 'urgent']
    }
  ];

    setCampaignHistory(demoData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clicked': return <MousePointer className="w-4 h-4 text-blue-500" />;
      case 'opened': return <Eye className="w-4 h-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'bounced': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'unsubscribed': return <UserX className="w-4 h-4 text-orange-500" />;
      default: return <Send className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'clicked': return 'Cliqué';
      case 'opened': return 'Ouvert';
      case 'delivered': return 'Délivré';
      case 'bounced': return 'Non distribué';
      case 'failed': return 'Échec';
      case 'unsubscribed': return 'Désabonné';
      default: return 'Envoyé';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clicked': return 'bg-blue-100 text-blue-700';
      case 'opened': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      case 'bounced': return 'bg-red-100 text-red-700';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'unsubscribed': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            Historique des Campagnes Email
          </h2>
          <p className="text-gray-600 mt-1">
            Analysez les performances détaillées de vos campagnes
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres globaux */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtrer les campagnes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom ou objet..."
                value={searchCampaign}
                onChange={(e) => setSearchCampaign(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Type de campagne</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="campaign">Campagnes</option>
              <option value="automation">Automatisations</option>
              <option value="individual">Emails individuels</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Période</label>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>
        </div>
        {(filterType !== 'all' || filterDateRange !== 'all' || searchCampaign) && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              {filteredCampaigns.length} campagne{filteredCampaigns.length > 1 ? 's' : ''} {filteredCampaigns.length !== campaignHistory.length && `sur ${campaignHistory.length}`}
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setFilterDateRange('all');
                setSearchCampaign('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-blue-900">
              {filteredCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)}
            </span>
          </div>
          <p className="text-sm text-blue-700">Total envoyés</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-900">
              {filteredCampaigns.length > 0 ? Math.round(filteredCampaigns.reduce((sum, c) => sum + c.performance.openRate, 0) / filteredCampaigns.length) : 0}%
            </span>
          </div>
          <p className="text-sm text-green-700">Taux d'ouverture</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <MousePointer className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold text-purple-900">
              {filteredCampaigns.length > 0 ? Math.round(filteredCampaigns.reduce((sum, c) => sum + c.performance.clickRate, 0) / filteredCampaigns.length) : 0}%
            </span>
          </div>
          <p className="text-sm text-purple-700">Taux de clic</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-red-900">
              {filteredCampaigns.reduce((sum, c) => sum + (c.stats.bounced || 0) + (c.stats.failed || 0), 0)}
            </span>
          </div>
          <p className="text-sm text-red-700">Échecs</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-900">
              {filteredCampaigns.length > 0 ? Math.round(filteredCampaigns.reduce((sum, c) => sum + c.performance.engagementScore, 0) / filteredCampaigns.length) : 0}
            </span>
          </div>
          <p className="text-sm text-orange-700">Score engagement</p>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucune campagne ne correspond aux filtres</p>
            <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          filteredCampaigns.map(campaign => {
          const isExpanded = expandedCampaign === campaign.id;
          
          return (
            <div key={campaign.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* En-tête de campagne */}
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        campaign.type === 'automation' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {campaign.type === 'automation' ? 'Automatisation' : 'Campagne'}
                      </span>
                      {campaign.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{campaign.subject}</p>
                    
                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-6 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.stats.total}</p>
                        <p className="text-xs text-gray-500">Destinataires</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {campaign.stats.delivered}
                        </p>
                        <p className="text-xs text-gray-500">Délivrés</p>
                        <p className="text-xs text-green-600 font-medium">
                          {campaign.performance.deliveryRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {campaign.stats.opened}
                        </p>
                        <p className="text-xs text-gray-500">Ouverts</p>
                        <p className="text-xs text-blue-600 font-medium">
                          {campaign.performance.openRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {campaign.stats.clicked}
                        </p>
                        <p className="text-xs text-gray-500">Cliqués</p>
                        <p className="text-xs text-purple-600 font-medium">
                          {campaign.performance.clickRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {(campaign.stats.bounced || 0) + (campaign.stats.failed || 0)}
                        </p>
                        <p className="text-xs text-gray-500">Échecs</p>
                        <p className="text-xs text-red-600 font-medium">
                          {campaign.performance.bounceRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getEngagementColor(campaign.performance.engagementScore)}`}>
                          {campaign.performance.engagementScore}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowDetailModal(true);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(campaign.sentAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {campaign.segments && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {campaign.segments.join(', ')}
                    </span>
                  )}
                  {campaign.completedAt && campaign.sentAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Durée: {Math.round((new Date(campaign.completedAt).getTime() - new Date(campaign.sentAt).getTime()) / 60000)} min
                    </span>
                  )}
                </div>
              </div>
              
              {/* Détails des destinataires (expandable) */}
              {isExpanded && campaign.recipients.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Détails des destinataires</h4>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchRecipient}
                          onChange={(e) => setSearchRecipient(e.target.value)}
                          className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Tous</option>
                        <option value="clicked">Cliqués</option>
                        <option value="opened">Ouverts</option>
                        <option value="delivered">Délivrés</option>
                        <option value="bounced">Non distribués</option>
                        <option value="failed">Échecs</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {campaign.recipients
                      .filter(r => {
                        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
                        if (searchRecipient && !r.name.toLowerCase().includes(searchRecipient.toLowerCase()) && 
                            !r.email.toLowerCase().includes(searchRecipient.toLowerCase())) return false;
                        return true;
                      })
                      .map(recipient => (
                        <div key={recipient.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(recipient.status)}
                            <div>
                              <p className="font-medium text-sm text-gray-900">{recipient.name}</p>
                              <p className="text-xs text-gray-500">{recipient.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(recipient.status)}`}>
                              {getStatusLabel(recipient.status)}
                            </span>
                            {recipient.openCount && recipient.openCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {recipient.openCount} ouverture{recipient.openCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {recipient.clickCount && recipient.clickCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {recipient.clickCount} clic{recipient.clickCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {recipient.device && (
                              <span className="text-xs text-gray-400">{recipient.device}</span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(recipient.sentAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
        )}
      </div>

      {/* Modal de détails */}
      {showDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Rapport détaillé - {selectedCampaign.name}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCampaign(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Graphiques et analyses détaillées */}
            <div className="space-y-6">
              {/* Timeline d'envoi */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Chronologie d'envoi</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Send className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Envoi démarré</span>
                      <span className="text-sm text-gray-500">
                        {new Date(selectedCampaign.sentAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    {selectedCampaign.completedAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Envoi terminé</span>
                        <span className="text-sm text-gray-500">
                          {new Date(selectedCampaign.completedAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Aperçu du contenu */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Aperçu du message</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Objet :</p>
                    <p className="font-medium text-gray-900">{selectedCampaign.subject}</p>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Contenu :</div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selectedCampaign.content }}
                  />
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Analyse des performances</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-1">Points forts</p>
                    <ul className="space-y-1 text-sm text-green-600">
                      {selectedCampaign.performance.openRate > 70 && (
                        <li>✓ Excellent taux d'ouverture ({selectedCampaign.performance.openRate.toFixed(1)}%)</li>
                      )}
                      {selectedCampaign.performance.clickRate > 25 && (
                        <li>✓ Très bon taux de clic ({selectedCampaign.performance.clickRate.toFixed(1)}%)</li>
                      )}
                      {selectedCampaign.performance.bounceRate < 5 && (
                        <li>✓ Faible taux de rebond ({selectedCampaign.performance.bounceRate.toFixed(1)}%)</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-700 font-medium mb-1">Points d'amélioration</p>
                    <ul className="space-y-1 text-sm text-orange-600">
                      {selectedCampaign.performance.openRate < 50 && (
                        <li>→ Améliorer l'objet pour augmenter l'ouverture</li>
                      )}
                      {selectedCampaign.performance.clickRate < 15 && (
                        <li>→ Optimiser les CTA pour plus de clics</li>
                      )}
                      {selectedCampaign.performance.bounceRate > 10 && (
                        <li>→ Nettoyer la liste des contacts</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCampaign(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  // Exporter le rapport détaillé de la campagne
                  const report = {
                    campagne: selectedCampaign.name,
                    date: new Date(selectedCampaign.sentAt).toLocaleDateString('fr-FR'),
                    statistiques: selectedCampaign.stats,
                    performances: selectedCampaign.performance,
                    destinataires: selectedCampaign.recipients.map(r => ({
                      nom: r.name,
                      email: r.email,
                      statut: r.status,
                      ouvertures: r.openCount || 0,
                      clics: r.clickCount || 0
                    }))
                  };
                  
                  const jsonStr = JSON.stringify(report, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `rapport_${selectedCampaign.name.replace(/\s+/g, '_')}_${formatDateLocal(new Date())}.json`;
                  link.click();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le rapport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}