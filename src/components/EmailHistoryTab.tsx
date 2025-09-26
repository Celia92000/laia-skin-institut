'use client';

import { useState, useEffect } from 'react';
import { Calendar, Mail, Send, AlertCircle, CheckCircle, Clock, Reply, Eye, Search } from 'lucide-react';

interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  type: string;
  status: string;
  resendId?: string;
  error?: string;
  userId?: string;
  reservationId?: string;
  metadata?: any;
  createdAt: string;
}

export default function EmailHistoryTab() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/admin/emails?${params.toString()}`);
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Erreur chargement emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (email: Email) => {
    setSelectedEmail(email);
    setReplyTo(email.to);
    setReplySubject(`Re: ${email.subject}`);
    setReplyContent('');
    setShowReplyModal(true);
  };

  const sendReply = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/admin/emails/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: selectedEmail?.id,
          replyContent,
          to: replyTo,
          subject: replySubject
        })
      });

      if (response.ok) {
        alert('Email envoyé avec succès !');
        setShowReplyModal(false);
        loadEmails();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      confirmation: 'Confirmation',
      reminder: 'Rappel',
      reset: 'Réinitialisation',
      welcome: 'Bienvenue',
      notification: 'Notification',
      reply: 'Réponse'
    };
    return types[type] || type;
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchTerm === '' || 
      email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || email.type === filterType;
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email ou sujet..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="confirmation">Confirmation</option>
              <option value="reminder">Rappel</option>
              <option value="reset">Réinitialisation</option>
              <option value="welcome">Bienvenue</option>
              <option value="notification">Notification</option>
              <option value="reply">Réponse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="sent">Envoyé</option>
              <option value="failed">Échoué</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadEmails}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des emails */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(email.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(email.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{email.to}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">{email.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getTypeLabel(email.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Voir détails"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReply(email)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Répondre"
                      >
                        <Reply className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Aucun email trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails email */}
      {selectedEmail && !showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Détails de l'email</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">De:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmail.from}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">À:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmail.to}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Sujet:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmail.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Date:</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedEmail.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                
                {selectedEmail.error && (
                  <div className="bg-red-50 p-3 rounded">
                    <label className="text-sm font-medium text-red-700">Erreur:</label>
                    <p className="mt-1 text-sm text-red-600">{selectedEmail.error}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Contenu:</label>
                  <div 
                    className="mt-2 p-4 bg-gray-50 rounded-lg text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Répondre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal répondre */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Répondre à l'email</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">À:</label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet:</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Votre message..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={sending}
                >
                  Annuler
                </button>
                <button
                  onClick={sendReply}
                  disabled={sending || !replyContent.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
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