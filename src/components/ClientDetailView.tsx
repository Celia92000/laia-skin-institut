'use client';

import { useState, useEffect } from 'react';
import { User, Mail, MessageSquare, Phone, Calendar, MapPin, Star, Clock, Send, Paperclip, Image, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Message {
  id: string;
  platform: 'email' | 'whatsapp';
  from: string;
  to: string;
  subject?: string;
  content: string;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
  read?: boolean;
  attachments?: string[];
}

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  lastVisit?: Date;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints?: number;
  tags?: string[];
  notes?: string;
  vip?: boolean;
}

interface ClientDetailViewProps {
  clientId: string;
  onClose?: () => void;
}

export default function ClientDetailView({ clientId, onClose }: ClientDetailViewProps) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingVia, setSendingVia] = useState<'email' | 'whatsapp'>('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientInfo, setShowClientInfo] = useState(true);

  useEffect(() => {
    fetchClientDetails();
    fetchMessages();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      }
    } catch (error) {
      console.error('Erreur récupération client:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer les emails
      const emailResponse = await fetch(`/api/admin/emails/conversation?clientEmail=${client?.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Récupérer les messages WhatsApp
      const whatsappResponse = await fetch(`/api/admin/whatsapp/conversation?phone=${client?.phone}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const emails = emailResponse.ok ? await emailResponse.json() : [];
      const whatsappMessages = whatsappResponse.ok ? await whatsappResponse.json() : [];
      
      // Combiner et trier par date
      const allMessages = [
        ...emails.map((e: any) => ({
          ...e,
          platform: 'email' as const,
          timestamp: new Date(e.createdAt)
        })),
        ...whatsappMessages.map((w: any) => ({
          ...w,
          platform: 'whatsapp' as const,
          timestamp: new Date(w.createdAt),
          content: w.body
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setMessages(allMessages);
    } catch (error) {
      console.error('Erreur récupération messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = sendingVia === 'email' 
        ? '/api/admin/emails/send'
        : '/api/admin/whatsapp/send';
      
      const body = sendingVia === 'email'
        ? {
            to: client?.email,
            subject: 'Message de LAIA SKIN Institut',
            content: newMessage
          }
        : {
            to: client?.phone,
            message: newMessage
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesTab = activeTab === 'all' || msg.platform === activeTab;
    const matchesSearch = !searchTerm || 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${date.toLocaleDateString('fr-FR', { weekday: 'long' })} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#fdfbf7] via-white to-[#f8f6f0]">
      {/* Header Client */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#d4b5a0]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 flex items-center justify-center">
              <User className="w-8 h-8 text-[#d4b5a0]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
                {client?.name}
                {client?.vip && (
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full">
                    VIP
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-[#2c3e50]/70">
                {client?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {client.email}
                  </span>
                )}
                {client?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowClientInfo(!showClientInfo)}
            className="p-2 rounded-lg hover:bg-[#d4b5a0]/10 transition-colors"
          >
            {showClientInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Informations client dépliables */}
        {showClientInfo && (
          <div className="mt-4 pt-4 border-t border-[#d4b5a0]/20 grid grid-cols-4 gap-4">
            <div className="bg-[#d4b5a0]/5 rounded-lg p-3">
              <div className="text-xs text-[#2c3e50]/60 mb-1">Dernière visite</div>
              <div className="text-sm font-semibold text-[#2c3e50]">
                {client?.lastVisit ? formatDate(new Date(client.lastVisit)) : 'Jamais'}
              </div>
            </div>
            <div className="bg-[#d4b5a0]/5 rounded-lg p-3">
              <div className="text-xs text-[#2c3e50]/60 mb-1">Total visites</div>
              <div className="text-sm font-semibold text-[#2c3e50]">{client?.totalVisits || 0}</div>
            </div>
            <div className="bg-[#d4b5a0]/5 rounded-lg p-3">
              <div className="text-xs text-[#2c3e50]/60 mb-1">Total dépensé</div>
              <div className="text-sm font-semibold text-[#2c3e50]">{client?.totalSpent || 0} €</div>
            </div>
            <div className="bg-[#d4b5a0]/5 rounded-lg p-3">
              <div className="text-xs text-[#2c3e50]/60 mb-1">Points fidélité</div>
              <div className="text-sm font-semibold text-[#2c3e50]">{client?.loyaltyPoints || 0} pts</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs et Recherche */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#d4b5a0]/20 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white'
                  : 'text-[#2c3e50]/70 hover:bg-[#d4b5a0]/10'
              }`}
            >
              Toutes ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'email'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white'
                  : 'text-[#2c3e50]/70 hover:bg-[#d4b5a0]/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              Emails ({messages.filter(m => m.platform === 'email').length})
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'whatsapp'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white'
                  : 'text-[#2c3e50]/70 hover:bg-[#d4b5a0]/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp ({messages.filter(m => m.platform === 'whatsapp').length})
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2c3e50]/40" />
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]/50"
            />
          </div>
        </div>
      </div>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-[#2c3e50]/40">
              Aucun message trouvé
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.direction === 'outgoing'
                      ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white'
                      : 'bg-white border border-[#d4b5a0]/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.platform === 'email' ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    <span className="text-xs opacity-70">
                      {formatDate(message.timestamp)}
                    </span>
                    {!message.read && message.direction === 'incoming' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  
                  {message.subject && (
                    <div className="font-semibold mb-1">{message.subject}</div>
                  )}
                  
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="flex items-center gap-1 text-xs">
                        <Paperclip className="w-3 h-3" />
                        {message.attachments.length} pièce(s) jointe(s)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-[#d4b5a0]/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSendingVia('email')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sendingVia === 'email'
                  ? 'bg-[#d4b5a0] text-white'
                  : 'bg-[#d4b5a0]/10 text-[#2c3e50]'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </button>
            <button
              onClick={() => setSendingVia('whatsapp')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sendingVia === 'whatsapp'
                  ? 'bg-[#d4b5a0] text-white'
                  : 'bg-[#d4b5a0]/10 text-[#2c3e50]'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1" />
              WhatsApp
            </button>
          </div>
          
          <div className="flex gap-2">
            <button className="p-3 rounded-lg hover:bg-[#d4b5a0]/10 transition-colors">
              <Paperclip className="w-5 h-5 text-[#2c3e50]/60" />
            </button>
            <button className="p-3 rounded-lg hover:bg-[#d4b5a0]/10 transition-colors">
              <Image className="w-5 h-5 text-[#2c3e50]/60" />
            </button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Écrire un ${sendingVia === 'email' ? 'email' : 'message WhatsApp'}...`}
              className="flex-1 p-3 border border-[#d4b5a0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]/50 resize-none"
              rows={3}
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}