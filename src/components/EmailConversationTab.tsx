'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Search, Inbox, Clock, CheckCircle, AlertCircle, Reply, User, Calendar } from 'lucide-react';

interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  content: string;
  template?: string;
  status: string;
  direction?: string;
  errorMessage?: string;
  userId?: string;
  campaignId?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: Email;
  emails: Email[];
  unread: boolean;
}

export default function EmailConversationTab() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'inbox' | 'sent'>('all');
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', content: '' });

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    // Grouper les emails en conversations
    if (emails.length > 0) {
      const convMap = new Map<string, Conversation>();
      
      emails.forEach(email => {
        // Normaliser les adresses email pour identifier le client
        const institutEmails = ['contact@laiaskininstitut.fr', 'contact@laia.skininstitut.fr', 'système@laiaskininstitut.fr'];
        const clientEmail = institutEmails.includes(email.from.toLowerCase()) ? email.to : email.from;
        
        // Créer une clé basée uniquement sur l'email du client
        const key = clientEmail.toLowerCase();
        
        if (!convMap.has(key)) {
          // Première conversation avec ce client
          convMap.set(key, {
            id: key,
            subject: clientEmail.split('@')[0].replace('.', ' ').replace('_', ' '),
            participants: [clientEmail],
            lastMessage: email,
            emails: [email],
            unread: false
          });
        } else {
          // Ajouter à la conversation existante
          const conv = convMap.get(key)!;
          conv.emails.push(email);
          // Garder le message le plus récent
          if (new Date(email.createdAt) > new Date(conv.lastMessage.createdAt)) {
            conv.lastMessage = email;
            // Mettre à jour le sujet avec le dernier sujet si différent
            conv.subject = `Conversation avec ${clientEmail}`;
          }
        }
      });
      
      // Trier les emails dans chaque conversation par date
      convMap.forEach(conv => {
        conv.emails.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      
      // Convertir en array et trier par date du dernier message
      const convArray = Array.from(convMap.values());
      convArray.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
      
      setConversations(convArray);
    }
  }, [emails]);

  const loadEmails = async () => {
    try {
      const response = await fetch('/api/admin/emails');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setEmails(data);
      } else {
        console.error('Format de données inattendu:', data);
        setEmails([]);
      }
    } catch (error) {
      console.error('Erreur chargement emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) return;

    setSending(true);
    try {
      const lastEmail = selectedConversation.lastMessage;
      const replyTo = lastEmail.direction === 'incoming' ? lastEmail.from : lastEmail.to;

      const response = await fetch('/api/admin/emails/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyContent,
          to: replyTo,
          subject: `Re: ${selectedConversation.subject}`
        })
      });

      if (response.ok) {
        setReplyContent('');
        // Sauvegarder l'ID de la conversation actuelle
        const currentConvId = selectedConversation.id;
        await loadEmails();
        // Forcer la mise à jour après un court délai pour laisser le temps aux conversations de se reconstruire
        setTimeout(() => {
          const updatedConv = conversations.find(c => c.id === currentConvId);
          if (updatedConv) {
            setSelectedConversation(updatedConv);
          }
        }, 100);
      } else {
        alert('Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const sendNewEmail = async () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.content) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/admin/emails/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: newEmail.to,
          subject: newEmail.subject,
          replyContent: newEmail.content
        })
      });

      if (response.ok) {
        setNewEmail({ to: '', subject: '', content: '' });
        setShowCompose(false);
        await loadEmails();
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || 
      (filter === 'inbox' && conv.lastMessage.direction === 'incoming') ||
      (filter === 'sent' && conv.lastMessage.direction === 'outgoing');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* Sidebar - Liste des conversations */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header avec recherche */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={() => setShowCompose(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Nouveau
            </button>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 px-2 text-xs rounded ${filter === 'all' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('inbox')}
              className={`flex-1 py-1 px-2 text-xs rounded ${filter === 'inbox' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Reçus
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`flex-1 py-1 px-2 text-xs rounded ${filter === 'sent' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Envoyés
            </button>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conv.id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conv.participants.find(p => p !== 'contact@laiaskininstitut.fr') || conv.participants[0]}
                    </p>
                    <p className="text-sm text-gray-700 font-medium truncate">{conv.subject}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatDate(conv.lastMessage.createdAt)}</span>
              </div>
              <p className="text-xs text-gray-600 truncate pl-10">
                {conv.lastMessage.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun message</p>
            </div>
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header de la conversation */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedConversation.subject}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.participants.find(p => p !== 'contact@laiaskininstitut.fr') || selectedConversation.participants[0]}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedConversation.emails.length} message{selectedConversation.emails.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {selectedConversation.emails.map((email, index) => {
                const isOutgoing = email.direction === 'outgoing' || email.from === 'contact@laiaskininstitut.fr';
                
                return (
                  <div key={email.id} className={`mb-4 ${isOutgoing ? 'flex justify-end' : ''}`}>
                    <div className={`max-w-2xl ${isOutgoing ? 'bg-purple-600 text-white' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
                      <div className={`flex items-center justify-between mb-2 ${isOutgoing ? 'text-purple-100' : 'text-gray-500'} text-xs`}>
                        <span className="font-medium">{isOutgoing ? '✉️ LAIA SKIN Institut' : `📧 ${email.from.split('@')[0]}`}</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(email.status)}
                          <span>{new Date(email.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                      <div 
                        className={`text-sm ${isOutgoing ? 'text-white' : 'text-gray-800'}`}
                        dangerouslySetInnerHTML={{ __html: email.content }}
                      />
                      {email.errorMessage && (
                        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs">
                          Erreur: {email.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone de réponse */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Votre réponse..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={sending}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyContent.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : showCompose ? (
          // Interface de composition d'un nouveau message
          <div className="flex-1 p-6">
            <h3 className="text-lg font-semibold mb-4">Nouveau message</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">À:</label>
                <input
                  type="email"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet:</label>
                <input
                  type="text"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Objet du message"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                <textarea
                  value={newEmail.content}
                  onChange={(e) => setNewEmail({...newEmail, content: e.target.value})}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Votre message..."
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={sendNewEmail}
                  disabled={sending || !newEmail.to || !newEmail.subject || !newEmail.content}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
                <button
                  onClick={() => {
                    setShowCompose(false);
                    setNewEmail({ to: '', subject: '', content: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        ) : (
          // État vide
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Sélectionnez une conversation pour voir les messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}