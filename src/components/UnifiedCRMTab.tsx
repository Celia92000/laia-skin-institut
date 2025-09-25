"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Phone, Mail, Calendar, Heart, TrendingUp, Award, Edit2, Save, X,
  ChevronDown, ChevronUp, Search, Filter, Download, Plus, Gift, Cake,
  CreditCard, FileText, AlertCircle, Star, Eye, History, UserCheck, Settings,
  Camera, Video, Image, Upload, Trash2, PlayCircle, Send, Paperclip,
  Target, Users, UserX, ArrowRight, MessageSquare, Clock
} from "lucide-react";
import ClientDetailModal from "@/components/ClientDetailModal";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  birthdate?: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastVisit?: string | Date | null;
  skinType?: string;
  allergies?: string;
  medicalNotes?: string;
  preferences?: string;
  adminNotes?: string;
  individualServicesCount?: number;
  packagesCount?: number;
  reservations?: any[];
  loyaltyHistory?: any[];
  individualSoins?: number;
  forfaits?: number;
  reservationCount?: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  source: string;
  status: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}

interface UnifiedCRMTabProps {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  loyaltyProfiles: any[];
  reservations: any[];
}

export default function UnifiedCRMTab({ 
  clients, 
  setClients, 
  loyaltyProfiles, 
  reservations 
}: UnifiedCRMTabProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'leads'>('clients');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [editedData, setEditedData] = useState<{[key: string]: any}>({});
  const [clientEvolutions, setClientEvolutions] = useState<{[key: string]: any[]}>({});
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [selectedClientForEvolution, setSelectedClientForEvolution] = useState<string | null>(null);
  const [evolutionForm, setEvolutionForm] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    sessionNumber: '',
    serviceName: '',
    beforePhoto: '',
    afterPhoto: '',
    videoUrl: '',
    improvements: '',
    clientFeedback: '',
    hydrationLevel: '',
    elasticity: '',
    pigmentation: '',
    wrinkleDepth: ''
  });
  const [beforePhotoPreview, setBeforePhotoPreview] = useState<string>('');
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<Client | null>(null);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    template: 'custom'
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);

  // Fonction pour déterminer le niveau de fidélité basé sur le nombre de séances
  const getLoyaltyLevel = (reservations: any[]) => {
    const sessionCount = reservations?.length || 0;
    
    if (sessionCount >= 20) {
      return { name: "VIP ⭐", color: "bg-purple-100 text-purple-800", level: 3, sessions: sessionCount };
    } else if (sessionCount >= 10) {
      return { name: "Premium 💎", color: "bg-blue-100 text-blue-800", level: 2, sessions: sessionCount };
    } else if (sessionCount >= 5) {
      return { name: "Fidèle ❤️", color: "bg-green-100 text-green-800", level: 1, sessions: sessionCount };
    }
    return { name: "Nouveau", color: "bg-gray-100 text-gray-600", level: 0, sessions: sessionCount };
  };

  // Fonction pour vérifier l'utilisation de l'abonnement du mois en cours
  const getSubscriptionStatus = (clientId: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filtrer les réservations du client pour le mois en cours
    const clientReservations = reservations.filter(r => 
      r.userId === clientId && 
      r.isSubscription === true
    );
    
    // Vérifier s'il y a une réservation d'abonnement ce mois
    const monthlySubscriptionUsed = clientReservations.some(r => {
      const reservationDate = new Date(r.date);
      return reservationDate.getMonth() === currentMonth && 
             reservationDate.getFullYear() === currentYear &&
             (r.status === 'confirmed' || r.status === 'completed');
    });
    
    // Vérifier s'il y a une réservation d'abonnement à venir ce mois
    const upcomingSubscription = clientReservations.find(r => {
      const reservationDate = new Date(r.date);
      return reservationDate.getMonth() === currentMonth && 
             reservationDate.getFullYear() === currentYear &&
             r.status === 'pending' &&
             reservationDate >= new Date();
    });
    
    return {
      hasSubscription: clientReservations.length > 0,
      monthlyUsed: monthlySubscriptionUsed,
      upcoming: upcomingSubscription,
      lastSubscriptionDate: clientReservations.length > 0 ? 
        new Date(Math.max(...clientReservations.map(r => new Date(r.date).getTime()))) : null
    };
  };

  // Fonction pour calculer les anniversaires du mois
  const getBirthdayClients = () => {
    const currentMonth = new Date().getMonth();
    return clients.filter(client => {
      if (!client.birthDate) return false;
      const birthMonth = new Date(client.birthDate).getMonth();
      return birthMonth === currentMonth;
    });
  };

  // Filtrage et tri des clients
  const filteredClients = (() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (client.phone && client.phone.includes(searchTerm));
      
      // Filtre par niveau
      if (filterLevel !== "all") {
        const clientReservations = reservations.filter(r => r.userEmail === client.email);
        const level = getLoyaltyLevel(clientReservations);
        if (level.level !== parseInt(filterLevel)) return false;
      }
      
      return matchesSearch;
    });
    
    // Ajouter des données pour le tri
    const clientsWithData = filtered.map(client => {
      const clientReservations = reservations.filter(r => r.userEmail === client.email);
      const noShowCount = clientReservations.filter(r => r.status === 'no_show').length;
      const lastVisit = clientReservations
        .filter(r => r.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        ...client,
        reservationCount: clientReservations.length,
        noShowCount,
        totalSpent: client.totalSpent || 0,
        lastVisit: lastVisit ? lastVisit.date : null
      };
    });
    
    // Appliquer les filtres spéciaux depuis le select
    const filterValue = (document.querySelector('select[onChange*="noshow"]') as HTMLSelectElement)?.value;
    if (filterValue === 'noshow') {
      filtered = clientsWithData.filter(c => c.noShowCount > 0);
    } else if (filterValue === 'active') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = clientsWithData.filter(c => c.lastVisit && new Date(c.lastVisit) > threeMonthsAgo);
    } else if (filterValue === 'inactive') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = clientsWithData.filter(c => !c.lastVisit || new Date(c.lastVisit) <= threeMonthsAgo);
    } else {
      filtered = clientsWithData;
    }
    
    // Appliquer le tri depuis le select de tri
    const sortValue = (document.querySelector('select[onChange*="Tri par"]') as HTMLSelectElement)?.value;
    if (sortValue) {
      filtered.sort((a, b) => {
        switch(sortValue) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'spent':
            return (a.totalSpent || 0) - (b.totalSpent || 0);
          case 'spent-desc':
            return (b.totalSpent || 0) - (a.totalSpent || 0);
          case 'visits':
            return (a.reservationCount ?? 0) - (b.reservationCount ?? 0);
          case 'visits-desc':
            return (b.reservationCount ?? 0) - (a.reservationCount ?? 0);
          case 'recent':
            return (b.lastVisit ? new Date(b.lastVisit).getTime() : 0) - (a.lastVisit ? new Date(a.lastVisit).getTime() : 0);
          case 'oldest':
            return (a.lastVisit ? new Date(a.lastVisit).getTime() : 0) - (b.lastVisit ? new Date(b.lastVisit).getTime() : 0);
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  })();

  // Statistiques globales
  const stats = {
    totalClients: clients.length,
    vipClients: clients.filter(c => {
      const clientReservations = reservations.filter(r => r.userEmail === c.email);
      return getLoyaltyLevel(clientReservations).level === 3;
    }).length,
    birthdaysThisMonth: getBirthdayClients().length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    totalReservations: reservations.filter(r => r.status !== 'cancelled').length
  };

  // Sauvegarder les modifications client
  const saveClientChanges = async (clientId: string) => {
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, ...editedData[clientId] })
      });

      if (response.ok) {
        const updatedClient = await response.json();
        setClients(clients.map(c => c.id === clientId ? { ...c, ...editedData[clientId] } : c));
        setEditingClient(null);
        setEditedData({});
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Exporter les données clients
  const exportClientsData = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Points', 'Total dépensé', 'Niveau', 'Dernière visite'],
      ...clients.map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.loyaltyPoints,
        c.totalSpent,
        getLoyaltyLevel(c.reservations || []).name,
        c.lastVisit || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Fonction pour charger les évolutions d'un client
  const loadClientEvolutions = async (clientId: string) => {
    try {
      // D'abord charger depuis localStorage
      const storageKey = `evolutions_${clientId}`;
      const localEvolutions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      if (localEvolutions.length > 0) {
        setClientEvolutions(prev => ({ ...prev, [clientId]: localEvolutions }));
      } else {
        // Sinon essayer l'API
        const response = await fetch(`/api/admin/evolutions?userId=${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setClientEvolutions(prev => ({ ...prev, [clientId]: data }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des évolutions:', error);
    }
  };

  // Charger les évolutions quand on expand un client
  useEffect(() => {
    if (expandedClient) {
      loadClientEvolutions(expandedClient);
    }
  }, [expandedClient]);

  // Charger les leads
  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads();
    }
  }, [activeTab, leadStatusFilter]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = leadStatusFilter === 'all' 
        ? '/api/admin/leads'
        : `/api/admin/leads?status=${leadStatusFilter}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setLeadStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des leads:', error);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });
      
      if (response.ok) {
        await fetchLeads();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lead:', error);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!confirm('Convertir ce lead en client ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await fetchLeads();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Erreur lors de la conversion du lead:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nouveau' },
      contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Contacté' },
      qualified: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Qualifié' },
      converted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Converti' },
      lost: { bg: 'bg-red-100', text: 'text-red-700', label: 'Perdu' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'clients'
              ? 'bg-[#d4b5a0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Clients ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
            activeTab === 'leads'
              ? 'bg-[#d4b5a0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Leads
          {leadStats && leadStats.new > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {leadStats.new}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'clients' ? (
        <>
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6">
        <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-4">
          CRM Clients Unifié
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <User className="w-8 h-8 text-[#d4b5a0]" />
              <span className="text-2xl font-bold text-[#2c3e50]">{stats.totalClients}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60 mt-2">Total clients</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Star className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-[#2c3e50]">{stats.vipClients}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60 mt-2">Clients VIP</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Cake className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold text-[#2c3e50]">{stats.birthdaysThisMonth}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60 mt-2">Anniversaires ce mois</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-[#2c3e50]">{stats.totalRevenue.toFixed(0)}€</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60 mt-2">CA total</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-[#2c3e50]">{stats.totalReservations}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60 mt-2">Séances totales</p>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 flex-1">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2c3e50]/40" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
            
            {/* Filtre par niveau */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
            >
              <option value="all">Tous les niveaux</option>
              <option value="0">Nouveau</option>
              <option value="1">Fidèle</option>
              <option value="2">Premium</option>
              <option value="3">VIP</option>
            </select>
            
            {/* Nouveau filtre par statut d'activité */}
            <select
              className="px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'noshow') {
                  setSearchTerm('no_show');
                } else if (value === 'active') {
                  // Logique pour filtrer les clients actifs
                }
              }}
            >
              <option value="all">Toute activité</option>
              <option value="active">Actifs (- 3 mois)</option>
              <option value="inactive">Inactifs (+ 3 mois)</option>
              <option value="noshow">Avec absences</option>
            </select>
            
            {/* Options de tri */}
            <div className="flex items-center gap-2 border-l pl-3 ml-3 border-gray-200">
              <span className="text-sm text-gray-500">Tri:</span>
              <select
                className="px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none text-sm"
                onChange={(e) => {
                  // La logique de tri sera implémentée dans le filtrage
                  const sortType = e.target.value;
                  console.log('Tri par:', sortType);
                }}
              >
                <option value="name">Nom A-Z</option>
                <option value="name-desc">Nom Z-A</option>
                <option value="spent">CA croissant</option>
                <option value="spent-desc">CA décroissant</option>
                <option value="visits">Visites croissantes</option>
                <option value="visits-desc">Visites décroissantes</option>
                <option value="recent">Plus récents</option>
                <option value="oldest">Plus anciens</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Boutons d'action */}
            <button
              onClick={() => setShowNewClientModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau client
            </button>
            
            <button
              onClick={exportClientsData}
              className="px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-[#fdfbf7] transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Anniversaires du mois (si applicable) */}
      {getBirthdayClients().length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Cake className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-[#2c3e50]">Anniversaires ce mois 🎉</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getBirthdayClients().map(client => (
              <div key={client.id} className="bg-white rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#2c3e50]">{client.name}</p>
                  <p className="text-sm text-[#2c3e50]/60">
                    {client.birthDate && new Date(client.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors">
                  -20% appliqué
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des clients avec vue détaillée intégrée */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdfbf7] border-b border-[#d4b5a0]/20">
              <tr>
                <th className="text-left py-4 px-4 font-medium text-[#2c3e50]">Client</th>
                <th className="text-left py-4 px-4 font-medium text-[#2c3e50]">Contact</th>
                <th className="text-center py-4 px-4 font-medium text-[#2c3e50]">Niveau</th>
                <th className="text-center py-4 px-4 font-medium text-[#2c3e50]">Séances</th>
                <th className="text-center py-4 px-4 font-medium text-[#2c3e50]">CA total</th>
                <th className="text-center py-4 px-4 font-medium text-[#2c3e50]">Dernière visite</th>
                <th className="text-center py-4 px-4 font-medium text-[#2c3e50]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const clientReservations = reservations.filter(r => r.userEmail === client.email);
                const level = getLoyaltyLevel(clientReservations);
                const isExpanded = expandedClient === client.id;
                const isEditing = editingClient === client.id;
                
                return (
                  <React.Fragment key={client.id}>
                    <tr 
                      className="border-b border-gray-100 hover:bg-[#fdfbf7] transition-colors"
                      data-client-id={client.id}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-[#2c3e50]">{client.name}</p>
                          {client.birthDate && (
                            <p className="text-xs text-[#2c3e50]/60">
                              🎂 {new Date(client.birthDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-[#2c3e50]/70 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {client.email}
                          </p>
                          {client.phone && (
                            <p className="text-sm text-[#2c3e50]/70 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {client.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${level.color}`}>
                          {level.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div>
                          <p className="font-medium text-[#2c3e50] text-lg">{level.sessions}</p>
                          <p className="text-xs text-[#2c3e50]/60">séances</p>
                          <div className="flex gap-2 justify-center mt-1">
                            {(() => {
                              const subStatus = getSubscriptionStatus(client.id);
                              if (subStatus.hasSubscription) {
                                if (subStatus.monthlyUsed) {
                                  return (
                                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                      ✓ Abo utilisé ce mois
                                    </span>
                                  );
                                } else if (subStatus.upcoming) {
                                  return (
                                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full animate-pulse">
                                      📅 Abo à venir
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                      ⚠️ Abo non utilisé
                                    </span>
                                  );
                                }
                              }
                              
                              if (level.sessions % 6 > 0) {
                                return (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                    {level.sessions % 6}/6 pour -30€
                                  </span>
                                );
                              }
                              if (level.sessions > 0 && level.sessions % 6 === 0) {
                                return (
                                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full animate-pulse">
                                    -30€ disponible !
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="font-medium text-[#2c3e50]">{client.totalSpent.toFixed(0)}€</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-sm text-[#2c3e50]/70">
                          {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('fr-FR') : '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEmailRecipient(client);
                              setShowEmailModal(true);
                              setEmailForm({
                                subject: '',
                                content: '',
                                template: 'custom'
                              });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Envoyer un email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClientForDetail(client);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-[#d4b5a0] hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                            title="Voir détails complets"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Vue rapide"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => {
                              if (isEditing) {
                                saveClientChanges(client.id);
                              } else {
                                setEditingClient(client.id);
                                setEditedData({ [client.id]: client });
                              }
                            }}
                            className="p-2 text-[#d4b5a0] hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                            title={isEditing ? "Sauvegarder" : "Modifier"}
                          >
                            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Ligne détaillée expandable */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-[#fdfbf7] p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Informations médicales */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-[#2c3e50] flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-400" />
                                Informations médicales
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm text-[#2c3e50]/60">Type de peau</label>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editedData[client.id]?.skinType || ''}
                                      onChange={(e) => setEditedData({
                                        ...editedData,
                                        [client.id]: { ...editedData[client.id], skinType: e.target.value }
                                      })}
                                      className="w-full mt-1 px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                                    />
                                  ) : (
                                    <p className="text-[#2c3e50] mt-1">{client.skinType || 'Non renseigné'}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-sm text-[#2c3e50]/60">Allergies</label>
                                  {isEditing ? (
                                    <textarea
                                      value={editedData[client.id]?.allergies || ''}
                                      onChange={(e) => setEditedData({
                                        ...editedData,
                                        [client.id]: { ...editedData[client.id], allergies: e.target.value }
                                      })}
                                      className="w-full mt-1 px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                                      rows={2}
                                    />
                                  ) : (
                                    <p className="text-[#2c3e50] mt-1">{client.allergies || 'Aucune allergie connue'}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-sm text-[#2c3e50]/60">Notes médicales</label>
                                  {isEditing ? (
                                    <textarea
                                      value={editedData[client.id]?.medicalNotes || ''}
                                      onChange={(e) => setEditedData({
                                        ...editedData,
                                        [client.id]: { ...editedData[client.id], medicalNotes: e.target.value }
                                      })}
                                      className="w-full mt-1 px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                                      rows={3}
                                    />
                                  ) : (
                                    <p className="text-[#2c3e50] mt-1">{client.medicalNotes || 'Aucune note'}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Fidélité & Récompenses */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-[#2c3e50] flex items-center gap-2">
                                <Gift className="w-4 h-4 text-purple-400" />
                                Fidélité & Récompenses
                              </h4>
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 space-y-3">
                                {(() => {
                                  const clientReservations = reservations.filter(r => 
                                    r.userEmail === client.email && r.status !== 'cancelled'
                                  );
                                  const sessionCount = clientReservations.length;
                                  const progressTo6 = sessionCount % 6;
                                  const has6Sessions = sessionCount > 0 && sessionCount % 6 === 0;
                                  
                                  // Vérifier anniversaire
                                  const currentMonth = new Date().getMonth();
                                  const hasBirthday = client.birthDate && 
                                    new Date(client.birthDate).getMonth() === currentMonth;
                                  
                                  return (
                                    <>
                                      {/* Progression carte de fidélité */}
                                      <div>
                                        <p className="text-sm font-medium text-[#2c3e50] mb-2">Carte Fidélité Soins</p>
                                        <div className="flex gap-1 mb-2">
                                          {[1, 2, 3, 4, 5, 6].map((num) => (
                                            <div 
                                              key={num}
                                              className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${
                                                num <= progressTo6 || has6Sessions
                                                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white' 
                                                  : 'bg-white border border-[#d4b5a0]/30 text-[#d4b5a0]/50'
                                              }`}
                                            >
                                              {num <= progressTo6 || has6Sessions ? '✓' : num}
                                            </div>
                                          ))}
                                        </div>
                                        {has6Sessions ? (
                                          <p className="text-sm font-bold text-green-600">
                                            ✨ -20€ disponible sur la prochaine séance !
                                          </p>
                                        ) : (
                                          <p className="text-xs text-[#2c3e50]/60">
                                            {progressTo6}/6 séances ({6 - progressTo6} restantes pour -20€)
                                          </p>
                                        )}
                                      </div>
                                      
                                      {/* Anniversaire */}
                                      {client.birthDate && (
                                        <div className="pt-3 border-t border-purple-200">
                                          <p className="text-sm font-medium text-[#2c3e50] mb-1">Anniversaire</p>
                                          <p className="text-sm text-[#2c3e50]/70">
                                            🎂 {new Date(client.birthDate).toLocaleDateString('fr-FR', { 
                                              day: 'numeric', 
                                              month: 'long' 
                                            })}
                                          </p>
                                          {hasBirthday && (
                                            <p className="text-sm font-bold text-pink-600 mt-1">
                                              🎉 -10€ ce mois-ci !
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Statistiques */}
                                      <div className="pt-3 border-t border-purple-200">
                                        {/* Alerte No-Show si applicable */}
                                        {(() => {
                                          const noShows = reservations
                                            .filter(r => r.userEmail === client.email && r.status === 'no_show')
                                            .length;
                                          if (noShows > 0) {
                                            return (
                                              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                                <p className="text-xs font-semibold text-orange-600">
                                                  ⚠️ {noShows} absence{noShows > 1 ? 's' : ''} non justifiée{noShows > 1 ? 's' : ''}
                                                </p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        })()}
                                        
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <p className="text-[#2c3e50]/60">Total séances</p>
                                            <p className="font-bold text-[#2c3e50]">{sessionCount}</p>
                                          </div>
                                          <div>
                                            <p className="text-[#2c3e50]/60">Niveau</p>
                                            <p className="font-bold text-[#2c3e50]">{level.name}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            {/* Préférences */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-[#2c3e50] flex items-center gap-2">
                                <Settings className="w-4 h-4 text-blue-400" />
                                Préférences & Notes
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm text-[#2c3e50]/60">Préférences soins</label>
                                  {isEditing ? (
                                    <textarea
                                      value={editedData[client.id]?.preferences || ''}
                                      onChange={(e) => setEditedData({
                                        ...editedData,
                                        [client.id]: { ...editedData[client.id], preferences: e.target.value }
                                      })}
                                      className="w-full mt-1 px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                                      rows={3}
                                    />
                                  ) : (
                                    <p className="text-[#2c3e50] mt-1">{client.preferences || 'Aucune préférence notée'}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-sm text-[#2c3e50]/60">Notes privées admin</label>
                                  {isEditing ? (
                                    <textarea
                                      value={editedData[client.id]?.adminNotes || ''}
                                      onChange={(e) => setEditedData({
                                        ...editedData,
                                        [client.id]: { ...editedData[client.id], adminNotes: e.target.value }
                                      })}
                                      className="w-full mt-1 px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                                      rows={3}
                                    />
                                  ) : (
                                    <p className="text-[#2c3e50] mt-1">{client.adminNotes || 'Aucune note'}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Évolutions & Photos */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-[#2c3e50] flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-400" />
                                Évolutions & Photos
                              </h4>
                              <div className="space-y-3">
                                {/* Bouton pour ajouter une évolution */}
                                <button
                                  onClick={() => {
                                    setSelectedClientForEvolution(client.id);
                                    setShowEvolutionModal(true);
                                  }}
                                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-600 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all flex items-center justify-center gap-2"
                                >
                                  <Camera className="w-4 h-4" />
                                  Ajouter photos/vidéo de séance
                                </button>
                                
                                {/* Galerie d'évolutions */}
                                {clientEvolutions[client.id] && clientEvolutions[client.id].length > 0 ? (
                                  <div className="grid grid-cols-2 gap-3">
                                    {clientEvolutions[client.id].map((evolution, idx) => (
                                      <div key={idx} className="relative group cursor-pointer bg-white rounded-lg border border-[#d4b5a0]/20 overflow-hidden hover:shadow-lg transition-all">
                                        <div className="aspect-square bg-gray-100 relative">
                                          {evolution.beforePhoto && (
                                            <img 
                                              src={evolution.beforePhoto} 
                                              alt={`Séance ${evolution.sessionNumber}`}
                                              className="w-full h-full object-cover"
                                            />
                                          )}
                                          {evolution.videoUrl && !evolution.beforePhoto && (
                                            <div className="w-full h-full flex items-center justify-center bg-purple-50">
                                              <PlayCircle className="w-12 h-12 text-purple-400" />
                                            </div>
                                          )}
                                          {/* Badge avec numéro de séance */}
                                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                                            <span className="text-xs font-bold text-[#d4b5a0]">#{evolution.sessionNumber}</span>
                                          </div>
                                        </div>
                                        <div className="p-2 bg-gradient-to-r from-[#fdfbf7] to-white">
                                          <p className="text-xs font-semibold text-[#2c3e50]">
                                            {evolution.serviceName || 'Service'}
                                          </p>
                                          <p className="text-xs text-[#2c3e50]/60">
                                            {new Date(evolution.sessionDate).toLocaleDateString('fr-FR', { 
                                              day: 'numeric', 
                                              month: 'long', 
                                              year: 'numeric' 
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-[#2c3e50]/60">Aucune photo d'évolution</p>
                                    <p className="text-xs text-[#2c3e50]/40 mt-1">
                                      Documentez les progrès de votre client
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Colonne 3 : Historique */}
                          <div className="space-y-4">
                            {/* Historique récent */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-[#2c3e50] flex items-center gap-2">
                                <History className="w-4 h-4 text-green-400" />
                                Historique récent
                              </h4>
                              <div className="space-y-2">
                                {reservations
                                  .filter(r => r.userEmail === client.email)
                                  .slice(0, 5)
                                  .map((reservation, idx) => {
                                    // Mapper les IDs de services aux noms
                                    const serviceNames = reservation.services.map((serviceId: string) => {
                                      const serviceMap: any = {
                                        'hydro-naissance': "Hydro'Naissance",
                                        'hydro-cleaning': "Hydro'Cleaning",
                                        'renaissance': 'Renaissance',
                                        'bb-glow': 'BB Glow',
                                        'led-therapie': 'LED Thérapie'
                                      };
                                      return serviceMap[serviceId] || serviceId;
                                    });
                                    
                                    return (
                                      <div key={idx} className="p-3 bg-white rounded-lg border border-[#d4b5a0]/20 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-[#2c3e50]">
                                              {serviceNames.join(', ')}
                                            </p>
                                            <p className="text-xs text-[#2c3e50]/60">
                                              {new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}
                                            </p>
                                            {/* Affichage des remarques particulières si présentes */}
                                            {reservation.notes && (
                                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                                                <p className="text-xs font-medium text-amber-700 mb-1">Remarques :</p>
                                                <p className="text-xs text-amber-600 italic">{reservation.notes}</p>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                              reservation.status === 'completed' 
                                                ? 'bg-blue-100 text-blue-600'
                                                : reservation.status === 'confirmed' 
                                                ? 'bg-green-100 text-green-600' 
                                                : reservation.status === 'cancelled' 
                                                ? 'bg-red-100 text-red-600'
                                                : reservation.status === 'no_show'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                              {reservation.status === 'completed' ? '✓ Effectué' :
                                               reservation.status === 'confirmed' ? 'Confirmé' : 
                                               reservation.status === 'cancelled' ? 'Annulé' : 
                                               reservation.status === 'no_show' ? '✗ Absent' :
                                               'En attente'}
                                            </span>
                                            <p className="text-sm font-medium text-[#d4b5a0]">
                                              {reservation.totalPrice}€
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                {reservations.filter(r => r.userEmail === client.email).length === 0 && (
                                  <p className="text-sm text-[#2c3e50]/60">Aucune réservation</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions rapides */}
                          <div className="mt-6 pt-6 border-t border-[#d4b5a0]/20">
                            <div className="flex gap-3">
                              <button className="px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20 transition-colors flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Prendre RDV
                              </button>
                              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                Attribuer récompense
                              </button>
                              <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Historique complet
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-[#2c3e50]/20 mx-auto mb-3" />
            <p className="text-[#2c3e50]/60">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Modal pour ajouter une évolution */}
      {showEvolutionModal && selectedClientForEvolution && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Si on clique sur le fond (backdrop)
            if (e.target === e.currentTarget) {
              setShowEvolutionModal(false);
              setSelectedClientForEvolution(null);
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#d4b5a0]/20">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-[#2c3e50]">
                  Ajouter une évolution pour {clients.find(c => c.id === selectedClientForEvolution)?.name}
                </h3>
                <button
                  onClick={() => {
                    setShowEvolutionModal(false);
                    setSelectedClientForEvolution(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Info de la séance */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                    Date de la séance
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                    Numéro de séance
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 1, 2, 3..."
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                    Service effectué
                  </label>
                  <select className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none">
                    <option value="">Sélectionner un service</option>
                    <option value="hydro-naissance">Hydro'Naissance</option>
                    <option value="hydro">Hydro'Cleaning</option>
                    <option value="renaissance">Renaissance</option>
                    <option value="bb-glow">BB Glow</option>
                    <option value="led">LED Thérapie</option>
                  </select>
                </div>
              </div>

              {/* Upload de photos */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Photo AVANT
                    </label>
                    {beforePhotoPreview ? (
                      <div className="relative">
                        <img 
                          src={beforePhotoPreview} 
                          alt="Avant" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setBeforePhotoPreview('');
                            setEvolutionForm({...evolutionForm, beforePhoto: ''});
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#d4b5a0]/30 rounded-lg p-6 text-center hover:border-[#d4b5a0] transition-colors cursor-pointer block">
                        <Upload className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                        <p className="text-sm text-[#2c3e50]/60">
                          Cliquez pour uploader
                        </p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setBeforePhotoPreview(base64);
                                setEvolutionForm({...evolutionForm, beforePhoto: base64});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Photo APRÈS
                    </label>
                    {afterPhotoPreview ? (
                      <div className="relative">
                        <img 
                          src={afterPhotoPreview} 
                          alt="Après" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setAfterPhotoPreview('');
                            setEvolutionForm({...evolutionForm, afterPhoto: ''});
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#d4b5a0]/30 rounded-lg p-6 text-center hover:border-[#d4b5a0] transition-colors cursor-pointer block">
                        <Upload className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                        <p className="text-sm text-[#2c3e50]/60">
                          Cliquez pour uploader
                        </p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setAfterPhotoPreview(base64);
                                setEvolutionForm({...evolutionForm, afterPhoto: base64});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Ou vidéo */}
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Ou ajouter une vidéo
                  </label>
                  {videoPreview ? (
                    <div className="relative">
                      <video 
                        src={videoPreview} 
                        controls
                        className="w-full h-48 object-cover rounded-lg bg-black"
                      />
                      <button
                        onClick={() => {
                          setVideoPreview('');
                          setEvolutionForm({...evolutionForm, videoUrl: ''});
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer bg-purple-50 block">
                      <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-[#2c3e50]/60">
                        Uploader une vidéo d'évolution
                      </p>
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size < 50000000) { // Limite 50MB
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setVideoPreview(base64);
                              setEvolutionForm({...evolutionForm, videoUrl: base64});
                            };
                            reader.readAsDataURL(file);
                          } else if (file) {
                            alert('La vidéo est trop lourde (max 50MB)');
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Notes et analyse */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                    Améliorations observées
                  </label>
                  <textarea
                    placeholder="Ex: Peau plus lumineuse, rides atténuées, teint unifié..."
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                    Feedback client
                  </label>
                  <textarea
                    placeholder="Ressenti du client, satisfaction..."
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                    rows={2}
                  />
                </div>

                {/* Mesures */}
                <div className="bg-[#fdfbf7] rounded-lg p-4">
                  <h4 className="font-medium text-[#2c3e50] mb-3">Mesures d'évolution (optionnel)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#2c3e50]/60">Hydratation (0-100)</label>
                      <input type="number" min="0" max="100" className="w-full px-2 py-1 border border-[#d4b5a0]/20 rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-[#2c3e50]/60">Élasticité (0-100)</label>
                      <input type="number" min="0" max="100" className="w-full px-2 py-1 border border-[#d4b5a0]/20 rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-[#2c3e50]/60">Uniformité (0-100)</label>
                      <input type="number" min="0" max="100" className="w-full px-2 py-1 border border-[#d4b5a0]/20 rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-[#2c3e50]/60">Rides (0-100)</label>
                      <input type="number" min="0" max="100" className="w-full px-2 py-1 border border-[#d4b5a0]/20 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEvolutionModal(false);
                    setSelectedClientForEvolution(null);
                  }}
                  className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (selectedClientForEvolution && evolutionForm.sessionNumber) {
                      // Créer l'objet évolution
                      const newEvolution = {
                        id: Date.now().toString(),
                        userId: selectedClientForEvolution,
                        sessionNumber: parseInt(evolutionForm.sessionNumber),
                        serviceName: evolutionForm.serviceName,
                        sessionDate: evolutionForm.sessionDate,
                        beforePhoto: beforePhotoPreview,
                        afterPhoto: afterPhotoPreview,
                        videoUrl: videoPreview,
                        improvements: evolutionForm.improvements,
                        clientFeedback: evolutionForm.clientFeedback,
                        hydrationLevel: evolutionForm.hydrationLevel ? parseInt(evolutionForm.hydrationLevel) : null,
                        elasticity: evolutionForm.elasticity ? parseInt(evolutionForm.elasticity) : null,
                        pigmentation: evolutionForm.pigmentation ? parseInt(evolutionForm.pigmentation) : null,
                        wrinkleDepth: evolutionForm.wrinkleDepth ? parseInt(evolutionForm.wrinkleDepth) : null
                      };

                      // Ajouter l'évolution au state local
                      setClientEvolutions(prev => ({
                        ...prev,
                        [selectedClientForEvolution]: [
                          ...(prev[selectedClientForEvolution] || []),
                          newEvolution
                        ]
                      }));

                      // Stocker dans localStorage temporairement
                      const storageKey = `evolutions_${selectedClientForEvolution}`;
                      const existingEvolutions = JSON.parse(localStorage.getItem(storageKey) || '[]');
                      localStorage.setItem(storageKey, JSON.stringify([...existingEvolutions, newEvolution]));

                      // Réinitialiser le formulaire
                      setEvolutionForm({
                        sessionDate: new Date().toISOString().split('T')[0],
                        sessionNumber: '',
                        serviceName: '',
                        beforePhoto: '',
                        afterPhoto: '',
                        videoUrl: '',
                        improvements: '',
                        clientFeedback: '',
                        hydrationLevel: '',
                        elasticity: '',
                        pigmentation: '',
                        wrinkleDepth: ''
                      });
                      setBeforePhotoPreview('');
                      setAfterPhotoPreview('');
                      setVideoPreview('');
                      setShowEvolutionModal(false);
                      setSelectedClientForEvolution(null);
                      
                      alert('Évolution sauvegardée avec succès !');
                    } else {
                      alert('Veuillez remplir au minimum le numéro de séance');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Sauvegarder l'évolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Email Individuel */}
      {showEmailModal && emailRecipient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Envoyer un email à {emailRecipient.name}
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailRecipient(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Templates rapides */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template rapide
                </label>
                <select
                  value={emailForm.template}
                  onChange={(e) => {
                    const template = e.target.value;
                    setEmailForm({ ...emailForm, template });
                    
                    // Pré-remplir selon le template
                    switch (template) {
                      case 'reminder':
                        setEmailForm({
                          ...emailForm,
                          template,
                          subject: '📅 Rappel : Prenez soin de votre peau',
                          content: `Bonjour ${emailRecipient.name},\n\nCela fait un moment qu'on ne s'est pas vues !\n\nVotre peau mérite une attention régulière pour conserver son éclat.\n\n✨ Profitez de -10% sur votre prochain soin cette semaine\n\n📅 Réservez dès maintenant : laiaskin.com\n\nÀ très bientôt,\nLaïa`
                        });
                        break;
                      case 'birthday':
                        setEmailForm({
                          ...emailForm,
                          template,
                          subject: '🎂 Joyeux anniversaire !',
                          content: `Chère ${emailRecipient.name},\n\nToute l'équipe de LAIA SKIN vous souhaite un merveilleux anniversaire !\n\n🎁 Pour célébrer, profitez de -20% sur le soin de votre choix ce mois-ci.\n\n📅 Réservez votre moment détente : laiaskin.com\n\nBelle journée,\nLaïa`
                        });
                        break;
                      case 'followup':
                        setEmailForm({
                          ...emailForm,
                          template,
                          subject: 'Comment se porte votre peau ?',
                          content: `Bonjour ${emailRecipient.name},\n\nJ'espère que vous êtes satisfaite de votre dernier soin.\n\nN'hésitez pas à me faire part de vos impressions ou si vous avez des questions sur votre routine.\n\n💡 Conseil : Pour maintenir les résultats, je recommande une séance toutes les 3-4 semaines.\n\nÀ bientôt,\nLaïa`
                        });
                        break;
                      case 'promo':
                        setEmailForm({
                          ...emailForm,
                          template,
                          subject: '✨ Offre exclusive pour vous',
                          content: `Bonjour ${emailRecipient.name},\n\nEn tant que cliente fidèle, j'ai le plaisir de vous offrir :\n\n🎁 -15% sur tous les soins cette semaine\n✨ Un diagnostic de peau offert\n\n📅 Réservez vite : laiaskin.com\n\nOffre valable jusqu'au [date]\n\nÀ très vite,\nLaïa`
                        });
                        break;
                      default:
                        setEmailForm({ ...emailForm, template, subject: '', content: '' });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Personnalisé</option>
                  <option value="reminder">Rappel de visite</option>
                  <option value="birthday">Anniversaire</option>
                  <option value="followup">Suivi post-soin</option>
                  <option value="promo">Offre promotionnelle</option>
                </select>
              </div>

              {/* Destinataire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{emailRecipient.email}</span>
                </div>
              </div>

              {/* Objet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objet
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Objet de l'email..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  placeholder="Écrivez votre message..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Variables disponibles */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-1">Variables disponibles :</p>
                <p className="text-xs text-blue-600">
                  {'{clientName}'} • {'{appointmentDate}'} • {'{serviceName}'} • {'{loyaltyPoints}'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailRecipient(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Ici, implémenter l'envoi réel de l'email
                  alert(`Email envoyé à ${emailRecipient.email} !`);
                  setShowEmailModal(false);
                  setEmailRecipient(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer l'email
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de détail client */}
      {showDetailModal && selectedClientForDetail && (
        <ClientDetailModal
          client={selectedClientForDetail}
          reservations={reservations}
          loyaltyProfile={loyaltyProfiles.find(p => p.user.email === selectedClientForDetail.email)}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClientForDetail(null);
          }}
          onEdit={(clientId, data) => {
            // Mettre à jour le client
            const updatedClients = clients.map(c => 
              c.id === clientId ? { ...c, ...data } : c
            );
            setClients(updatedClients);
            // Sauvegarder en base
            saveClientChanges(clientId);
          }}
        />
      )}
      </>
      ) : (
        /* Section Leads */
        <div className="space-y-4">
          {/* Statistiques des leads */}
          {leadStats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{leadStats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{leadStats.new}</div>
                <div className="text-sm text-blue-500">Nouveaux</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700">{leadStats.contacted}</div>
                <div className="text-sm text-yellow-500">Contactés</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">{leadStats.qualified}</div>
                <div className="text-sm text-purple-500">Qualifiés</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{leadStats.converted}</div>
                <div className="text-sm text-green-500">Convertis</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{leadStats.lost}</div>
                <div className="text-sm text-red-500">Perdus</div>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="flex gap-2 mb-4">
            <select
              value={leadStatusFilter}
              onChange={(e) => setLeadStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveaux</option>
              <option value="contacted">Contactés</option>
              <option value="qualified">Qualifiés</option>
              <option value="converted">Convertis</option>
              <option value="lost">Perdus</option>
            </select>
          </div>

          {/* Liste des leads */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#d4b5a0]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-[#2c3e50]">{lead.name}</div>
                          {lead.subject && (
                            <div className="text-xs text-gray-500">{lead.subject}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 capitalize">
                          {lead.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="text-[#d4b5a0] hover:text-[#c9a084]"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal détail lead */}
          {selectedLead && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-[#2c3e50]">Détails du Lead</h2>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <p className="text-[#2c3e50]">{selectedLead.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <div>{getStatusBadge(selectedLead.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-[#2c3e50]">{selectedLead.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <p className="text-[#2c3e50]">{selectedLead.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                      <p className="text-[#2c3e50] capitalize">{selectedLead.source.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-[#2c3e50]">
                        {new Date(selectedLead.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {selectedLead.subject && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                      <p className="text-[#2c3e50]">{selectedLead.subject}</p>
                    </div>
                  )}

                  {selectedLead.message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <p className="text-[#2c3e50] bg-gray-50 p-3 rounded-lg">{selectedLead.message}</p>
                    </div>
                  )}

                  {selectedLead.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
                      <p className="text-[#2c3e50] bg-yellow-50 p-3 rounded-lg">{selectedLead.notes}</p>
                    </div>
                  )}

                  {selectedLead.user && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-700">
                        <UserCheck className="w-4 h-4 inline mr-1" />
                        Converti en client: {selectedLead.user.name} ({selectedLead.user.email})
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                    >
                      <option value="new">Nouveau</option>
                      <option value="contacted">Contacté</option>
                      <option value="qualified">Qualifié</option>
                      <option value="converted">Converti</option>
                      <option value="lost">Perdu</option>
                    </select>
                    
                    {selectedLead.status !== 'converted' && !selectedLead.userId && (
                      <button
                        onClick={() => handleConvertLead(selectedLead.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Convertir en client
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}