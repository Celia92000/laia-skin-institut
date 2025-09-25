'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Users, Clock, Sparkles, Search, Plus, Filter,
  CheckCircle, Phone, Calendar, TrendingUp, Zap, ChevronRight, X,
  Settings, History, Star, Bell, Gift, Heart, BarChart3, MessageSquare,
  ArrowLeft, MoreVertical, Paperclip, Mic, Smile, Check, CheckCheck,
  Image, File, MapPin, Timer, RefreshCw, Archive, Trash2, Edit3
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  nextRdv?: string;
  avatar: string;
  status?: 'online' | 'offline' | 'typing';
  lastSeen?: string;
  tags?: string[];
}

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file' | 'audio';
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  sent: number;
  total: number;
  successRate: number;
  type: 'reminder' | 'promotion' | 'birthday' | 'followup';
}

export default function WhatsAppUltimate() {
  const [activeView, setActiveView] = useState<'chat' | 'campaigns' | 'templates' | 'automation' | 'analytics'>('chat');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'vip' | 'today'>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Stats en temps réel
  const [stats] = useState({
    messagesAujourdhui: 47,
    tauxOuverture: 94,
    reponses: 31,
    nouveauxContacts: 8,
    campagnesActives: 3,
    automationsActives: 5
  });

  // Charger les clients
  useEffect(() => {
    loadClients();
    loadMessages();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedClients = data.map((client: any, idx: number) => ({
          id: client.id,
          name: client.name || 'Client',
          phone: client.phone || '+336xxxxxxxx',
          lastMessage: 'Cliquez pour démarrer la conversation',
          time: 'Nouveau',
          unread: Math.floor(Math.random() * 3),
          nextRdv: client.nextReservation,
          avatar: ['👩', '👱‍♀️', '👩‍🦰', '👩‍🦱', '👧'][idx % 5],
          status: Math.random() > 0.5 ? 'online' : 'offline',
          lastSeen: 'Il y a 5 min',
          tags: ['VIP', 'Fidèle', 'Nouveau'][Math.floor(Math.random() * 3)] ? [['VIP', 'Fidèle', 'Nouveau'][Math.floor(Math.random() * 3)]] : []
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      // Utiliser des données par défaut
      setClients(defaultClients);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = () => {
    // Simuler des messages
    setMessages([
      { id: '1', text: "Bonjour, j'ai RDV demain à 14h30, c'est bien ça ?", time: '10:28', sent: false, status: 'read' },
      { id: '2', text: "Oui parfait ! Je vous confirme votre RDV demain à 14h30. À demain !", time: '10:30', sent: true, status: 'read' },
      { id: '3', text: "Merci pour le rappel !", time: '10:31', sent: false, status: 'read' },
      { id: '4', text: "De rien ! N'hésitez pas si vous avez des questions.", time: '10:32', sent: true, status: 'delivered' }
    ]);
  };

  const defaultClients: Client[] = [
    { 
      id: '1', 
      name: 'Marie Dupont', 
      phone: '+33612345678', 
      lastMessage: 'Merci pour le rappel !', 
      time: '10:30',
      unread: 2,
      nextRdv: 'Demain 14h30',
      avatar: '👩',
      status: 'online',
      tags: ['VIP']
    },
    { 
      id: '2', 
      name: 'Sophie Martin', 
      phone: '+33623456789', 
      lastMessage: 'À quelle heure demain ?', 
      time: 'Hier',
      unread: 0,
      nextRdv: '28 Nov 10h',
      avatar: '👱‍♀️',
      status: 'offline',
      lastSeen: 'Hier à 18:45',
      tags: ['Fidèle']
    }
  ];

  // Templates améliorés
  const templates = [
    { 
      id: 'reminder', 
      name: 'Rappel de RDV', 
      preview: 'Bonjour {name}, rappel de votre RDV demain à {time}',
      variables: ['name', 'time', 'date', 'service'],
      category: 'Rappels',
      usage: 423,
      successRate: 99
    },
    { 
      id: 'birthday', 
      name: 'Anniversaire', 
      preview: 'Joyeux anniversaire {name} ! 🎂 -20% sur votre prochain soin',
      variables: ['name', 'discount'],
      category: 'Fidélité',
      usage: 156,
      successRate: 100
    },
    { 
      id: 'followup', 
      name: 'Suivi post-soin', 
      preview: 'Bonjour {name}, comment vous sentez-vous après votre {service} ?',
      variables: ['name', 'service', 'date'],
      category: 'Service',
      usage: 234,
      successRate: 92
    }
  ];

  // Campagnes
  const campaigns: Campaign[] = [
    { id: '1', name: 'Rappels du jour', status: 'active', sent: 12, total: 25, successRate: 98, type: 'reminder' },
    { id: '2', name: 'Promo Black Friday', status: 'paused', sent: 156, total: 500, successRate: 76, type: 'promotion' },
    { id: '3', name: 'Anniversaires Novembre', status: 'completed', sent: 18, total: 18, successRate: 100, type: 'birthday' }
  ];

  // Automations
  const automations = [
    { 
      id: '1',
      name: 'Rappel 24h avant',
      trigger: 'RDV -24h',
      template: 'reminder',
      active: true,
      sent: 1247,
      successRate: 98.5
    },
    {
      id: '2',
      name: 'Message anniversaire',
      trigger: 'Date anniversaire',
      template: 'birthday',
      active: true,
      sent: 156,
      successRate: 100
    },
    {
      id: '3',
      name: 'Suivi 48h après',
      trigger: 'RDV +48h',
      template: 'followup',
      active: false,
      sent: 234,
      successRate: 92
    }
  ];

  const sendMessage = async () => {
    if (!message.trim() || !selectedClient) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      status: 'sending'
    };
    
    setMessages([...messages, newMessage]);
    
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
        // Mettre à jour le statut du message
        setMessages(prev => prev.map(m => 
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        ));
        
        // Jouer un son de notification
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'sent' } : m
      ));
    }
    
    setMessage('');
    setShowEmojis(false);
  };

  const filteredClients = clients.filter(client => {
    if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedFilter === 'unread' && client.unread === 0) return false;
    if (selectedFilter === 'vip' && !client.tags?.includes('VIP')) return false;
    if (selectedFilter === 'today' && client.time !== '10:30') return false;
    return true;
  });

  const emojis = ['😊', '👍', '❤️', '🎉', '🙏', '😍', '🌟', '✨', '💕', '🎂', '🎁', '👏'];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header principal */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WhatsApp Business Pro</h1>
              <p className="text-xs text-gray-500">Centre de communication client intégré</p>
            </div>
          </div>
          
          {/* Stats rapides */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">{stats.messagesAujourdhui} messages</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">{stats.tauxOuverture}% ouverture</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">+{stats.nouveauxContacts} nouveaux</span>
              </div>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-1 mt-4 border-b border-gray-200 -mb-4">
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
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-all border-b-2 ${
                activeView === tab.id
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
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
          {/* Liste des conversations */}
          <div className="w-80 bg-white border-r flex flex-col">
            {/* Recherche et filtres */}
            <div className="p-4 border-b">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Filtres rapides */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'unread', label: 'Non lus' },
                  { id: 'vip', label: 'VIP' },
                  { id: 'today', label: "Aujourd'hui" }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id as any)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des clients */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-all border-b ${
                      selectedClient?.id === client.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="text-2xl">{client.avatar}</div>
                        {client.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                          <span className="text-xs text-gray-500">{client.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            {client.nextRdv && (
                              <>
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{client.nextRdv}</span>
                              </>
                            )}
                          </div>
                          {client.tags && client.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {client.unread > 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {client.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions rapides */}
            <div className="p-4 border-t bg-gray-50 space-y-2">
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Plus className="w-4 h-4" />
                Nouvelle conversation
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border">
                <Users className="w-4 h-4" />
                Diffusion groupée
              </button>
            </div>
          </div>

          {/* Zone de conversation */}
          {selectedClient ? (
            <div className="flex-1 flex flex-col">
              {/* Header de la conversation */}
              <div className="bg-white px-6 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="text-3xl">{selectedClient.avatar}</div>
                    {selectedClient.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedClient.name}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{selectedClient.phone}</span>
                      {selectedClient.status === 'online' ? (
                        <span className="text-green-500">En ligne</span>
                      ) : (
                        <span>Vu {selectedClient.lastSeen}</span>
                      )}
                      {selectedClient.nextRdv && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {selectedClient.nextRdv}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-[url('/whatsapp-bg.png')] bg-opacity-5">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-sm ${msg.sent ? 'order-2' : ''}`}>
                        <div className={`px-4 py-2 rounded-lg shadow-sm ${
                          msg.sent ? 'bg-green-500 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <div className={`flex items-center gap-1 justify-end mt-1 ${
                            msg.sent ? 'text-green-100' : 'text-gray-400'
                          }`}>
                            <span className="text-xs">{msg.time}</span>
                            {msg.sent && (
                              msg.status === 'read' ? <CheckCheck className="w-3 h-3" /> :
                              msg.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> :
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone de saisie */}
              <div className="bg-white border-t p-4">
                {/* Emojis */}
                {showEmojis && (
                  <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg p-3 grid grid-cols-6 gap-2">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setMessage(message + emoji)}
                        className="text-2xl hover:bg-gray-100 rounded p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  
                  {message.trim() ? (
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`p-2 rounded-full transition-colors ${
                        isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600">Sélectionnez une conversation</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm">
                  Choisissez un client dans la liste ou démarrez une nouvelle conversation
                </p>
                <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Nouvelle conversation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Campagnes */}
      {activeView === 'campaigns' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Campagnes de messagerie</h2>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle campagne
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status === 'active' ? 'Active' :
                       campaign.status === 'paused' ? 'En pause' : 'Terminée'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-medium">{campaign.sent}/{campaign.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.sent / campaign.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taux de succès</span>
                      <span className="font-medium text-green-600">{campaign.successRate}%</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {campaign.status === 'active' ? (
                      <button className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                        Mettre en pause
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                        Reprendre
                      </button>
                    ) : (
                      <button className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                        Voir les résultats
                      </button>
                    )}
                    <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue Templates */}
      {activeView === 'templates' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Modèles de messages</h2>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Créer un modèle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {template.category}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">{template.preview}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.variables.map(v => (
                      <span key={v} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {v}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{template.usage} utilisations</span>
                    <span className="text-green-600">{template.successRate}% succès</span>
                  </div>
                  
                  <button className="w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    Utiliser ce modèle
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue Automation */}
      {activeView === 'automation' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Automatisations</h2>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle automatisation
              </button>
            </div>

            <div className="space-y-4">
              {automations.map((automation) => (
                <div key={automation.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Déclencheur : <span className="font-medium">{automation.trigger}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Modèle : <span className="font-medium">{automation.template}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{automation.sent} envois</p>
                        <p className="text-sm font-medium text-green-600">{automation.successRate}% succès</p>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue Analytics */}
      {activeView === 'analytics' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytiques WhatsApp</h2>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Messages aujourd'hui", value: stats.messagesAujourdhui, change: '+12%', icon: MessageCircle },
                { label: 'Taux d\'ouverture', value: `${stats.tauxOuverture}%`, change: '+3%', icon: TrendingUp },
                { label: 'Réponses reçues', value: stats.reponses, change: '+8%', icon: Bell },
                { label: 'Campagnes actives', value: stats.campagnesActives, change: '0', icon: Zap }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <stat.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité sur 7 jours</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[65, 80, 45, 90, 70, 85, 95].map((height, idx) => (
                    <div key={idx} className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group">
                      <div style={{ height: `${height}%` }}></div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {height}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top campagnes</h3>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.sent} messages</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{campaign.successRate}%</p>
                        <p className="text-xs text-gray-500">Taux de succès</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}