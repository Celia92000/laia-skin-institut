'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Filter, Search, Download, Save, Plus, Trash2,
  Calendar, Euro, Clock, Star, TrendingUp, Gift,
  UserCheck, UserX, Mail, Phone, MessageCircle,
  Target, BarChart3, PieChart, List, Grid,
  ChevronDown, ChevronRight, Check, X, Send,
  FileText, Copy, Edit, Eye
} from 'lucide-react';

interface ClientFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'select' | 'range' | 'date' | 'boolean' | 'multi-select';
  field: string;
  options?: { value: string; label: string }[];
  value?: any;
}

interface ClientSegment {
  id: string;
  name: string;
  description: string;
  filters: ClientFilter[];
  clientCount?: number;
  lastUsed?: Date;
  color: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: Date;
  lastVisit?: Date;
  totalSpent: number;
  visitCount: number;
  averageSpent: number;
  favoriteService?: string;
  birthday?: Date;
  loyaltyPoints: number;
  tags: string[];
  notes?: string;
  isVip: boolean;
  lastService?: string;
  nextAppointment?: Date;
  satisfaction?: number;
}

export default function EmailCampaigns() {
  const [clients, setClients] = useState<Client[]>([]);
  const [segments, setSegments] = useState<ClientSegment[]>([]);
  const [activeFilters, setActiveFilters] = useState<ClientFilter[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showSegmentDetailsModal, setShowSegmentDetailsModal] = useState(false);
  const [selectedSegmentDetails, setSelectedSegmentDetails] = useState<ClientSegment | null>(null);
  const [segmentClients, setSegmentClients] = useState<Client[]>([]);

  // Filtres disponibles
  const availableFilters: ClientFilter[] = [
    {
      id: 'visit-frequency',
      name: 'Fréquence de visite',
      icon: <Calendar className="w-4 h-4" />,
      type: 'select',
      field: 'visitFrequency',
      options: [
        { value: 'weekly', label: 'Hebdomadaire' },
        { value: 'monthly', label: 'Mensuel' },
        { value: 'quarterly', label: 'Trimestriel' },
        { value: 'rare', label: 'Rare (>3 mois)' }
      ]
    },
    {
      id: 'spending',
      name: 'Dépenses totales',
      icon: <Euro className="w-4 h-4" />,
      type: 'range',
      field: 'totalSpent',
      value: { min: 0, max: 5000 }
    },
    {
      id: 'last-visit',
      name: 'Dernière visite',
      icon: <Clock className="w-4 h-4" />,
      type: 'select',
      field: 'lastVisitRange',
      options: [
        { value: '7days', label: 'Cette semaine' },
        { value: '30days', label: 'Ce mois-ci' },
        { value: '90days', label: '3 derniers mois' },
        { value: 'older', label: 'Plus ancien' }
      ]
    },
    {
      id: 'loyalty',
      name: 'Points de fidélité',
      icon: <Star className="w-4 h-4" />,
      type: 'range',
      field: 'loyaltyPoints',
      value: { min: 0, max: 1000 }
    },
    {
      id: 'services',
      name: 'Services préférés',
      icon: <TrendingUp className="w-4 h-4" />,
      type: 'multi-select',
      field: 'favoriteServices',
      options: [
        { value: 'hydrafacial', label: "Hydra'Naissance" },
        { value: 'microneedling', label: 'Microneedling' },
        { value: 'peeling', label: 'Peeling' },
        { value: 'led', label: 'LED Therapy' },
        { value: 'massage', label: 'Massage' }
      ]
    },
    {
      id: 'birthday-month',
      name: 'Mois d\'anniversaire',
      icon: <Gift className="w-4 h-4" />,
      type: 'select',
      field: 'birthdayMonth',
      options: [
        { value: '1', label: 'Janvier' },
        { value: '2', label: 'Février' },
        { value: '3', label: 'Mars' },
        { value: '4', label: 'Avril' },
        { value: '5', label: 'Mai' },
        { value: '6', label: 'Juin' },
        { value: '7', label: 'Juillet' },
        { value: '8', label: 'Août' },
        { value: '9', label: 'Septembre' },
        { value: '10', label: 'Octobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Décembre' }
      ]
    },
    {
      id: 'vip-status',
      name: 'Statut VIP',
      icon: <UserCheck className="w-4 h-4" />,
      type: 'boolean',
      field: 'isVip'
    },
    {
      id: 'inactive',
      name: 'Clients inactifs',
      icon: <UserX className="w-4 h-4" />,
      type: 'select',
      field: 'inactivity',
      options: [
        { value: '60days', label: '+60 jours' },
        { value: '90days', label: '+90 jours' },
        { value: '180days', label: '+6 mois' }
      ]
    },
    {
      id: 'satisfaction',
      name: 'Satisfaction',
      icon: <Star className="w-4 h-4" />,
      type: 'select',
      field: 'satisfaction',
      options: [
        { value: '5', label: '5 étoiles' },
        { value: '4+', label: '4+ étoiles' },
        { value: '3-', label: 'Moins de 3 étoiles' }
      ]
    },
    {
      id: 'tags',
      name: 'Tags clients',
      icon: <Target className="w-4 h-4" />,
      type: 'multi-select',
      field: 'tags',
      options: [
        { value: 'new', label: 'Nouveau client' },
        { value: 'regular', label: 'Client régulier' },
        { value: 'premium', label: 'Premium' },
        { value: 'sensitive-skin', label: 'Peau sensible' },
        { value: 'anti-age', label: 'Anti-âge' },
        { value: 'acne', label: 'Acné' }
      ]
    }
  ];

  // Segments pré-définis
  const predefinedSegments: ClientSegment[] = [
    {
      id: 'vip-clients',
      name: 'Clients VIP',
      description: 'Clients fidèles avec dépenses élevées',
      filters: [
        { ...availableFilters[1], value: { min: 1000, max: 5000 } },
        { ...availableFilters[6], value: true }
      ],
      clientCount: 45,
      color: 'purple'
    },
    {
      id: 'birthday-month',
      name: 'Anniversaires du mois',
      description: 'Clients dont c\'est l\'anniversaire ce mois',
      filters: [
        { ...availableFilters[5], value: new Date().getMonth() + 1 }
      ],
      clientCount: 12,
      color: 'pink'
    },
    {
      id: 'inactive-clients',
      name: 'Clients à réactiver',
      description: 'Inactifs depuis plus de 90 jours',
      filters: [
        { ...availableFilters[7], value: '90days' }
      ],
      clientCount: 28,
      color: 'orange'
    },
    {
      id: 'new-clients',
      name: 'Nouveaux clients',
      description: 'Inscrits dans les 30 derniers jours',
      filters: [
        { ...availableFilters[2], value: '30days' }
      ],
      clientCount: 8,
      color: 'green'
    },
    {
      id: 'high-satisfaction',
      name: 'Clients très satisfaits',
      description: 'Note de satisfaction 5 étoiles',
      filters: [
        { ...availableFilters[8], value: '5' }
      ],
      clientCount: 67,
      color: 'blue'
    }
  ];

  // Charger les données
  useEffect(() => {
    // Simuler le chargement des clients
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Marie Dupont',
        email: 'marie.dupont@email.com',
        phone: '+33612345678',
        dateJoined: new Date('2023-03-15'),
        lastVisit: new Date('2024-11-10'),
        totalSpent: 1250,
        visitCount: 12,
        averageSpent: 104,
        favoriteService: 'hydrafacial',
        birthday: new Date('1985-04-20'),
        loyaltyPoints: 450,
        tags: ['regular', 'premium'],
        isVip: true,
        satisfaction: 5
      },
      {
        id: '2',
        name: 'Sophie Martin',
        email: 'sophie.martin@email.com',
        phone: '+33623456789',
        dateJoined: new Date('2024-01-10'),
        lastVisit: new Date('2024-10-22'),
        totalSpent: 450,
        visitCount: 5,
        averageSpent: 90,
        favoriteService: 'peeling',
        birthday: new Date('1990-12-15'),
        loyaltyPoints: 120,
        tags: ['new', 'sensitive-skin'],
        isVip: false,
        satisfaction: 4
      },
      // Ajouter plus de clients mock ici...
    ];
    
    setClients(mockClients);
    setFilteredClients(mockClients);
    setSegments(predefinedSegments);
  }, []);

  // Appliquer les filtres
  const applyFilters = () => {
    let filtered = [...clients];
    
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'range':
          filtered = filtered.filter(client => {
            const value = client[filter.field as keyof Client] as number;
            return value >= filter.value.min && value <= filter.value.max;
          });
          break;
        case 'boolean':
          filtered = filtered.filter(client => 
            client[filter.field as keyof Client] === filter.value
          );
          break;
        case 'select':
          // Logique spécifique selon le filtre
          break;
        case 'multi-select':
          // Logique pour les sélections multiples
          break;
      }
    });
    
    setFilteredClients(filtered);
  };

  // Ajouter un filtre
  const addFilter = (filter: ClientFilter) => {
    if (!activeFilters.find(f => f.id === filter.id)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Retirer un filtre
  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  // État pour la modal de création de campagne
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Templates d'email prédéfinis
  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Bienvenue',
      subject: 'Bienvenue chez LAIA SKIN Institut !',
      content: `Bonjour {clientName},\n\nJe suis ravie de vous compter parmi mes clientes !\n\nPour célébrer votre arrivée, je vous offre -15% sur votre première visite avec le code BIENVENUE15.\n\nÀ très bientôt,\nLaïa`
    },
    {
      id: 'birthday',
      name: 'Anniversaire',
      subject: '🎂 Joyeux anniversaire {clientName} !',
      content: `Bonjour {clientName},\n\nToute l'équipe de LAIA SKIN vous souhaite un merveilleux anniversaire !\n\nPour cette occasion spéciale, nous vous offrons -30% sur le soin de votre choix.\n\nOffre valable tout le mois !\n\nBelle journée,\nLaïa`
    },
    {
      id: 'promo',
      name: 'Promotion',
      subject: 'Offre exclusive pour vous',
      content: `Bonjour {clientName},\n\nEn tant que cliente privilégiée, profitez de notre offre exclusive ce mois-ci.\n\nÀ bientôt,\nLaïa`
    },
    {
      id: 'reactivation',
      name: 'Réactivation',
      subject: 'Vous nous manquez !',
      content: `Bonjour {clientName},\n\nCela fait un moment qu'on ne s'est pas vues...\n\nPour votre retour, je vous offre -25% sur le soin de votre choix.\n\nÀ très vite j'espère,\nLaïa`
    }
  ];

  // Créer une campagne email
  const createEmailCampaign = () => {
    if (selectedClients.length === 0) {
      alert('Sélectionnez au moins un client');
      return;
    }
    setShowCampaignModal(true);
  };

  // Envoyer la campagne
  const sendCampaign = () => {
    const selectedClientsData = clients.filter(c => selectedClients.includes(c.id));
    console.log('Envoi de la campagne à', selectedClientsData.length, 'clients');
    console.log('Sujet:', emailSubject);
    console.log('Contenu:', emailContent);
    
    // Ici, intégrer avec votre API d'envoi d'emails
    alert(`Campagne envoyée à ${selectedClientsData.length} clients !`);
    setShowCampaignModal(false);
    setSelectedClients([]);
  };

  // Copier les emails sélectionnés
  const copyEmails = () => {
    const selectedClientsData = clients.filter(c => selectedClients.includes(c.id));
    const emails = selectedClientsData.map(c => c.email).join(', ');
    navigator.clipboard.writeText(emails);
    alert('Adresses email copiées !');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-500" />
            Campagnes Emailing
          </h2>
          <p className="text-gray-600 mt-1">
            Créez et envoyez des campagnes email ciblées à vos clients
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter
          </button>
          <button
            onClick={() => setShowCreateSegment(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau segment
          </button>
        </div>
      </div>

      {/* Segments prédéfinis */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Segments rapides</h3>
        <div className="grid grid-cols-5 gap-3">
          {predefinedSegments.map(segment => (
            <button
              key={segment.id}
              onClick={() => {
                setSelectedSegment(segment.id);
                setSelectedSegmentDetails(segment);
                // Simuler les clients du segment
                const mockSegmentClients = clients.slice(0, segment.clientCount);
                setSegmentClients(mockSegmentClients);
                setShowSegmentDetailsModal(true);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedSegment === segment.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-${segment.color}-100 flex items-center justify-center mb-2`}>
                <Target className={`w-5 h-5 text-${segment.color}-600`} />
              </div>
              <p className="font-medium text-gray-900 text-sm">{segment.name}</p>
              <p className="text-xs text-gray-500 mt-1">{segment.clientCount} clients</p>
            </button>
          ))}
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres actifs
          </h3>
          <button
            onClick={() => setActiveFilters([])}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        {/* Filtres actifs */}
        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {activeFilters.map(filter => (
              <div
                key={filter.id}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2"
              >
                {filter.icon}
                <span className="text-sm font-medium">{filter.name}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-3">Aucun filtre appliqué</p>
        )}

        {/* Ajouter des filtres */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ajouter :</span>
          <div className="flex flex-wrap gap-2">
            {availableFilters.slice(0, 5).map(filter => (
              <button
                key={filter.id}
                onClick={() => addFilter(filter)}
                disabled={!!activeFilters.find(f => f.id === filter.id)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {filter.name}
              </button>
            ))}
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
              Plus de filtres...
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-900">{filteredClients.length}</span>
          </div>
          <p className="text-blue-700 text-sm font-medium">Clients filtrés</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Euro className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-green-900">
              {Math.round(filteredClients.reduce((sum, c) => sum + c.totalSpent, 0) / filteredClients.length || 0)}€
            </span>
          </div>
          <p className="text-green-700 text-sm font-medium">Panier moyen</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-purple-900">
              {filteredClients.filter(c => c.isVip).length}
            </span>
          </div>
          <p className="text-purple-700 text-sm font-medium">Clients VIP</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-900">
              {Math.round(filteredClients.reduce((sum, c) => sum + c.loyaltyPoints, 0) / filteredClients.length || 0)}
            </span>
          </div>
          <p className="text-orange-700 text-sm font-medium">Points fidélité moy.</p>
        </div>
      </div>

      {/* Actions groupées */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedClients(
              selectedClients.length === filteredClients.length 
                ? [] 
                : filteredClients.map(c => c.id)
            )}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {selectedClients.length === filteredClients.length ? 'Désélectionner tout' : 'Tout sélectionner'}
          </button>
          <span className="text-sm text-gray-600">
            {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} sélectionné{selectedClients.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {viewMode === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
          <button
            onClick={copyEmails}
            disabled={selectedClients.length === 0}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mr-2"
          >
            <Copy className="w-4 h-4" />
            Copier emails
          </button>
          <button
            onClick={createEmailCampaign}
            disabled={selectedClients.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Créer campagne email
          </button>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {viewMode === 'list' ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredClients.length}
                    onChange={() => setSelectedClients(
                      selectedClients.length === filteredClients.length 
                        ? [] 
                        : filteredClients.map(c => c.id)
                    )}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dernière visite</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total dépensé</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fidélité</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tags</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => {
                        if (selectedClients.includes(client.id)) {
                          setSelectedClients(selectedClients.filter(id => id !== client.id));
                        } else {
                          setSelectedClients([...selectedClients, client.id]);
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {client.isVip && <Star className="w-4 h-4 text-yellow-500" />}
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.visitCount} visites</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">
                      {client.lastVisit?.toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">{client.totalSpent}€</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{client.loyaltyPoints} pts</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => {
                          setSelectedClients([client.id]);
                          createEmailCampaign();
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Envoyer un email"
                      >
                        <Mail className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-3 gap-4 p-4">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedClients.includes(client.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  if (selectedClients.includes(client.id)) {
                    setSelectedClients(selectedClients.filter(id => id !== client.id));
                  } else {
                    setSelectedClients([...selectedClients, client.id]);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      {client.name}
                      {client.isVip && <Star className="w-4 h-4 text-yellow-500" />}
                    </p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Visites :</span>
                    <span className="font-medium">{client.visitCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total :</span>
                    <span className="font-medium">{client.totalSpent}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fidélité :</span>
                    <span className="font-medium">{client.loyaltyPoints} pts</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {client.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création de campagne email */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-500" />
                Créer une campagne email
              </h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Récapitulatif des destinataires */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900">
                Destinataires : <span className="font-bold">{selectedClients.length} clients sélectionnés</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {clients.filter(c => selectedClients.includes(c.id)).slice(0, 5).map(client => (
                  <span key={client.id} className="px-2 py-1 bg-white rounded text-xs">
                    {client.name} ({client.email})
                  </span>
                ))}
                {selectedClients.length > 5 && (
                  <span className="px-2 py-1 bg-white rounded text-xs">
                    +{selectedClients.length - 5} autres...
                  </span>
                )}
              </div>
            </div>

            {/* Templates */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utiliser un template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {emailTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setEmailSubject(template.subject);
                      setEmailContent(template.content);
                    }}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-gray-600 mb-1" />
                    <p className="font-medium text-gray-900">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sujet */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet de l'email
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Offre exclusive pour vous"
              />
            </div>

            {/* Contenu */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'email
              </label>
              <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                <p className="font-medium mb-1">Variables disponibles :</p>
                <span className="text-gray-600">{'{clientName}'}, {'{email}'}, {'{phone}'}, {'{loyaltyPoints}'}</span>
              </div>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={10}
                placeholder="Tapez votre message ici..."
              />
            </div>

            {/* Aperçu */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aperçu
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="font-medium text-gray-900 mb-2">{emailSubject || 'Sujet de l\'email'}</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {emailContent
                    .replace(/{clientName}/g, 'Marie Dupont')
                    .replace(/{email}/g, 'marie.dupont@email.com')
                    .replace(/{phone}/g, '+33612345678')
                    .replace(/{loyaltyPoints}/g, '450')
                    || 'Contenu de l\'email...'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Sauvegarder comme brouillon
                  alert('Campagne sauvegardée comme brouillon');
                  setShowCampaignModal(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
              <button
                onClick={sendCampaign}
                disabled={!emailSubject || !emailContent}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d\u00e9tails du segment */}
      {showSegmentDetailsModal && selectedSegmentDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedSegmentDetails.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSegmentDetails.clientCount} clients dans ce segment
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSegmentDetailsModal(false);
                  setSelectedSegmentDetails(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Liste des clients du segment */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {segmentClients.map((client, idx) => (
                  <div key={client.id || idx} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {client.visitCount} visites
                          </span>
                          <span className="text-xs text-gray-500">
                            {client.totalSpent}€ dépensés
                          </span>
                          {client.satisfaction && (
                            <span className="text-xs text-yellow-600">
                              {'⭐'.repeat(client.satisfaction)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedClients([...selectedClients, client.id]);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                      >
                        Sélectionner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">
                {selectedClients.length} clients sélectionnés
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSegmentDetailsModal(false);
                    setShowCampaignModal(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Créer une campagne
                </button>
                <button
                  onClick={() => {
                    // Export CSV
                    const csv = segmentClients.map(c => 
                      `${c.name},${c.email},${c.phone || ''},${c.totalSpent}`
                    ).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedSegmentDetails.name.replace(/\s+/g, '_')}.csv`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}