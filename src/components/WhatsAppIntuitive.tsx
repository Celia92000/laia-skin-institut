'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Users, Clock, Sparkles,
  CheckCircle, Phone, Search, Plus, Filter,
  Calendar, TrendingUp, Zap, ChevronRight
} from 'lucide-react';

export default function WhatsAppIntuitive() {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickReplyActive, setQuickReplyActive] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les clients depuis la BDD
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transformer les données pour l'affichage
        const formattedClients = data.map((client: any, idx: number) => ({
          id: client.id,
          name: client.name || 'Client',
          phone: client.phone || '+336xxxxxxxx',
          lastMessage: 'Cliquez pour envoyer un message',
          time: 'Nouveau',
          unread: 0,
          nextRdv: client.nextReservation || 'Aucun RDV',
          avatar: ['👩', '👱‍♀️', '👩‍🦰', '👩‍🦱', '👧'][idx % 5]
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clients par défaut (en cas d'erreur de chargement)
  const defaultClients = [
    { 
      id: 1, 
      name: 'Marie Dupont', 
      phone: '+33612345678', 
      lastMessage: 'Merci pour le rappel !', 
      time: '10:30',
      unread: 2,
      nextRdv: 'Demain 14h30',
      avatar: '👩'
    },
    { 
      id: 2, 
      name: 'Sophie Martin', 
      phone: '+33623456789', 
      lastMessage: 'À quelle heure demain ?', 
      time: 'Hier',
      unread: 0,
      nextRdv: '28 Nov 10h',
      avatar: '👱‍♀️'
    },
    { 
      id: 3, 
      name: 'Julie Bernard', 
      phone: '+33634567890', 
      lastMessage: 'Parfait, à demain', 
      time: 'Lun',
      unread: 0,
      nextRdv: '2 Déc 15h',
      avatar: '👩‍🦰'
    }
  ];

  // Messages rapides prédéfinis
  const quickMessages = [
    { id: 'confirm', label: '✅ Confirmer RDV', text: 'Bonjour {name}, je vous confirme votre RDV de demain à {time}. À bientôt !' },
    { id: 'remind', label: '⏰ Rappel', text: 'Bonjour {name}, petit rappel pour votre RDV demain à {time}. N\'oubliez pas d\'apporter votre carte vitale.' },
    { id: 'thanks', label: '💕 Remerciement', text: 'Merci {name} pour votre visite aujourd\'hui ! J\'espère que vous êtes satisfaite. À bientôt !' },
    { id: 'promo', label: '🎁 Promotion', text: 'Bonjour {name} ! Profitez de -20% sur votre prochain soin ce mois-ci. Réservez vite !' }
  ];

  // Actions rapides en haut
  const quickActions = [
    { icon: Users, label: 'Rappels du jour', count: 8, color: 'bg-blue-500' },
    { icon: Calendar, label: 'RDV demain', count: 5, color: 'bg-green-500' },
    { icon: Sparkles, label: 'Anniversaires', count: 2, color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'Nouveaux clients', count: 3, color: 'bg-orange-500' }
  ];

  const sendMessage = async () => {
    if (!message.trim() || !selectedClient) return;
    
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
        // Message envoyé avec succès
        console.log('✅ Message envoyé à', selectedClient.name);
        setMessage('');
        setQuickReplyActive('');
        
        // Afficher une notification de succès (optionnel)
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } else {
        console.error('Erreur envoi message');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendQuickMessage = (template: any) => {
    if (!selectedClient) return;
    
    const personalizedMessage = template.text
      .replace('{name}', selectedClient.name.split(' ')[0])
      .replace('{time}', selectedClient.nextRdv?.split(' ')[1] || '14h30');
    
    setMessage(personalizedMessage);
    setQuickReplyActive(template.id);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header simplifié */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WhatsApp Pro</h1>
              <p className="text-xs text-gray-500">Messagerie instantanée clients</p>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="flex gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className={`p-1.5 ${action.color} rounded`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{action.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Liste des clients (gauche) */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Barre de recherche */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : (
              (clients.length > 0 ? clients : defaultClients)
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b ${
                  selectedClient?.id === client.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{client.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                      <span className="text-xs text-gray-500">{client.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">RDV: {client.nextRdv}</span>
                    </div>
                  </div>
                  {client.unread > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {client.unread}
                    </span>
                  )}
                </div>
              </div>
            )))}
          </div>

          {/* Bouton nouveau message */}
          <div className="p-4 border-t">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Plus className="w-5 h-5" />
              Nouveau message
            </button>
          </div>
        </div>

        {/* Zone de conversation (droite) */}
        {selectedClient ? (
          <div className="flex-1 flex flex-col">
            {/* Header de la conversation */}
            <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedClient.avatar}</div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedClient.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedClient.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Prochain RDV: {selectedClient.nextRdv}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Voir le profil
              </button>
            </div>

            {/* Messages rapides */}
            <div className="bg-gray-50 px-6 py-3 border-b">
              <p className="text-xs text-gray-500 mb-2">Messages rapides :</p>
              <div className="flex gap-2 flex-wrap">
                {quickMessages.map((qm) => (
                  <button
                    key={qm.id}
                    onClick={() => sendQuickMessage(qm)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      quickReplyActive === qm.id
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {qm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="flex flex-col gap-4">
                {/* Messages simulés */}
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg max-w-sm shadow-sm">
                    <p className="text-sm">Bonjour, j\'ai RDV demain à 14h30, c\'est bien ça ?</p>
                    <span className="text-xs text-gray-400 mt-1 block">10:28</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-green-500 text-white p-3 rounded-lg max-w-sm">
                    <p className="text-sm">Oui parfait ! Je vous confirme votre RDV demain à 14h30. À demain !</p>
                    <span className="text-xs text-green-100 mt-1 block">10:30</span>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg max-w-sm shadow-sm">
                    <p className="text-sm">Merci pour le rappel !</p>
                    <span className="text-xs text-gray-400 mt-1 block">10:30</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="bg-white border-t px-6 py-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Sélectionnez une conversation</h3>
              <p className="text-sm text-gray-400 mt-2">Choisissez un client pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}