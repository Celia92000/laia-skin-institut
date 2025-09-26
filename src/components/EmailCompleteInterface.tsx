'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Search, Inbox, Users, Filter, CheckSquare, Calendar, Euro, Tag, Star, Globe, ChevronRight, Eye, X } from 'lucide-react';
import EmailConversationTab from './EmailConversationTab';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  lastVisit?: string;
  tags?: string[];
  selected?: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export default function EmailCompleteInterface() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'campaigns'>('conversations');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    minPoints: '',
    maxPoints: '',
    minSpent: '',
    maxSpent: '',
    lastVisitDays: '',
    tags: [] as string[]
  });

  // Email à envoyer
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    template: ''
  });

  // Templates prédéfinis
  const templates: EmailTemplate[] = [
    {
      id: 'promo',
      name: 'Promotion',
      subject: '🎁 Offre spéciale pour vous !',
      content: `
        <h2>Offre exclusive réservée à nos clients privilégiés</h2>
        <p>Bonjour {name},</p>
        <p>En tant que client(e) fidèle, nous avons le plaisir de vous offrir <strong>-20% sur votre prochain soin</strong>.</p>
        <p>Cette offre est valable jusqu\'au {date}.</p>
        <p>Réservez dès maintenant votre créneau !</p>
        <p>À très bientôt,<br>LAIA SKIN Institut</p>
      `
    },
    {
      id: 'birthday',
      name: 'Anniversaire',
      subject: '🎂 Joyeux anniversaire !',
      content: `
        <h2>C\'est votre anniversaire !</h2>
        <p>Bonjour {name},</p>
        <p>Toute l\'équipe de LAIA SKIN Institut vous souhaite un merveilleux anniversaire !</p>
        <p>Pour cette occasion spéciale, nous vous offrons <strong>un soin découverte gratuit</strong> à réserver ce mois-ci.</p>
        <p>Nous avons hâte de vous chouchouter !</p>
        <p>Avec nos meilleurs vœux,<br>LAIA SKIN Institut</p>
      `
    },
    {
      id: 'reminder',
      name: 'Rappel',
      subject: '⏰ Il est temps de prendre soin de vous',
      content: `
        <h2>Cela fait un moment qu\'on ne s\'est pas vu !</h2>
        <p>Bonjour {name},</p>
        <p>Nous avons remarqué que cela fait quelques semaines que nous n\'avons pas eu le plaisir de vous voir.</p>
        <p>Votre peau mérite une attention régulière pour rester éclatante !</p>
        <p>Réservez votre prochain rendez-vous et bénéficiez de <strong>10% de réduction</strong>.</p>
        <p>À très vite,<br>LAIA SKIN Institut</p>
      `
    },
    {
      id: 'new_service',
      name: 'Nouveau service',
      subject: '✨ Découvrez notre nouveau soin',
      content: `
        <h2>Nouveau soin disponible !</h2>
        <p>Bonjour {name},</p>
        <p>Nous sommes ravis de vous présenter notre tout nouveau soin : <strong>[Nom du soin]</strong></p>
        <p>Ce traitement révolutionnaire permet de :</p>
        <ul>
          <li>Améliorer l\'éclat de votre peau</li>
          <li>Réduire les signes de l\'âge</li>
          <li>Hydrater en profondeur</li>
        </ul>
        <p>Pour le lancement, profitez de <strong>-15% de réduction</strong> sur ce soin.</p>
        <p>Réservez votre séance découverte !</p>
        <p>À bientôt,<br>LAIA SKIN Institut</p>
      `
    }
  ];

  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    selectedCount: 0,
    estimatedOpen: 0,
    lastCampaign: null as Date | null
  });

  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadClients();
    }
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [clients, filters]);

  useEffect(() => {
    // Mettre à jour les stats
    setStats({
      ...stats,
      totalClients: clients.length,
      selectedCount: selectedClients.length,
      estimatedOpen: Math.round(selectedClients.length * 0.25) // 25% taux d\'ouverture moyen
    });
  }, [selectedClients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();
      if (Array.isArray(data)) {
        setClients(data.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          loyaltyPoints: c.loyaltyPoints || 0,
          totalSpent: c.totalSpent || 0,
          lastVisit: c.lastVisit,
          tags: c.tags || []
        })));
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];

    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.email.toLowerCase().includes(search)
      );
    }

    // Points de fidélité
    if (filters.minPoints) {
      filtered = filtered.filter(c => (c.loyaltyPoints || 0) >= parseInt(filters.minPoints));
    }
    if (filters.maxPoints) {
      filtered = filtered.filter(c => (c.loyaltyPoints || 0) <= parseInt(filters.maxPoints));
    }

    // Montant dépensé
    if (filters.minSpent) {
      filtered = filtered.filter(c => (c.totalSpent || 0) >= parseFloat(filters.minSpent));
    }
    if (filters.maxSpent) {
      filtered = filtered.filter(c => (c.totalSpent || 0) <= parseFloat(filters.maxSpent));
    }

    // Dernière visite
    if (filters.lastVisitDays) {
      const days = parseInt(filters.lastVisitDays);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(c => {
        if (!c.lastVisit) return false;
        return new Date(c.lastVisit) >= cutoff;
      });
    }

    setFilteredClients(filtered);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAll = () => {
    setSelectedClients(filteredClients.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedClients([]);
  };

  const loadTemplate = (template: EmailTemplate) => {
    setEmailData({
      subject: template.subject,
      content: template.content,
      template: template.id
    });
  };

  const sendCampaign = async () => {
    if (!emailData.subject || !emailData.content || selectedClients.length === 0) {
      alert('Veuillez remplir tous les champs et sélectionner au moins un destinataire');
      return;
    }

    setSending(true);
    try {
      // Récupérer les emails des clients sélectionnés
      const recipients = clients
        .filter(c => selectedClients.includes(c.id))
        .map(c => ({ email: c.email, name: c.name }));

      // Envoyer la campagne
      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailData.subject,
          content: emailData.content,
          recipients,
          template: emailData.template
        })
      });

      if (response.ok) {
        alert(`Campagne envoyée à ${recipients.length} destinataires !`);
        setEmailData({ subject: '', content: '', template: '' });
        setSelectedClients([]);
      } else {
        alert('Erreur lors de l\'envoi de la campagne');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const previewEmail = () => {
    setShowPreview(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex space-x-1 p-1">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'conversations' 
                ? 'bg-purple-100 text-purple-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'campaigns' 
                ? 'bg-purple-100 text-purple-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Campagnes
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'conversations' ? (
          <EmailConversationTab />
        ) : (
          <div className="h-full flex">
            {/* Sidebar - Sélection des clients */}
            <div className="w-1/3 border-r bg-gray-50 flex flex-col">
              {/* Filtres */}
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer les contacts
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Points min"
                      value={filters.minPoints}
                      onChange={(e) => setFilters({...filters, minPoints: e.target.value})}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Points max"
                      value={filters.maxPoints}
                      onChange={(e) => setFilters({...filters, maxPoints: e.target.value})}
                      className="px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="€ min"
                      value={filters.minSpent}
                      onChange={(e) => setFilters({...filters, minSpent: e.target.value})}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="€ max"
                      value={filters.maxSpent}
                      onChange={(e) => setFilters({...filters, maxSpent: e.target.value})}
                      className="px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <select
                    value={filters.lastVisitDays}
                    onChange={(e) => setFilters({...filters, lastVisitDays: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="">Dernière visite</option>
                    <option value="7">7 derniers jours</option>
                    <option value="30">30 derniers jours</option>
                    <option value="60">60 derniers jours</option>
                    <option value="90">90 derniers jours</option>
                  </select>
                </div>
                
                <div className="mt-3 flex justify-between text-xs">
                  <span>{filteredClients.length} contacts filtrés</span>
                  <span className="font-medium text-purple-600">{selectedClients.length} sélectionnés</span>
                </div>
              </div>

              {/* Actions de sélection */}
              <div className="p-3 border-b bg-white flex justify-between">
                <button
                  onClick={selectAll}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs text-gray-600 hover:underline"
                >
                  Tout désélectionner
                </button>
              </div>

              {/* Liste des clients */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Chargement...</div>
                ) : (
                  filteredClients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => toggleClientSelection(client.id)}
                      className={`p-3 border-b cursor-pointer hover:bg-white transition-colors ${
                        selectedClients.includes(client.id) ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <CheckSquare 
                          className={`h-4 w-4 mr-3 ${
                            selectedClients.includes(client.id) ? 'text-purple-600' : 'text-gray-300'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{client.name}</p>
                          <p className="text-xs text-gray-600">{client.email}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            {client.loyaltyPoints && client.loyaltyPoints > 0 && (
                              <span className="mr-3">
                                <Star className="h-3 w-3 inline mr-1" />
                                {client.loyaltyPoints} pts
                              </span>
                            )}
                            {client.totalSpent && client.totalSpent > 0 && (
                              <span>
                                <Euro className="h-3 w-3 inline mr-1" />
                                {client.totalSpent.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Zone principale - Création de campagne */}
            <div className="flex-1 flex flex-col">
              {/* Stats */}
              <div className="bg-purple-50 p-4 border-b">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.selectedCount}</p>
                    <p className="text-xs text-gray-600">Destinataires</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">~{stats.estimatedOpen}</p>
                    <p className="text-xs text-gray-600">Ouvertures estimées</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">25%</p>
                    <p className="text-xs text-gray-600">Taux moyen</p>
                  </div>
                </div>
              </div>

              {/* Templates */}
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold mb-3">Templates prédéfinis</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className={`p-3 border rounded-lg text-left hover:bg-purple-50 transition-colors ${
                        emailData.template === template.id ? 'border-purple-500 bg-purple-50' : ''
                      }`}
                    >
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-600 truncate">{template.subject}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Éditeur d\'email */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Objet</label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                      placeholder="Objet de votre campagne..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      value={emailData.content}
                      onChange={(e) => setEmailData({...emailData, content: e.target.value})}
                      rows={15}
                      placeholder="Contenu de votre message..."
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Variables disponibles : {'{name}'}, {'{date}'}, {'{points}'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between items-center">
                  <button
                    onClick={previewEmail}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </button>
                  
                  <button
                    onClick={sendCampaign}
                    disabled={sending || selectedClients.length === 0 || !emailData.subject || !emailData.content}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer à {selectedClients.length} contacts
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal aperçu */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Aperçu de l\'email</h3>
              <button onClick={() => setShowPreview(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-2">Objet : {emailData.subject}</p>
              <div 
                className="border rounded-lg p-4"
                dangerouslySetInnerHTML={{ 
                  __html: emailData.content
                    .replace(/{name}/g, 'Marie Dupont')
                    .replace(/{date}/g, new Date().toLocaleDateString('fr-FR'))
                    .replace(/{points}/g, '150')
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}