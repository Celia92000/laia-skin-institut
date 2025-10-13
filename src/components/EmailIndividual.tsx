'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, Mail, FileText, Bold, Italic, Clock, Check, X, Search } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
}

export default function EmailIndividual() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  });
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [templates, setTemplates] = useState<any[]>([{ id: 'custom', name: 'Message personnalisé', subject: '', message: '' }]);

  useEffect(() => {
    fetchClients();
    fetchTemplates();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const response = await fetch('/api/admin/clients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const response = await fetch('/api/admin/email-templates/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTemplates([
            { id: 'custom', name: 'Message personnalisé', subject: '', message: '' },
            ...data
          ]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Si c'est un message personnalisé, ne pas écraser le contenu existant
      if (templateId === 'custom') {
        setEmailData({
          ...emailData,
          template: templateId
        });
      } else {
        // Pour les autres templates, utiliser le contenu prédéfini
        setEmailData({
          ...emailData,
          template: templateId,
          subject: template.subject,
          message: template.message
        });
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendEmail = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un destinataire');
      return;
    }

    if (!emailData.subject || !emailData.message) {
      alert('Veuillez remplir le sujet et le message');
      return;
    }

    const client = clients.find(c => c.email === selectedClient);
    if (!client) {
      alert('Client non trouvé');
      return;
    }

    setSending(true);
    setSentStatus(null);

    try {
      // Remplacer les variables
      let personalizedSubject = emailData.subject.replace('{{client_name}}', client.name);
      let personalizedMessage = emailData.message.replace(/{{client_name}}/g, client.name);

      // Utiliser Resend pour des emails vraiment personnalisés
      const response = await fetch('/api/send-email/', {  // Ajout du slash final pour éviter la redirection
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: client.email,
          subject: personalizedSubject,
          message: personalizedMessage,
          clientName: client.name
        })
      });

      if (response.ok) {
        setSentStatus({
          success: true,
          message: `Email envoyé avec succès à ${client.name} !`
        });

        // Enregistrer dans l'historique
        try {
          const token = localStorage.getItem('adminToken');
          if (token) {
            await fetch('/api/admin/email-history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                to: client.email,
                subject: personalizedSubject,
                content: personalizedMessage,
                template: 'custom',
                status: 'sent',
                userId: client.id
              })
            });
          }
        } catch (err) {
          console.log('Erreur enregistrement historique:', err);
        }

        // Réinitialiser après 3 secondes
        setTimeout(() => {
          setSelectedClient('');
          setEmailData({ subject: '', message: '', template: 'custom' });
          setSentStatus(null);
        }, 3000);
      } else {
        setSentStatus({
          success: false,
          message: 'Erreur lors de l\'envoi. Veuillez réessayer.'
        });
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      setSentStatus({
        success: false,
        message: 'Erreur lors de l\'envoi. Veuillez réessayer.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-500" />
          Email Individuel
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sélection du destinataire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinataire unique
            </label>

            {/* Recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Liste des clients */}
            <div className="border border-gray-200 rounded-lg h-96 overflow-y-auto">
              {filteredClients.map(client => (
                <label
                  key={client.id}
                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b ${
                    selectedClient === client.email ? 'bg-blue-50' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="client"
                    value={client.email}
                    checked={selectedClient === client.email}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    {client.phone && (
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {selectedClient && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Destinataire sélectionné :</strong><br/>
                  {clients.find(c => c.email === selectedClient)?.name}
                </p>
              </div>
            )}
          </div>

          {/* Composition du message */}
          <div>
            <div className="space-y-4">
              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle
                </label>
                <select
                  value={emailData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sujet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet de l'email..."
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Votre message..."
                />
              </div>

              {/* Variables */}
              <div className="text-xs text-gray-500">
                <strong>Variable disponible :</strong> {'{{client_name}}'} sera remplacé par le nom du client
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'envoi */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Envoyé depuis : <strong>contact@laia.skininstitut.fr</strong>
          </div>
          <button
            onClick={handleSendEmail}
            disabled={sending || !selectedClient}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
              sending || !selectedClient
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
            }`}
          >
            {sending ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer l'email
              </>
            )}
          </button>
        </div>

        {/* Message de statut */}
        {sentStatus && (
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
            sentStatus.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {sentStatus.success ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {sentStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}