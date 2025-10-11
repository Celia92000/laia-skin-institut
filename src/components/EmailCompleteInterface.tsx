'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Send, Search, Inbox, Users, Filter, CheckSquare, Calendar, Euro, Tag, Star, Globe, ChevronRight, Eye, X, Bold, Italic, Underline, List, ListOrdered, Link2, Image, Type, Palette, AlignLeft, AlignCenter, AlignRight, Strikethrough, AlignJustify, Paintbrush, FileText, BarChart3 } from 'lucide-react';
import EmailConversationTab from './EmailConversationTab';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  lastVisit?: string;
  lastService?: string;
  tags?: string[];
  selected?: boolean;
  vip?: boolean;
  status?: string; // actif, inactif, nouveau
  favoriteServices?: string[];
  visitCount?: number;
  tier?: string; // BRONZE, SILVER, GOLD, PLATINUM
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

import EmailSettings from './EmailSettings';
import EmailAutomations from './EmailAutomations';
import EmailTemplateManager from './EmailTemplateManager';
import EmailCampaignHistory from './EmailCampaignHistory';

export default function EmailCompleteInterface() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'campaigns' | 'automations' | 'settings' | 'templates' | 'history'>('conversations');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    minPoints: '',
    maxPoints: '',
    minSpent: '',
    maxSpent: '',
    lastVisitDays: '',
    status: '', // actif, inactif, nouveau
    tier: '', // BRONZE, SILVER, GOLD, PLATINUM
    lastService: '',
    minVisits: '',
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
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<any[]>([]);
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);
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
      const token = localStorage.getItem('token');
      console.log('📧 Chargement des clients avec token:', token ? 'présent' : 'absent');

      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📧 Réponse API clients:', response.status, response.ok);

      if (!response.ok) {
        console.error('📧 Erreur API clients:', response.status, await response.text());
        setClients([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('📧 Données reçues:', data);

      if (Array.isArray(data)) {
        const enrichedClients = await Promise.all(data.map(async (c: any) => {
          // Calculer la dernière visite à partir des réservations
          let lastVisit = null;
          if (c.reservations && c.reservations.length > 0) {
            // Trier les réservations par date décroissante et prendre la plus récente
            const sortedReservations = [...c.reservations].sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            lastVisit = sortedReservations[0].date;
          }

          // Si pas de réservation, utiliser le champ loyaltyProfile.lastVisit
          if (!lastVisit && c.loyaltyProfile?.lastVisit) {
            lastVisit = c.loyaltyProfile.lastVisit;
          }

          // Calculer le statut du client
          let status = 'nouveau';
          if (lastVisit) {
            const lastVisitDate = new Date(lastVisit);
            const daysSinceLastVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceLastVisit < 30) {
              status = 'actif';
            } else if (daysSinceLastVisit < 90) {
              status = 'régulier';
            } else {
              status = 'inactif';
            }
          }

          // Extraire le dernier service
          let lastService = '';
          if (c.reservations && c.reservations.length > 0) {
            const lastReservation = c.reservations[0];
            if (lastReservation.services) {
              try {
                const services = typeof lastReservation.services === 'string'
                  ? JSON.parse(lastReservation.services)
                  : lastReservation.services;
                if (Array.isArray(services) && services.length > 0) {
                  lastService = services[0].name || services[0];
                }
              } catch (e) {
                lastService = '';
              }
            }
          }

          return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            loyaltyPoints: c.loyaltyProfile?.points || 0,
            totalSpent: c.loyaltyProfile?.totalSpent || 0,
            lastVisit: lastVisit,
            lastService,
            tags: c.tags || [],
            status,
            visitCount: c.reservations?.length || 0,
            tier: c.loyaltyProfile?.tier || 'BRONZE'
          };
        }));

        console.log('📧 Clients chargés pour campagne:', enrichedClients.length);
        console.log('📧 Premier client exemple:', enrichedClients[0]);
        setClients(enrichedClients);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];
    console.log('📧 Application des filtres. Total clients:', clients.length);
    console.log('📧 Filtres actifs:', filters);

    // Recherche (nom, prénom, email)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.email.toLowerCase().includes(search)
      );
    }

    // Statut client (actif, régulier, inactif, nouveau)
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Tier fidélité
    if (filters.tier) {
      filtered = filtered.filter(c => c.tier === filters.tier);
    }

    // Dernier service
    if (filters.lastService) {
      filtered = filtered.filter(c => 
        c.lastService?.toLowerCase().includes(filters.lastService.toLowerCase())
      );
    }

    // Nombre minimum de visites
    if (filters.minVisits) {
      filtered = filtered.filter(c => (c.visitCount || 0) >= parseInt(filters.minVisits));
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
        if (!c.lastVisit) return days === 999; // 999 = jamais venu
        return new Date(c.lastVisit) >= cutoff;
      });
    }

    console.log('📧 Clients après filtrage:', filtered.length);
    if (filtered.length > 0) {
      console.log('📧 Premier client filtré:', filtered[0]);
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

  const selectFiltered = () => {
    setSelectedClients(filteredClients.map(c => c.id));
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
      const token = localStorage.getItem('token');

      // Récupérer les emails des clients sélectionnés
      const recipients = clients
        .filter(c => selectedClients.includes(c.id))
        .map(c => ({ email: c.email, name: c.name }));

      // Envoyer la campagne
      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: emailData.subject,
          content: emailData.content,
          recipients,
          template: emailData.template
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || `Campagne envoyée à ${recipients.length} destinataires !`);
        setEmailData({ subject: '', content: '', template: '' });
        setSelectedClients([]);
      } else {
        alert(data.error || 'Erreur lors de l\'envoi de la campagne');
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

  const sendTestEmail = () => {
    setTestEmail(''); // Reset
    setShowTestModal(true);
  };

  const confirmSendTest = async () => {
    if (!testEmail || !emailData.subject || !emailData.content) return;

    setSendingTest(true);
    try {
      const token = localStorage.getItem('token');

      // Personnaliser avec des données de test
      const testContent = emailData.content
        .replace(/{name}/g, 'Test Client')
        .replace(/{date}/g, new Date().toLocaleDateString('fr-FR'))
        .replace(/{points}/g, '100');

      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `[TEST] ${emailData.subject}`,
          content: testContent,
          recipients: [{ email: testEmail, name: 'Test' }],
          template: emailData.template
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || `Email de test envoyé à ${testEmail} !`);
        setShowTestModal(false);
      } else {
        alert(data.error || 'Erreur lors de l\'envoi du test');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du test');
    } finally {
      setSendingTest(false);
    }
  };

  // Fonctions d'édition de texte
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setEmailData({...emailData, content: html});
    }
  };

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const node = document.createTextNode(variable);
        range.insertNode(node);
        range.setStartAfter(node);
        range.setEndAfter(node);
        selection.removeAllRanges();
        selection.addRange(range);
        const html = editorRef.current.innerHTML;
        setEmailData({...emailData, content: html});
      }
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setEmailData({...emailData, content: html});
    }
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
          <button
            onClick={() => setActiveTab('automations')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'automations' 
                ? 'bg-purple-100 text-purple-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Automatisations
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Mail className="h-4 w-4 mr-2" />
            Synchronisation
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'templates'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Historique & Rapports
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'conversations' ? (
          <EmailConversationTab />
        ) : activeTab === 'automations' ? (
          <EmailAutomations />
        ) : activeTab === 'settings' ? (
          <EmailSettings />
        ) : activeTab === 'templates' ? (
          <div className="p-6">
            <EmailTemplateManager />
          </div>
        ) : activeTab === 'history' ? (
          <EmailCampaignHistory />
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
                  {/* Recherche */}
                  <input
                    type="text"
                    placeholder="Nom, prénom ou email..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  
                  {/* Type de client */}
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="">Tous les clients</option>
                    <option value="actif">🟢 Clients actifs (- 30j)</option>
                    <option value="régulier">🔵 Clients réguliers (30-90j)</option>
                    <option value="inactif">🔴 Clients inactifs (+ 90j)</option>
                    <option value="nouveau">🆕 Nouveaux clients</option>
                  </select>

                  {/* Niveau de fidélité */}
                  <select
                    value={filters.tier}
                    onChange={(e) => setFilters({...filters, tier: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="BRONZE">🥉 Bronze</option>
                    <option value="SILVER">🥈 Silver</option>
                    <option value="GOLD">🥇 Gold</option>
                    <option value="PLATINUM">💎 Platinum</option>
                  </select>

                  {/* Dernier soin */}
                  <input
                    type="text"
                    placeholder="Dernier soin effectué..."
                    value={filters.lastService}
                    onChange={(e) => setFilters({...filters, lastService: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />

                  {/* Nombre de visites minimum */}
                  <input
                    type="number"
                    placeholder="Nombre minimum de visites"
                    value={filters.minVisits}
                    onChange={(e) => setFilters({...filters, minVisits: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  
                  {/* Points et montants */}
                  <details className="">
                    <summary className="cursor-pointer text-xs font-medium text-gray-600">Filtres avancés</summary>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Points min"
                          value={filters.minPoints}
                          onChange={(e) => setFilters({...filters, minPoints: e.target.value})}
                          className="px-2 py-1 border rounded text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Points max"
                          value={filters.maxPoints}
                          onChange={(e) => setFilters({...filters, maxPoints: e.target.value})}
                          className="px-2 py-1 border rounded text-xs"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="€ dépensé min"
                          value={filters.minSpent}
                          onChange={(e) => setFilters({...filters, minSpent: e.target.value})}
                          className="px-2 py-1 border rounded text-xs"
                        />
                        <input
                          type="number"
                          placeholder="€ dépensé max"
                          value={filters.maxSpent}
                          onChange={(e) => setFilters({...filters, maxSpent: e.target.value})}
                          className="px-2 py-1 border rounded text-xs"
                        />
                      </div>
                    </div>
                  </details>
                  
                  {/* Dernière visite */}
                  <select
                    value={filters.lastVisitDays}
                    onChange={(e) => setFilters({...filters, lastVisitDays: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="">Toutes les visites</option>
                    <option value="7">Venue cette semaine</option>
                    <option value="30">Venue ce mois-ci</option>
                    <option value="60">Venue ces 2 derniers mois</option>
                    <option value="90">Venue ces 3 derniers mois</option>
                    <option value="180">Venue ces 6 derniers mois</option>
                    <option value="365">Venue cette année</option>
                    <option value="999">Jamais venue</option>
                  </select>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-600">{filteredClients.length} contacts filtrés</span>
                    <span className="font-medium text-purple-600">{selectedClients.length} sélectionnés</span>
                  </div>
                  {selectedClients.length > 0 && (
                    <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                      ✓ {selectedClients.length} contact{selectedClients.length > 1 ? 's' : ''} prêt{selectedClients.length > 1 ? 's' : ''} pour l'envoi
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mb-2 italic">
                    💡 Cliquez sur un contact pour le sélectionner/désélectionner
                  </p>
                  {filteredClients.length > 0 && (
                    <button
                      onClick={selectFiltered}
                      className="w-full px-3 py-2 border border-purple-300 text-purple-700 bg-white rounded-lg text-sm font-medium hover:bg-purple-50 transition-all"
                    >
                      Tout sélectionner ({filteredClients.length})
                    </button>
                  )}
                  {filteredClients.length === 0 && (
                    <div className="text-xs text-center text-gray-500 py-2">
                      Aucun contact ne correspond aux filtres
                    </div>
                  )}
                  {/* Debug info - à retirer en production */}
                  <div className="mt-2 text-xs text-gray-400">
                    Total clients : {clients.length} | Avec dernière visite : {clients.filter(c => c.lastVisit).length}
                  </div>
                </div>
              </div>

              {/* Actions de sélection */}
              {selectedClients.length > 0 && (
                <div className="p-2 border-b bg-gray-50 flex justify-end">
                  <button
                    onClick={deselectAll}
                    className="text-xs text-gray-600 hover:text-gray-800 hover:underline"
                  >
                    ✕ Tout désélectionner
                  </button>
                </div>
              )}

              {/* Liste des clients */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Chargement...</div>
                ) : (
                  filteredClients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => toggleClientSelection(client.id)}
                      className={`p-3 border-b cursor-pointer hover:bg-purple-50 transition-all ${
                        selectedClients.includes(client.id)
                          ? 'bg-purple-100 border-l-4 border-l-purple-500 shadow-sm'
                          : 'hover:border-l-4 hover:border-l-purple-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`h-5 w-5 mr-3 rounded border-2 flex items-center justify-center ${
                          selectedClients.includes(client.id)
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedClients.includes(client.id) && (
                            <CheckSquare className="h-3 w-3 text-white fill-current" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{client.name}</p>
                          <p className="text-xs text-gray-600">{client.email}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {/* Badge statut */}
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              client.status === 'actif' ? 'bg-green-100 text-green-700' :
                              client.status === 'régulier' ? 'bg-blue-100 text-blue-700' :
                              client.status === 'inactif' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {client.status || 'nouveau'}
                            </span>
                            {/* Badge tier */}
                            {client.tier && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                client.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700' :
                                client.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                                client.tier === 'SILVER' ? 'bg-gray-200 text-gray-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {client.tier === 'PLATINUM' ? '💎' : 
                                 client.tier === 'GOLD' ? '🥇' : 
                                 client.tier === 'SILVER' ? '🥈' : '🥉'}
                              </span>
                            )}
                            {/* Nombre de visites */}
                            {client.visitCount && client.visitCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {client.visitCount} visite{client.visitCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {/* Dernier soin et dernière visite */}
                          <div className="flex items-center gap-2 mt-1">
                            {client.lastService && (
                              <p className="text-xs text-purple-600 truncate">
                                Dernier: {client.lastService}
                              </p>
                            )}
                            {client.lastVisit && (
                              <p className="text-xs text-gray-500">
                                • {new Date(client.lastVisit).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                          {!client.lastVisit && (
                            <p className="text-xs text-gray-400 mt-1">
                              Aucune visite enregistrée
                            </p>
                          )}
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
                    
                    {/* Barre d'outils de formatage */}
                    <div className="border border-b-0 rounded-t-lg bg-gray-50 p-2 flex flex-wrap items-center gap-1">
                      {/* Formatage de base */}
                      <div className="flex items-center gap-1 pr-2 border-r">
                        <button
                          type="button"
                          onClick={() => formatText('bold')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Gras"
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('italic')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Italique"
                        >
                          <Italic className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('underline')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Souligné"
                        >
                          <Underline className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('strikeThrough')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Barré"
                        >
                          <Strikethrough className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Taille du texte */}
                      <div className="flex items-center gap-1 px-2 border-r">
                        <select
                          onChange={(e) => formatText('fontSize', e.target.value)}
                          className="px-2 py-1 text-sm border rounded"
                          title="Taille du texte"
                        >
                          <option value="">Taille</option>
                          <option value="1">Très petit</option>
                          <option value="2">Petit</option>
                          <option value="3">Normal</option>
                          <option value="4">Moyen</option>
                          <option value="5">Grand</option>
                          <option value="6">Très grand</option>
                          <option value="7">Énorme</option>
                        </select>
                      </div>

                      {/* Couleur */}
                      <div className="flex items-center gap-1 px-2 border-r">
                        <input
                          type="color"
                          onChange={(e) => formatText('foreColor', e.target.value)}
                          className="w-8 h-8 border rounded cursor-pointer"
                          title="Couleur du texte"
                        />
                        <Palette className="h-4 w-4 text-gray-500" />
                        <input
                          type="color"
                          onChange={(e) => formatText('backColor', e.target.value)}
                          className="w-8 h-8 border rounded cursor-pointer"
                          title="Couleur de fond"
                        />
                        <Paintbrush className="h-4 w-4 text-gray-500" />
                      </div>

                      {/* Alignement */}
                      <div className="flex items-center gap-1 px-2 border-r">
                        <button
                          type="button"
                          onClick={() => formatText('justifyLeft')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Aligner à gauche"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('justifyCenter')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Centrer"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('justifyRight')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Aligner à droite"
                        >
                          <AlignRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('justifyFull')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Justifier"
                        >
                          <AlignJustify className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Listes */}
                      <div className="flex items-center gap-1 px-2 border-r">
                        <button
                          type="button"
                          onClick={() => formatText('insertUnorderedList')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Liste à puces"
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('insertOrderedList')}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Liste numérotée"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Liens et images */}
                      <div className="flex items-center gap-1 px-2 border-r">
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Entrez l\'URL du lien:');
                            if (url) formatText('createLink', url);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Insérer un lien"
                        >
                          <Link2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Entrez l\'URL de l\'image:');
                            if (url) formatText('insertImage', url);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded"
                          title="Insérer une image"
                        >
                          <Image className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Variables */}
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-xs text-gray-600 mr-1">Variables:</span>
                        <button
                          type="button"
                          onClick={() => insertVariable('{name}')}
                          className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded"
                        >
                          {'{name}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable('{date}')}
                          className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded"
                        >
                          {'{date}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable('{points}')}
                          className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded"
                        >
                          {'{points}'}
                        </button>
                      </div>
                    </div>

                    {/* Éditeur */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorChange}
                      className="w-full min-h-[400px] max-h-[600px] overflow-y-auto px-4 py-3 border rounded-b-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{ __html: emailData.content || '<p>Commencez à écrire votre message ici...</p>' }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={previewEmail}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </button>
                    <button
                      onClick={sendTestEmail}
                      disabled={!emailData.subject || !emailData.content}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer un test
                    </button>
                  </div>
                  
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

      {/* Modal envoi de test */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Envoyer un email de test</h3>
              <button onClick={() => setShowTestModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Entrez votre adresse email pour recevoir un aperçu de cette campagne avant de l'envoyer à vos clients.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Adresse email de test</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  Aperçu du test :
                </p>
                <p className="text-xs text-blue-700 font-medium mb-2">
                  Objet : [TEST] {emailData.subject}
                </p>
                <div className="bg-white border border-blue-200 rounded p-2 mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Contenu :</p>
                  <div
                    className="text-xs text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: emailData.content
                        .replace(/{name}/g, '<strong>Test Client</strong>')
                        .replace(/{date}/g, `<strong>${new Date().toLocaleDateString('fr-FR')}</strong>`)
                        .replace(/{points}/g, '<strong>100</strong>')
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmSendTest}
                  disabled={!testEmail || sendingTest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {sendingTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}