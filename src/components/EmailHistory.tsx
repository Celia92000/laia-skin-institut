'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Inbox, Clock, CheckCircle, XCircle, Search, Filter, Calendar, Eye, RefreshCw } from 'lucide-react';

interface EmailRecord {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  template?: string;
  status: string;
  direction: string;
  campaignId?: string;
  campaign?: {
    name: string;
  };
  createdAt: string;
  openedAt?: string;
  clickedAt?: string;
}

export default function EmailHistory() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  const fetchEmailHistory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        // Données de démonstration si pas de token
        setEmails([
          {
            id: '1',
            from: 'contact@laia.skininstitut.fr',
            to: 'celia.ivorra95@hotmail.fr',
            subject: '✅ Confirmation de votre réservation',
            content: 'Bonjour Célia,\n\nVotre réservation pour le 15/09/2025 à 14h00 est confirmée.\n\nÀ très bientôt,\nLaïa',
            status: 'sent',
            direction: 'outgoing',
            template: 'template_myu4emv',
            createdAt: new Date().toISOString(),
            openedAt: new Date().toISOString()
          },
          {
            id: '2',
            from: 'contact@laia.skininstitut.fr',
            to: 'marie.dupont@email.com',
            subject: '🌟 Votre avis compte pour nous',
            content: 'Bonjour Marie,\n\nNous espérons que vous avez apprécié votre soin.\n\nPouvez-vous prendre 2 minutes pour nous laisser un avis ?\n\nMerci,\nLaïa',
            status: 'sent',
            direction: 'outgoing',
            template: 'template_36zodeb',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            from: 'marie.dupont@email.com',
            to: 'contact@laia.skininstitut.fr',
            subject: 'Question sur les soins',
            content: 'Bonjour,\n\nJe voudrais savoir si le soin HydraFacial convient aux peaux sensibles ?\n\nMerci',
            status: 'received',
            direction: 'incoming',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/email-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    // Filtre par direction
    if (filter === 'sent' && email.direction !== 'outgoing') return false;
    if (filter === 'received' && email.direction !== 'incoming') return false;

    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!email.to.toLowerCase().includes(search) &&
          !email.from.toLowerCase().includes(search) &&
          !email.subject.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Filtre par date
    if (dateFilter) {
      const emailDate = new Date(email.createdAt).toISOString().split('T')[0];
      if (emailDate !== dateFilter) return false;
    }

    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else if (hours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" />
            Historique des Emails
          </h3>
          <button
            onClick={fetchEmailHistory}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Filtre par type */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                filter === 'sent'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className="w-4 h-4" />
              Envoyés
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                filter === 'received'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Reçus
            </button>
          </div>

          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email ou sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtre par date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des emails */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Aucun email trouvé</p>
            </div>
          ) : (
            filteredEmails.map(email => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                {/* Direction Icon */}
                <div className="flex-shrink-0">
                  {email.direction === 'outgoing' ? (
                    <Send className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Inbox className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {/* Email Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {email.direction === 'outgoing' ? email.to : email.from}
                    </span>
                    {email.campaign && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {email.campaign.name}
                      </span>
                    )}
                    {email.template && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Template
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate">{email.subject}</p>
                  <p className="text-sm text-gray-500 truncate">{email.content}</p>
                </div>

                {/* Status and Date */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {getStatusIcon(email.status)}
                  {email.openedAt && (
                    <span title="Email ouvert">
                      <Eye className="w-4 h-4 text-green-500" />
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatDate(email.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de détail */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Détails de l'email</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">De</label>
                  <p className="font-medium text-gray-900">{selectedEmail.from}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">À</label>
                  <p className="font-medium text-gray-900">{selectedEmail.to}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Sujet</label>
                  <p className="font-medium text-gray-900">{selectedEmail.subject}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4 mt-1">
                    <p className="whitespace-pre-wrap text-gray-700">{selectedEmail.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <label className="text-gray-500">Statut</label>
                    <p className="font-medium flex items-center gap-1">
                      {getStatusIcon(selectedEmail.status)}
                      {selectedEmail.status === 'sent' ? 'Envoyé' :
                       selectedEmail.status === 'failed' ? 'Échec' :
                       selectedEmail.status === 'pending' ? 'En attente' : selectedEmail.status}
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-500">Date</label>
                    <p className="font-medium">
                      {new Date(selectedEmail.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  {selectedEmail.openedAt && (
                    <div>
                      <label className="text-gray-500">Ouvert le</label>
                      <p className="font-medium">
                        {new Date(selectedEmail.openedAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}