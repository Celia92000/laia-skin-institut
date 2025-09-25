"use client";

import { useState, useEffect } from "react";
import { 
  Search, Mail, Phone, Calendar, Euro, Package, 
  UserPlus, Filter, Download, ChevronDown, ChevronUp,
  MessageSquare, AlertCircle, TrendingUp, Gift, X,
  Clock, Star, Users, Target, UserCheck, UserX,
  ArrowRight, Edit2, Save, User, MapPin, FileText,
  Heart, Activity, CreditCard, Sparkles
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  totalSpent: number;
  loyaltyPoints: number;
  skinType?: string;
  birthDate?: string;
  lastVisit?: string;
  createdAt: string;
  adminNotes?: string;
  medicalNotes?: string;
  allergies?: string;
  preferences?: string;
  _count?: {
    reservations: number;
  };
  loyaltyProfile?: {
    tier: string;
    referralCode: string;
    totalReferrals: number;
  };
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

export default function AdminCRMTab() {
  const [clients, setClients] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'clients' | 'leads'>('clients');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editedClient, setEditedClient] = useState<User | null>(null);

  useEffect(() => {
    if (activeTab === 'clients') {
      fetchClients();
    } else {
      fetchLeads();
    }
  }, [activeTab, leadStatusFilter]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setLoading(false);
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

  const handleSaveClient = async () => {
    if (!editedClient) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${editedClient.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedClient)
      });
      
      if (response.ok) {
        await fetchClients();
        setSelectedClient(editedClient);
        setIsEditingClient(false);
        alert('Client mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: noteContent
        })
      });
      
      if (response.ok) {
        await fetchClients();
        setShowNoteModal(false);
        setNoteContent("");
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

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

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      BRONZE: { bg: 'bg-amber-100', text: 'text-amber-700' },
      SILVER: { bg: 'bg-gray-100', text: 'text-gray-700' },
      GOLD: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      PLATINUM: { bg: 'bg-purple-100', text: 'text-purple-700' }
    };
    
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.BRONZE;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {tier}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

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

      {/* Section Leads */}
      {activeTab === 'leads' && (
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
        </div>
      )}

      {/* Section Clients */}
      {activeTab === 'clients' && (
        <>
          {/* Barre de recherche et statistiques */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#d4b5a0]" />
                  <span className="font-medium">{clients.length} clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-green-500" />
                  <span className="font-medium">
                    {clients.reduce((acc, c) => acc + c.totalSpent, 0).toFixed(2)}€ total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des clients */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#d4b5a0]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Visites</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">CA Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Fidélité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Dernière visite</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#d4b5a0]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#d4b5a0] font-medium">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#2c3e50]">{client.name}</div>
                            {client.skinType && (
                              <div className="text-xs text-gray-500">Type: {client.skinType}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2c3e50]">
                        {client._count?.reservations || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {client.totalSpent.toFixed(2)}€
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {client.loyaltyProfile?.tier && getTierBadge(client.loyaltyProfile.tier)}
                          <span className="text-xs text-gray-500">
                            {client.loyaltyPoints} pts
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.lastVisit 
                          ? new Date(client.lastVisit).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setNoteContent(client.adminNotes || "");
                            setShowNoteModal(true);
                          }}
                          className="text-[#d4b5a0] hover:text-[#c9a084]"
                        >
                          Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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

      {/* Modal détail client */}
      {selectedClient && !showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2c3e50]">
                  {isEditingClient ? (
                    <input
                      type="text"
                      value={editedClient?.name || ''}
                      onChange={(e) => setEditedClient({...editedClient!, name: e.target.value})}
                      className="border-b-2 border-[#d4b5a0] focus:outline-none text-2xl font-bold"
                    />
                  ) : (
                    selectedClient.name
                  )}
                </h2>
                <p className="text-gray-500 mt-1">
                  {isEditingClient ? (
                    <input
                      type="email"
                      value={editedClient?.email || ''}
                      onChange={(e) => setEditedClient({...editedClient!, email: e.target.value})}
                      className="border-b border-gray-300 focus:outline-none"
                    />
                  ) : (
                    selectedClient.email
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {!isEditingClient ? (
                  <button
                    onClick={() => {
                      setIsEditingClient(true);
                      setEditedClient({...selectedClient});
                    }}
                    className="p-2 text-[#d4b5a0] hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveClient}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Enregistrer"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingClient(false);
                        setEditedClient(null);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Annuler"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                {!isEditingClient && (
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#2c3e50] border-b pb-2">Informations personnelles</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-gray-600 block mb-1">📞 Téléphone:</label>
                    {isEditingClient ? (
                      <input
                        type="tel"
                        value={editedClient?.phone || ''}
                        onChange={(e) => setEditedClient({...editedClient!, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                        placeholder="+33 6 12 34 56 78"
                      />
                    ) : (
                      <span className="font-medium">{selectedClient.phone || 'Non renseigné'}</span>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">🌸 Type de peau:</label>
                    {isEditingClient ? (
                      <select
                        value={editedClient?.skinType || ''}
                        onChange={(e) => setEditedClient({...editedClient!, skinType: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Normale">Normale</option>
                        <option value="Sèche">Sèche</option>
                        <option value="Grasse">Grasse</option>
                        <option value="Mixte">Mixte</option>
                        <option value="Sensible">Sensible</option>
                      </select>
                    ) : (
                      <span className="font-medium">{selectedClient.skinType || 'Non renseigné'}</span>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">🎂 Date de naissance:</label>
                    {isEditingClient ? (
                      <input
                        type="date"
                        value={editedClient?.birthDate ? editedClient.birthDate.split('T')[0] : ''}
                        onChange={(e) => setEditedClient({...editedClient!, birthDate: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                      />
                    ) : (
                      <span className="font-medium">
                        {selectedClient.birthDate 
                          ? new Date(selectedClient.birthDate).toLocaleDateString('fr-FR')
                          : 'Non renseigné'}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">📅 Client depuis:</label>
                    <span className="font-medium">
                      {new Date(selectedClient.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#2c3e50] border-b pb-2">Statistiques</h3>
                
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedClient.totalSpent.toFixed(2)}€
                    </div>
                    <div className="text-xs text-green-600">CA Total</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedClient._count?.reservations || 0}
                    </div>
                    <div className="text-xs text-blue-600">Visites</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {selectedClient.loyaltyPoints}
                        </div>
                        <div className="text-xs text-purple-600">Points fidélité</div>
                      </div>
                      {selectedClient.loyaltyProfile?.tier && getTierBadge(selectedClient.loyaltyProfile.tier)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes médicales */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="font-medium text-[#2c3e50] border-b pb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Informations médicales
                </h3>
                
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700 mb-2">🌿 Allergies:</p>
                  {isEditingClient ? (
                    <textarea
                      value={editedClient?.allergies || ''}
                      onChange={(e) => setEditedClient({...editedClient!, allergies: e.target.value})}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300"
                      rows={2}
                      placeholder="Aucune allergie connue"
                    />
                  ) : (
                    <p className="text-sm text-red-600">{selectedClient.allergies || 'Aucune allergie connue'}</p>
                  )}
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-700 mb-2">📝 Notes médicales:</p>
                  {isEditingClient ? (
                    <textarea
                      value={editedClient?.medicalNotes || ''}
                      onChange={(e) => setEditedClient({...editedClient!, medicalNotes: e.target.value})}
                      className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300"
                      rows={3}
                      placeholder="Aucune note médicale"
                    />
                  ) : (
                    <p className="text-sm text-yellow-600">{selectedClient.medicalNotes || 'Aucune note médicale'}</p>
                  )}
                </div>
              </div>

              {/* Notes admin et Préférences */}
              <div className="space-y-4 md:col-span-2">
                <div>
                  <h3 className="font-medium text-[#2c3e50] border-b pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Notes internes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    {isEditingClient ? (
                      <textarea
                        value={editedClient?.adminNotes || ''}
                        onChange={(e) => setEditedClient({...editedClient!, adminNotes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                        rows={3}
                        placeholder="Ajouter des notes internes..."
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{selectedClient.adminNotes || 'Aucune note interne'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[#2c3e50] border-b pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4b5a0]" />
                    Préférences
                  </h3>
                  <div className="bg-[#d4b5a0]/10 rounded-lg p-3 mt-3">
                    {isEditingClient ? (
                      <textarea
                        value={editedClient?.preferences || ''}
                        onChange={(e) => setEditedClient({...editedClient!, preferences: e.target.value})}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                        rows={3}
                        placeholder="Préférences de la cliente (horaires, produits, soins préférés...)"
                      />
                    ) : (
                      <p className="text-sm text-[#2c3e50]">{selectedClient.preferences || 'Aucune préférence enregistrée'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Historique des visites */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-[#2c3e50] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Historique récent
              </h3>
              <div className="text-sm text-gray-600">
                <p className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Dernière visite: {selectedClient.lastVisit ? new Date(selectedClient.lastVisit).toLocaleDateString('fr-FR') : 'Aucune visite'}
                </p>
                <p className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Panier moyen: {selectedClient._count?.reservations ? (selectedClient.totalSpent / selectedClient._count.reservations).toFixed(2) : '0'}€
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal notes */}
      {showNoteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
              Notes pour {selectedClient.name}
            </h3>
            
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Ajoutez vos notes ici..."
              className="w-full h-32 px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] resize-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteContent("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNotes}
                className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}