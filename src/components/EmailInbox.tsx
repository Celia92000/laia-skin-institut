'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, Mail, Send, Archive, Trash2, Star, 
  Reply, Forward, Search, Filter, RefreshCw,
  Paperclip, Clock, Check, CheckCheck, ExternalLink,
  User, Calendar, Tag, MoreVertical, ChevronLeft,
  Eye, EyeOff, Globe, Lock
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  attachments?: string[];
  labels?: string[];
}

export default function EmailInbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred'>('all');
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<Email | null>(null);
  const [viewMode, setViewMode] = useState<'demo' | 'webmail'>('webmail');
  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // Données de démonstration (en production, ça viendrait de l'API)
  useEffect(() => {
    // Simuler le chargement des emails
    setEmails([
      {
        id: '1',
        from: 'Marie Dupont',
        fromEmail: 'marie.dupont@email.com',
        to: 'contact@laia.skininstitut.fr',
        subject: 'Question sur le soin Hydro\'Naissance',
        body: `Bonjour Laïa,

J'aimerais avoir plus d'informations sur le soin Hydro'Naissance. 
Est-ce adapté pour les peaux sensibles ? 

Merci d'avance pour votre réponse.

Cordialement,
Marie`,
        date: new Date().toISOString(),
        read: false,
        starred: true,
        attachments: []
      },
      {
        id: '2',
        from: 'Sophie Martin',
        fromEmail: 'sophie.martin@email.com',
        to: 'contact@laia.skininstitut.fr',
        subject: 'Re: Confirmation de rendez-vous',
        body: `Merci pour la confirmation !

J'ai hâte de découvrir votre institut.

À demain,
Sophie`,
        date: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        starred: false,
        attachments: []
      },
      {
        id: '3',
        from: 'Julie Bernard',
        fromEmail: 'julie.bernard@email.com',
        to: 'contact@laia.skininstitut.fr',
        subject: 'Demande de tarifs forfaits',
        body: `Bonjour,

Pourriez-vous m'envoyer vos tarifs pour les forfaits de 4 séances ?

Je suis particulièrement intéressée par le soin Renaissance.

Merci,
Julie`,
        date: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        starred: false,
        attachments: []
      }
    ]);
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'unread' && !email.read) ||
      (filterType === 'starred' && email.starred);
    
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  const handleToggleStar = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  const handleDelete = (emailId: string) => {
    if (confirm('Supprimer cet email ?')) {
      setEmails(emails.filter(email => email.id !== emailId));
      setSelectedEmail(null);
    }
  };

  const handleReply = (email: Email) => {
    setReplyTo(email);
    setNewEmail({
      to: email.fromEmail,
      subject: `Re: ${email.subject}`,
      body: `\n\n---\nLe ${new Date(email.date).toLocaleDateString('fr-FR')}, ${email.from} a écrit :\n${email.body}`
    });
    setComposing(true);
  };

  const handleSendEmail = async () => {
    // Ici on enverrait via EmailJS
    alert(`Email envoyé à ${newEmail.to}`);
    setComposing(false);
    setReplyTo(null);
    setNewEmail({ to: '', subject: '', body: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Si mode webmail, afficher directement le webmail Gandi
  if (viewMode === 'webmail') {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        {/* Header avec boutons */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Webmail Gandi</h3>
                <p className="text-sm text-gray-600">contact@laia.skininstitut.fr</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('demo')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                Vue démo
              </button>
              <a
                href="https://webmail.gandi.net"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        </div>
        
        {/* Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Connexion sécurisée requise
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Pour accéder à votre boîte mail, connectez-vous avec :
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Email : <strong>contact@laia.skininstitut.fr</strong></li>
                <li>• Mot de passe : <strong>Bubule11@!!</strong></li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                Pour des raisons de sécurité, le webmail s'ouvre dans une fenêtre séparée.
              </p>
            </div>
          </div>
        </div>

        {/* Iframe Webmail */}
        <div className="p-4">
          <div className="bg-gray-100 rounded-lg p-8 text-center" style={{ minHeight: '500px' }}>
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Accédez à votre boîte mail complète
            </h3>
            <p className="text-gray-600 mb-6">
              Cliquez sur le bouton ci-dessous pour ouvrir votre webmail Gandi
            </p>
            <a
              href="https://webmail.gandi.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Accéder au Webmail Gandi
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4">
                <Inbox className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Lire vos emails</p>
                <p className="text-xs text-gray-500">Consultez tous vos messages</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <Reply className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Répondre</p>
                <p className="text-xs text-gray-500">Répondez directement</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <Send className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Envoyer</p>
                <p className="text-xs text-gray-500">Composez de nouveaux emails</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode démo (interface simulée)
  return (
    <div className="bg-white rounded-xl shadow-sm h-[700px] flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-500" />
              Boîte de réception (Démo)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('webmail')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Globe className="w-4 h-4" />
                Webmail réel
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1.5 px-3 rounded text-sm ${
                filterType === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({emails.length})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`flex-1 py-1.5 px-3 rounded text-sm ${
                filterType === 'unread' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Non lus ({emails.filter(e => !e.read).length})
            </button>
            <button
              onClick={() => setFilterType('starred')}
              className={`flex-1 py-1.5 px-3 rounded text-sm ${
                filterType === 'starred' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⭐ ({emails.filter(e => e.starred).length})
            </button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(email => (
            <div
              key={email.id}
              onClick={() => {
                setSelectedEmail(email);
                handleMarkAsRead(email.id);
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedEmail?.id === email.id ? 'bg-blue-50' : ''
              } ${!email.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(email.id);
                    }}
                    className="hover:bg-gray-200 rounded p-1"
                  >
                    <Star className={`w-4 h-4 ${
                      email.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                    }`} />
                  </button>
                  <span className={`text-sm ${!email.read ? 'font-semibold' : ''}`}>
                    {email.from}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(email.date)}</span>
              </div>
              <p className={`text-sm mb-1 ${!email.read ? 'font-semibold' : ''}`}>
                {email.subject}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {email.body.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 flex flex-col">
        {composing ? (
          // Compose Email
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {replyTo ? 'Répondre' : 'Nouveau message'}
              </h3>
              <button
                onClick={() => {
                  setComposing(false);
                  setReplyTo(null);
                  setNewEmail({ to: '', subject: '', body: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">À</label>
                  <input
                    type="email"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="destinataire@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <input
                    type="text"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Sujet de l'email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={newEmail.body}
                    onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={12}
                    placeholder="Écrivez votre message..."
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSendEmail}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
                <button
                  onClick={() => {
                    setComposing(false);
                    setReplyTo(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        ) : selectedEmail ? (
          // View Email
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Répondre"
                >
                  <Reply className="w-4 h-4" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Transférer"
                >
                  <Forward className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedEmail.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-lg">{selectedEmail.from}</p>
                    <p className="text-sm text-gray-600">{selectedEmail.fromEmail}</p>
                    <p className="text-sm text-gray-500">
                      À: {selectedEmail.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(selectedEmail.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedEmail.date).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800">
                    {selectedEmail.body}
                  </pre>
                </div>
              </div>
              
              {/* Quick Reply */}
              <div className="border-t pt-4">
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center gap-2 text-gray-700"
                >
                  <Reply className="w-4 h-4" />
                  Cliquez pour répondre...
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez un email pour le lire</p>
              <button
                onClick={() => setComposing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Nouveau message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}