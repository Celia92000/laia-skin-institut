'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, Clock, CheckCheck, AlertCircle, RefreshCw, Loader } from 'lucide-react';

interface ClientCommunicationsProps {
  clientId: string;
  clientEmail: string;
  clientPhone?: string;
  clientName: string;
}

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  status: string;
  direction: string;
  createdAt: string;
}

interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  status: string;
  direction: string;
  deliveredAt?: string;
  sentAt: string;
}

export default function ClientCommunications({
  clientId,
  clientEmail,
  clientPhone,
  clientName
}: ClientCommunicationsProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');
  const [emails, setEmails] = useState<Email[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadCommunications();
  }, [clientId, clientEmail]);

  const loadCommunications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Charger les emails
      const emailsResponse = await fetch('/api/admin/emails', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (emailsResponse.ok) {
        const allEmails = await emailsResponse.json();
        // Filtrer les emails du client
        const clientEmails = allEmails.filter((email: Email) =>
          email.from.toLowerCase() === clientEmail.toLowerCase() ||
          email.to.toLowerCase() === clientEmail.toLowerCase()
        );
        setEmails(clientEmails);
      }

      // Charger les messages WhatsApp
      const whatsappResponse = await fetch(`/api/whatsapp/history?userId=${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (whatsappResponse.ok) {
        const data = await whatsappResponse.json();
        setWhatsappMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur chargement communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!replyContent.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/emails/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: clientEmail,
          subject: `Message pour ${clientName}`,
          replyContent
        })
      });

      if (response.ok) {
        setReplyContent('');
        await loadCommunications();
      } else {
        alert('Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const sendWhatsApp = async () => {
    if (!replyContent.trim() || !clientPhone) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: clientPhone,
          message: replyContent,
          clientId,
          clientName
        })
      });

      if (response.ok) {
        setReplyContent('');
        await loadCommunications();
      } else {
        alert('Erreur lors de l\'envoi du message WhatsApp');
      }
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return <CheckCheck className="w-3 h-3 text-green-500" />;
      case 'sent':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-[#d4b5a0]" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-[#d4b5a0] text-[#d4b5a0] font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Emails ({emails.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'whatsapp'
              ? 'border-green-500 text-green-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp ({whatsappMessages.length})
        </button>
        <button
          onClick={loadCommunications}
          className="ml-auto p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4">
        {activeTab === 'email' ? (
          emails.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun email avec ce client</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map(email => {
                const isOutgoing = email.direction === 'outgoing';
                return (
                  <div key={email.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg ${isOutgoing ? 'bg-[#d4b5a0] text-white' : 'bg-white'} rounded-lg p-3 shadow-sm`}>
                      <div className={`flex items-center justify-between mb-1 ${isOutgoing ? 'text-white/80' : 'text-gray-500'} text-xs`}>
                        <span className="font-medium">{isOutgoing ? 'Vous' : clientName}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(email.status)}
                          <span>{new Date(email.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                      <p className={`font-semibold text-sm mb-1 ${isOutgoing ? 'text-white' : 'text-gray-900'}`}>
                        {email.subject}
                      </p>
                      <div
                        className={`text-sm ${isOutgoing ? 'text-white' : 'text-gray-700'}`}
                        dangerouslySetInnerHTML={{ __html: email.content }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          whatsappMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun message WhatsApp avec ce client</p>
              {!clientPhone && (
                <p className="text-xs text-red-500 mt-2">Numéro de téléphone non renseigné</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {whatsappMessages.map(msg => {
                const isOutgoing = msg.direction === 'outgoing';
                return (
                  <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg ${isOutgoing ? 'bg-green-500 text-white' : 'bg-white'} rounded-lg p-3 shadow-sm`}>
                      <div className={`flex items-center justify-between mb-1 ${isOutgoing ? 'text-white/80' : 'text-gray-500'} text-xs`}>
                        <span className="font-medium">{isOutgoing ? 'Vous' : clientName}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(msg.status)}
                          <span>{new Date(msg.sentAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                      <p className={`text-sm whitespace-pre-wrap ${isOutgoing ? 'text-white' : 'text-gray-700'}`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Zone de réponse */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                activeTab === 'email' ? sendEmail() : sendWhatsApp();
              }
            }}
            placeholder={activeTab === 'email' ? 'Votre message...' : (clientPhone ? 'Votre message WhatsApp...' : 'Numéro de téléphone manquant')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            disabled={sending || (activeTab === 'whatsapp' && !clientPhone)}
          />
          <button
            onClick={activeTab === 'email' ? sendEmail : sendWhatsApp}
            disabled={sending || !replyContent.trim() || (activeTab === 'whatsapp' && !clientPhone)}
            className={`px-4 py-2 ${
              activeTab === 'email' ? 'bg-[#d4b5a0] hover:bg-[#c9a084]' : 'bg-green-500 hover:bg-green-600'
            } text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2`}
          >
            {sending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
