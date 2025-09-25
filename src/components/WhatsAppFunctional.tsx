'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Users, Clock, Sparkles, Search, Plus,
  Phone, Calendar, TrendingUp, Zap, Settings, BarChart3, MessageSquare,
  Paperclip, Mic, Smile, Check, CheckCheck, RefreshCw, Pause, Play,
  Edit3, Trash2, Save, X, Eye, Download, Upload
} from 'lucide-react';

export default function WhatsAppFunctional() {
  const [activeView, setActiveView] = useState<'chat' | 'campaigns' | 'templates' | 'automation' | 'analytics'>('chat');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('all');
  const [clientSearchCampaign, setClientSearchCampaign] = useState('');
  const [clientSearchBroadcast, setClientSearchBroadcast] = useState('');
  const templateSelectorRef = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', templateId: '', recipients: [], selectedClients: [] as string[], recipientType: 'all' });
  const [newTemplate, setNewTemplate] = useState({ name: '', category: '', content: '', variables: [] });
  const [broadcastMessage, setBroadcastMessage] = useState({ message: '', recipients: 'all', selectedClients: [] as string[] });

  // Charger les données au démarrage
  useEffect(() => {
    loadClients();
    loadTemplates();
    loadCampaigns();
    loadAutomations();
  }, []);
  
  // Fermer le sélecteur de modèles en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateSelectorRef.current && !templateSelectorRef.current.contains(event.target as Node)) {
        const buttonTarget = (event.target as HTMLElement).closest('button[title="Utiliser un modèle"]');
        if (!buttonTarget) {
          setShowTemplateSelector(false);
          setTemplateSearch('');
          setSelectedTemplateCategory('all');
        }
      }
    };

    if (showTemplateSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplateSelector]);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((client: any, idx: number) => ({
          ...client,
          avatar: ['👩', '👱‍♀️', '👩‍🦰', '👩‍🦱', '👧'][idx % 5]
        })));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadAutomations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/automations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAutomations(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // ACTIONS

  const sendMessage = async () => {
    if (!message.trim() || !selectedClient) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: selectedClient.phone,
          message: message,
          clientName: selectedClient.name
        })
      });

      if (response.ok) {
        setMessages([...messages, {
          id: Date.now().toString(),
          text: message,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          status: 'delivered'
        }]);
        setMessage('');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Préparer les destinataires selon le type sélectionné
      let recipients: string[] = [];
      if (newCampaign.recipientType === 'all') {
        recipients = clients.map(c => c.phone).filter(p => p);
      } else if (newCampaign.recipientType === 'vip') {
        recipients = clients
          .filter(c => c.totalSpent > 500)
          .map(c => c.phone)
          .filter(p => p);
      } else if (newCampaign.recipientType === 'new') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        recipients = clients
          .filter(c => new Date(c.createdAt) > thirtyDaysAgo)
          .map(c => c.phone)
          .filter(p => p);
      } else if (newCampaign.recipientType === 'custom') {
        recipients = newCampaign.selectedClients;
      }
      
      const campaignData = {
        name: newCampaign.name,
        templateId: newCampaign.templateId,
        recipients: recipients,
        recipientCount: recipients.length,
        status: 'draft'
      };
      
      const response = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        await loadCampaigns();
        setShowNewCampaignModal(false);
        setNewCampaign({ name: '', templateId: '', recipients: [], selectedClients: [], recipientType: 'all' });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, action: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/campaigns', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: campaignId, action })
      });

      if (response.ok) {
        await loadCampaigns();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTemplate)
      });

      if (response.ok) {
        await loadTemplates();
        setShowNewTemplateModal(false);
        setNewTemplate({ name: '', category: '', content: '', variables: [] });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (automationId: string, enabled: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/automations', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: automationId, enabled })
      });

      if (response.ok) {
        await loadAutomations();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let recipients: string[] = [];
      
      if (broadcastMessage.recipients === 'custom') {
        // Utiliser les clients sélectionnés pour l'envoi personnalisé
        recipients = broadcastMessage.selectedClients;
      } else if (broadcastMessage.recipients === 'all') {
        // Envoyer à tous les clients
        recipients = clients.map(c => c.phone).filter(p => p);
      } else if (broadcastMessage.recipients === 'vip') {
        // Filtrer les clients VIP (exemple: ceux avec plus de 5 réservations)
        recipients = clients
          .filter(c => c.totalSpent > 500) // Clients ayant dépensé plus de 500€
          .map(c => c.phone)
          .filter(p => p);
      } else if (broadcastMessage.recipients === 'new') {
        // Nouveaux clients (inscrits dans les 30 derniers jours)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        recipients = clients
          .filter(c => new Date(c.createdAt) > thirtyDaysAgo)
          .map(c => c.phone)
          .filter(p => p);
      }

      const response = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: broadcastMessage.message,
          recipients,
          filters: broadcastMessage.recipients
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Message envoyé à ${recipients.length} client(s) avec succès !`);
        setShowBroadcastModal(false);
        setBroadcastMessage({ message: '', recipients: 'all', selectedClients: [] });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: any) => {
    // Remplacer les variables du template si un client est sélectionné
    let content = template.content;
    if (selectedClient) {
      content = content.replace('{name}', selectedClient.name || 'Client');
      content = content.replace('{phone}', selectedClient.phone || '');
      // Vous pouvez ajouter d'autres remplacements selon vos besoins
    }
    setMessage(content);
    setShowTemplateSelector(false);
    if (activeView !== 'chat') {
      setActiveView('chat');
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WhatsApp Business Pro</h1>
              <p className="text-xs text-gray-500">Centre de communication client</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Diffusion groupée
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mt-4 border-b border-gray-200 -mb-3">
          {[
            { id: 'chat', label: 'Conversations', icon: MessageCircle },
            { id: 'campaigns', label: 'Campagnes', icon: Zap },
            { id: 'templates', label: 'Modèles', icon: MessageSquare },
            { id: 'automation', label: 'Automatisation', icon: RefreshCw },
            { id: 'analytics', label: 'Analytiques', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-base transition-all border-b-3 ${
                activeView === tab.id
                  ? 'text-green-600 border-green-600 bg-green-50'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vue Chat */}
      {activeView === 'chat' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-96 bg-white border-r">
            <div className="p-3 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="overflow-y-auto">
              {clients
                .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                    selectedClient?.id === client.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{client.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-base">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedClient ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white px-6 py-4 border-b shadow-sm">
                <h2 className="font-semibold text-lg">{selectedClient.name}</h2>
                <p className="text-sm text-gray-500">{selectedClient.phone}</p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-md px-4 py-3 rounded-xl shadow-sm ${
                      msg.sent ? 'bg-green-500 text-white' : 'bg-white border'
                    }`}>
                      <p className="text-base">{msg.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border-t p-4 relative">
                {/* Aperçu du message si long */}
                {message.length > 100 && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-medium mb-1">Aperçu du message :</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
                  </div>
                )}
                
                <div className="flex gap-2 items-end">
                  <button
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Utiliser un modèle"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Tapez votre message... (Shift+Enter pour nouvelle ligne)"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-base"
                    rows={message.split('\n').length > 3 ? 4 : message.length > 50 ? 3 : 2}
                    style={{ minHeight: '60px', maxHeight: '150px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || loading}
                    className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Sélecteur de modèles amélioré */}
                {showTemplateSelector && (
                  <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setShowTemplateSelector(false);
                        setTemplateSearch('');
                        setSelectedTemplateCategory('all');
                      }
                    }}
                  >
                    <div ref={templateSelectorRef} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="p-5 border-b bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-2xl text-gray-800">Choisir un modèle de message</h4>
                        <button 
                          onClick={() => {
                            setShowTemplateSelector(false);
                            setTemplateSearch('');
                            setSelectedTemplateCategory('all');
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Barre de recherche */}
                      <div className="relative mb-3">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un modèle..."
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      {/* Filtres par catégorie */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedTemplateCategory('all')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            selectedTemplateCategory === 'all'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Tous ({templates.length})
                        </button>
                        <button
                          onClick={() => setSelectedTemplateCategory('reminder')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            selectedTemplateCategory === 'reminder'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Rappels ({templates.filter(t => t.category === 'reminder').length})
                        </button>
                        <button
                          onClick={() => setSelectedTemplateCategory('promotion')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            selectedTemplateCategory === 'promotion'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Promotions ({templates.filter(t => t.category === 'promotion').length})
                        </button>
                        <button
                          onClick={() => setSelectedTemplateCategory('followup')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            selectedTemplateCategory === 'followup'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Suivi ({templates.filter(t => t.category === 'followup').length})
                        </button>
                      </div>
                    </div>
                    
                    {/* Liste des modèles filtrés */}
                    <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 250px)' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates
                          .filter(template => {
                            const matchesSearch = templateSearch === '' || 
                              template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                              template.content.toLowerCase().includes(templateSearch.toLowerCase());
                            const matchesCategory = selectedTemplateCategory === 'all' || 
                              template.category === selectedTemplateCategory;
                            return matchesSearch && matchesCategory;
                          })
                          .map((template) => (
                            <button
                              key={template.id}
                              onClick={() => useTemplate(template)}
                              className="w-full text-left p-5 bg-white rounded-xl hover:bg-green-50 transition-all border-2 border-gray-200 hover:border-green-400 hover:shadow-lg"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-bold text-lg text-gray-900">{template.name}</h5>
                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                  template.category === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                                  template.category === 'promotion' ? 'bg-purple-100 text-purple-700' :
                                  template.category === 'followup' ? 'bg-blue-100 text-blue-700' :
                                  template.category === 'birthday' ? 'bg-pink-100 text-pink-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {template.category === 'reminder' ? 'Rappel' :
                                   template.category === 'promotion' ? 'Promo' :
                                   template.category === 'followup' ? 'Suivi' :
                                   template.category === 'birthday' ? 'Anniversaire' :
                                   template.category}
                                </span>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                  {template.content}
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                      {templates.filter(template => {
                        const matchesSearch = templateSearch === '' || 
                          template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                          template.content.toLowerCase().includes(templateSearch.toLowerCase());
                        const matchesCategory = selectedTemplateCategory === 'all' || 
                          template.category === selectedTemplateCategory;
                        return matchesSearch && matchesCategory;
                      }).length === 0 && (
                        <p className="text-center text-gray-500 py-4">Aucun modèle trouvé</p>
                      )}
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Campagnes */}
      {activeView === 'campaigns' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Campagnes</h2>
            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle campagne
            </button>
          </div>

          {/* Campagnes actives */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Campagnes actives</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.filter(c => c.status === 'active' || c.status === 'paused').map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {campaign.status === 'active' ? 'Active' : 'En pause'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Envoyés :</span>
                      <span className="font-medium">{campaign.sentCount || 0} / {campaign.recipientCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux livraison :</span>
                      <span className="font-medium">
                        {campaign.recipientCount > 0 
                          ? Math.round((campaign.deliveredCount || 0) / campaign.recipientCount * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux lecture :</span>
                      <span className="font-medium">
                        {campaign.deliveredCount > 0 
                          ? Math.round((campaign.readCount || 0) / (campaign.deliveredCount || 1) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${campaign.recipientCount > 0 
                          ? (campaign.sentCount / campaign.recipientCount * 100) 
                          : 0}%`
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'active' ? (
                      <button
                        onClick={() => updateCampaignStatus(campaign.id, 'pause')}
                        className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm flex items-center justify-center gap-1"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCampaignStatus(campaign.id, 'start')}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center justify-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        Reprendre
                      </button>
                    )}
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historique des campagnes */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Historique des campagnes</h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campagne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destinataires
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livrés
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lus
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-500">Template: {campaign.templateId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium">{campaign.recipientCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-green-600">
                            {campaign.deliveredCount || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({campaign.recipientCount > 0 
                              ? Math.round((campaign.deliveredCount || 0) / campaign.recipientCount * 100) 
                              : 0}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-blue-600">
                            {campaign.readCount || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({campaign.deliveredCount > 0 
                              ? Math.round((campaign.readCount || 0) / (campaign.deliveredCount || 1) * 100) 
                              : 0}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'active' 
                            ? 'bg-blue-100 text-blue-800'
                            : campaign.status === 'paused' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : campaign.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status === 'completed' ? 'Terminée' : 
                           campaign.status === 'active' ? 'Active' :
                           campaign.status === 'paused' ? 'En pause' :
                           campaign.status === 'cancelled' ? 'Annulée' : 
                           'Brouillon'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaigns.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune campagne pour le moment
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vue Templates */}
      {activeView === 'templates' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Modèles</h2>
            <button
              onClick={() => setShowNewTemplateModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer un modèle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-2">{template.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {template.category}
                </span>
                <p className="text-sm text-gray-600 mt-3 mb-4 line-clamp-3">{template.content}</p>
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Utiliser
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue Automatisations */}
      {activeView === 'automation' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Automatisations</h2>
          <div className="space-y-4">
            {automations.map((auto) => (
              <div key={auto.id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{auto.name}</h3>
                  <p className="text-sm text-gray-600">Déclencheur : {auto.trigger}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auto.enabled}
                    onChange={(e) => toggleAutomation(auto.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue Analytiques */}
      {activeView === 'analytics' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Analytiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm text-gray-600 mb-2">Messages aujourd'hui</h3>
              <p className="text-3xl font-bold">47</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm text-gray-600 mb-2">Taux d'ouverture</h3>
              <p className="text-3xl font-bold">94%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm text-gray-600 mb-2">Réponses</h3>
              <p className="text-3xl font-bold">31</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm text-gray-600 mb-2">Nouveaux contacts</h3>
              <p className="text-3xl font-bold">8</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Campagne */}
      {showNewCampaignModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Fermer si on clique sur le backdrop
            if (e.target === e.currentTarget) {
              // Vérifier si des données ont été remplies
              const hasData = newCampaign.name || newCampaign.templateId || newCampaign.selectedClients.length > 0;
              
              if (hasData) {
                if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                  setShowNewCampaignModal(false);
                  setNewCampaign({ name: '', templateId: '', recipients: [], selectedClients: [], recipientType: 'all' });
                  setClientSearchCampaign('');
                }
              } else {
                setShowNewCampaignModal(false);
                setNewCampaign({ name: '', templateId: '', recipients: [], selectedClients: [], recipientType: 'all' });
                setClientSearchCampaign('');
              }
            }
          }}
        >
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nouvelle campagne</h3>
            
            <input
              type="text"
              placeholder="Nom de la campagne"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
            />
            
            <select
              value={newCampaign.templateId}
              onChange={(e) => setNewCampaign({...newCampaign, templateId: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
            >
              <option value="">Choisir un modèle</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            
            {/* Sélection du type de destinataires */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
            <select
              value={newCampaign.recipientType}
              onChange={(e) => setNewCampaign({...newCampaign, recipientType: e.target.value, selectedClients: []})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
            >
              <option value="all">Tous les clients ({clients.filter(c => c.phone).length})</option>
              <option value="vip">Clients VIP ({clients.filter(c => c.totalSpent > 500).length})</option>
              <option value="new">Nouveaux clients (30 derniers jours)</option>
              <option value="custom">Sélection personnalisée</option>
            </select>
            
            {/* Liste de sélection personnalisée */}
            {newCampaign.recipientType === 'custom' && (
              <div className="mb-4 border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-600 font-medium">Sélectionnez les clients :</p>
                  <span className="text-sm text-gray-500">{newCampaign.selectedClients.length} sélectionnés</span>
                </div>
                
                {/* Barre de recherche rapide */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={clientSearchCampaign}
                    onChange={(e) => setClientSearchCampaign(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  {clients
                    .filter(c => c.phone)
                    .filter(c => {
                      if (!clientSearchCampaign) return true;
                      const search = clientSearchCampaign.toLowerCase();
                      return c.name?.toLowerCase().includes(search) || 
                             c.phone?.toLowerCase().includes(search) ||
                             c.email?.toLowerCase().includes(search);
                    })
                    .map((client) => (
                    <label key={client.id} className="flex items-center gap-3 hover:bg-white p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCampaign.selectedClients.includes(client.phone)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCampaign({
                              ...newCampaign,
                              selectedClients: [...newCampaign.selectedClients, client.phone]
                            });
                          } else {
                            setNewCampaign({
                              ...newCampaign,
                              selectedClients: newCampaign.selectedClients.filter(p => p !== client.phone)
                            });
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{client.phone}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm border-t pt-3">
                  <button
                    type="button"
                    onClick={() => setNewCampaign({
                      ...newCampaign,
                      selectedClients: clients.filter(c => c.phone).map(c => c.phone)
                    })}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-gray-600">{newCampaign.selectedClients.length} sélectionnés</span>
                  <button
                    type="button"
                    onClick={() => setNewCampaign({
                      ...newCampaign,
                      selectedClients: []
                    })}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
            )}
            
            {/* Résumé */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Résumé :</strong> {
                  newCampaign.recipientType === 'custom' 
                    ? `${newCampaign.selectedClients.length} client(s) sélectionné(s)`
                    : newCampaign.recipientType === 'all'
                    ? `${clients.filter(c => c.phone).length} clients au total`
                    : newCampaign.recipientType === 'vip'
                    ? `${clients.filter(c => c.totalSpent > 500).length} clients VIP`
                    : 'Nouveaux clients du mois'
                }
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={createCampaign}
                disabled={loading || !newCampaign.name || !newCampaign.templateId || 
                  (newCampaign.recipientType === 'custom' && newCampaign.selectedClients.length === 0)}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-base font-medium disabled:opacity-50"
              >
                Créer la campagne
              </button>
              <button
                onClick={() => {
                  setShowNewCampaignModal(false);
                  setNewCampaign({ name: '', templateId: '', recipients: [], selectedClients: [], recipientType: 'all' });
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-base font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Template */}
      {showNewTemplateModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const hasData = newTemplate.name || newTemplate.category || newTemplate.content;
              
              if (hasData) {
                if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                  setShowNewTemplateModal(false);
                  setNewTemplate({ name: '', category: '', content: '', variables: [] });
                }
              } else {
                setShowNewTemplateModal(false);
                setNewTemplate({ name: '', category: '', content: '', variables: [] });
              }
            }
          }}
        >
          <div className="bg-white rounded-xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nouveau modèle</h3>
            <input
              type="text"
              placeholder="Nom du modèle"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
            />
            <select
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
            >
              <option value="">Catégorie</option>
              <option value="reminder">Rappel</option>
              <option value="promotion">Promotion</option>
              <option value="birthday">Anniversaire</option>
              <option value="followup">Suivi</option>
            </select>
            <textarea
              placeholder="Contenu du message..."
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={createTemplate}
                disabled={loading}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-base font-medium"
              >
                Créer
              </button>
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-base font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Diffusion Groupée */}
      {showBroadcastModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const hasData = broadcastMessage.message || 
                (broadcastMessage.recipients === 'custom' && broadcastMessage.selectedClients.length > 0);
              
              if (hasData) {
                if (confirm('Vous avez un message non envoyé. Voulez-vous vraiment fermer ?')) {
                  setShowBroadcastModal(false);
                  setBroadcastMessage({ message: '', recipients: 'all', selectedClients: [] });
                  setClientSearchBroadcast('');
                }
              } else {
                setShowBroadcastModal(false);
                setBroadcastMessage({ message: '', recipients: 'all', selectedClients: [] });
                setClientSearchBroadcast('');
              }
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Diffusion groupée</h3>
            <select
              value={broadcastMessage.recipients}
              onChange={(e) => setBroadcastMessage({...broadcastMessage, recipients: e.target.value, selectedClients: []})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
            >
              <option value="all">Tous les clients ({clients.filter(c => c.phone).length})</option>
              <option value="vip">Clients VIP ({clients.filter(c => c.totalSpent > 500).length})</option>
              <option value="new">Nouveaux clients (30 derniers jours)</option>
              <option value="custom">Personnalisé</option>
            </select>
            
            {/* Sélecteur de clients pour l'option personnalisée */}
            {broadcastMessage.recipients === 'custom' && (
              <div className="mb-4 border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-600 font-medium">Sélectionnez les clients :</p>
                  <span className="text-sm text-gray-500">{broadcastMessage.selectedClients.length} sélectionnés</span>
                </div>
                
                {/* Barre de recherche rapide */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, téléphone ou email..."
                    value={clientSearchBroadcast}
                    onChange={(e) => setClientSearchBroadcast(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {clients
                    .filter(c => c.phone)
                    .filter(c => {
                      if (!clientSearchBroadcast) return true;
                      const search = clientSearchBroadcast.toLowerCase();
                      return c.name?.toLowerCase().includes(search) || 
                             c.phone?.toLowerCase().includes(search) ||
                             c.email?.toLowerCase().includes(search);
                    })
                    .map((client) => (
                    <label key={client.id} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastMessage.selectedClients.includes(client.phone)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBroadcastMessage({
                              ...broadcastMessage,
                              selectedClients: [...broadcastMessage.selectedClients, client.phone]
                            });
                          } else {
                            setBroadcastMessage({
                              ...broadcastMessage,
                              selectedClients: broadcastMessage.selectedClients.filter(p => p !== client.phone)
                            });
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{client.phone}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <button
                    onClick={() => setBroadcastMessage({
                      ...broadcastMessage,
                      selectedClients: clients.filter(c => c.phone).map(c => c.phone)
                    })}
                    className="text-blue-600 hover:underline"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setBroadcastMessage({
                      ...broadcastMessage,
                      selectedClients: []
                    })}
                    className="text-red-600 hover:underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
            )}
            
            <textarea
              placeholder="Message à envoyer..."
              value={broadcastMessage.message}
              onChange={(e) => setBroadcastMessage({...broadcastMessage, message: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-base"
              rows={4}
            />
            
            {/* Afficher le nombre de destinataires */}
            <p className="text-sm text-gray-600 mb-3">
              Destinataires : {
                broadcastMessage.recipients === 'custom' 
                  ? `${broadcastMessage.selectedClients.length} client(s) sélectionné(s)`
                  : broadcastMessage.recipients === 'all'
                  ? `${clients.filter(c => c.phone).length} clients`
                  : broadcastMessage.recipients === 'vip'
                  ? `${clients.filter(c => c.totalSpent > 500).length} clients VIP`
                  : 'Nouveaux clients'
              }
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={sendBroadcast}
                disabled={loading || !broadcastMessage.message || (broadcastMessage.recipients === 'custom' && broadcastMessage.selectedClients.length === 0)}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Envoyer
              </button>
              <button
                onClick={() => {
                  setShowBroadcastModal(false);
                  setBroadcastMessage({ message: '', recipients: 'all', selectedClients: [] });
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-base font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}