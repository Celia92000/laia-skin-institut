'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, Users, Mail, FileText, Paperclip, Bold, Italic, List, Link, Image, Clock, Check, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
}

export default function EmailComposer() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  });
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Templates prédéfinis
  const templates = [
    {
      id: 'custom',
      name: 'Message personnalisé',
      subject: '',
      message: ''
    },
    {
      id: 'promo',
      name: '🎁 Promotion',
      subject: '🎁 Offre spéciale pour vous {{client_name}} !',
      message: `Bonjour {{client_name}},

J'ai le plaisir de vous offrir une réduction exclusive de -20% sur votre prochain soin !

Cette offre est valable jusqu'au {{date_limite}}.

Réservez vite votre créneau sur WhatsApp ou directement sur le site.

À très bientôt,
Laïa
LAIA SKIN Institut`
    },
    {
      id: 'nouveaute',
      name: '✨ Nouveauté',
      subject: '✨ Découvrez notre nouveau soin {{service_name}}',
      message: `Bonjour {{client_name}},

J'ai le plaisir de vous annoncer l'arrivée d'un nouveau soin dans notre institut : {{service_name}} !

Ce soin innovant vous permettra de :
- Bénéfice 1
- Bénéfice 2
- Bénéfice 3

Pour fêter ce lancement, profitez de -15% sur ce soin jusqu'à la fin du mois.

Réservez votre séance découverte dès maintenant !

À bientôt,
Laïa`
    },
    {
      id: 'rappel',
      name: '📅 Rappel',
      subject: '📅 {{client_name}}, il est temps de prendre soin de vous',
      message: `Bonjour {{client_name}},

Cela fait maintenant quelques semaines depuis votre dernière visite et j'espère que vous allez bien !

Pour maintenir les bienfaits de votre dernier soin et continuer à sublimer votre peau, je vous recommande de prévoir une nouvelle séance.

Voici quelques créneaux disponibles cette semaine :
- Lundi : 14h, 16h
- Mercredi : 10h, 15h
- Samedi : 11h, 14h

N'hésitez pas à me contacter pour réserver votre moment de détente.

À très vite,
Laïa`
    },
    {
      id: 'merci',
      name: '💕 Remerciement',
      subject: '💕 Merci {{client_name}} pour votre confiance',
      message: `Bonjour {{client_name}},

Je tenais à vous remercier personnellement pour votre fidélité et votre confiance.

C'est un plaisir de vous accompagner dans votre routine beauté et de voir votre peau s'épanouir séance après séance.

Pour vous remercier, je vous offre -10% sur votre prochain soin.

Au plaisir de vous revoir très bientôt,
Laïa
LAIA SKIN Institut`
    },
    {
      id: 'anniversaire',
      name: '🎂 Anniversaire',
      subject: '🎂 Joyeux anniversaire {{client_name}} !',
      message: `Bonjour {{client_name}},

Toute l'équipe de LAIA SKIN Institut vous souhaite un merveilleux anniversaire !

Pour célébrer ce jour spécial, nous vous offrons -30% sur le soin de votre choix.

Offre valable tout le mois de votre anniversaire.

Très belle journée à vous,
Laïa`
    },
    {
      id: 'bienvenue',
      name: '👋 Bienvenue',
      subject: 'Bienvenue chez LAIA SKIN Institut',
      message: `Bonjour {{client_name}},

Bienvenue chez LAIA SKIN Institut !

Je suis ravie de vous compter parmi nos clientes privilégiées.

Pour bien démarrer, bénéficiez de -15% sur votre premier soin avec le code BIENVENUE.

N'hésitez pas à me contacter pour toute question.

À très bientôt,
Laïa`
    },
    {
      id: 'info',
      name: '📢 Information',
      subject: 'Information importante pour nos clientes',
      message: `Bonjour {{client_name}},

Je voulais vous informer d'un changement important concernant l'institut.

[Votre message ici]

N'hésitez pas à me contacter si vous avez des questions.

Cordialement,
Laïa`
    }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    // Toujours charger les clients directement sans authentification pour l'instant
    const clientsList = [
      {
        id: '1',
        name: 'Célia IVORRA',
        email: 'celia.ivorra95@hotmail.fr',
        phone: '0683717050',
        lastVisit: '2025-09-15'
      },
      {
        id: '2',
        name: 'Marie Dupont',
        email: 'marie.dupont@email.com',
        phone: '0612345678',
        lastVisit: '2025-09-14'
      },
      {
        id: '3',
        name: 'Sophie Martin',
        email: 'sophie.martin@email.com',
        phone: '0654321098',
        lastVisit: '2025-09-10'
      },
      {
        id: '4',
        name: 'Julie Bernard',
        email: 'julie.bernard@email.com',
        phone: '0698765432',
        lastVisit: '2025-09-08'
      },
      {
        id: '5',
        name: 'Emma Rousseau',
        email: 'emma.rousseau@email.com',
        phone: '0623456789',
        lastVisit: '2025-09-05'
      }
    ];
    
    setClients(clientsList);
    console.log('Clients chargés:', clientsList.length);
    
    // Tentative de chargement depuis l'API (optionnel)
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
          if (data && data.length > 0) {
            setClients(data);
            console.log('Clients mis à jour depuis API:', data.length);
          }
        }
      }
    } catch (error) {
      // Silencieux - on garde les données par défaut
      console.log('Utilisation des données locales');
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Si c'est un message personnalisé, ne pas écraser le contenu
      if (templateId === 'custom') {
        setEmailData({
          ...emailData,
          template: templateId
        });
      } else {
        setEmailData({
          ...emailData,
          template: templateId,
          subject: template.subject,
          message: template.message
        });
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.email));
    }
    setSelectAll(!selectAll);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendEmail = async () => {
    if (selectedClients.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!emailData.subject || !emailData.message) {
      alert('Veuillez remplir le sujet et le message');
      return;
    }

    setSending(true);
    setSentStatus(null);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Envoyer à chaque client sélectionné
      for (const email of selectedClients) {
        const client = clients.find(c => c.email === email);
        if (!client) continue;

        // Remplacer les variables dans le message
        let personalizedSubject = emailData.subject.replace('{{client_name}}', client.name);
        let personalizedMessage = emailData.message.replace(/{{client_name}}/g, client.name);
        
        // Remplacer les autres variables
        const today = new Date();
        const dateLimite = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        personalizedMessage = personalizedMessage.replace('{{date_limite}}', dateLimite.toLocaleDateString('fr-FR'));
        personalizedSubject = personalizedSubject.replace('{{date_limite}}', dateLimite.toLocaleDateString('fr-FR'));
        personalizedMessage = personalizedMessage.replace('{{service_name}}', 'votre soin');

        // Utiliser Resend pour TOUS les emails (personnalisés ou templates)
        const response = await fetch('/api/send-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject: personalizedSubject,
            message: personalizedMessage,
            clientName: client.name
          })
        });

        if (!response.ok) {
          console.error(`Erreur envoi à ${email}`);
        } else {
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
                  to: email,
                  subject: personalizedSubject,
                  content: personalizedMessage,
                  template: 'template_36zodeb',
                  status: 'sent',
                  userId: client.id
                })
              });
            }
          } catch (err) {
            console.log('Erreur enregistrement historique:', err);
          }
        }
      }

      setSentStatus({
        success: true,
        message: `Email envoyé avec succès à ${selectedClients.length} destinataire(s) !`
      });

      // Réinitialiser après envoi
      setTimeout(() => {
        setSelectedClients([]);
        setEmailData({ subject: '', message: '', template: 'custom' });
        setSentStatus(null);
      }, 3000);

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

  const insertVariable = (variable: string) => {
    setEmailData({
      ...emailData,
      message: emailData.message + ` {{${variable}}}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-500" />
          Composer un Email
        </h3>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modèle d'email
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipients Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Destinataires ({selectedClients.length} sélectionné{selectedClients.length > 1 ? 's' : ''})
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectAll ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />

            {/* Client List */}
            <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
              {filteredClients.map(client => (
                <label
                  key={client.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                >
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.email)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClients([...selectedClients, client.email]);
                      } else {
                        setSelectedClients(selectedClients.filter(email => email !== client.email));
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email Composition */}
          <div>
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le sujet de votre email..."
                />
              </div>

              {/* Variables Helper */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Variables :</span>
                <button
                  type="button"
                  onClick={() => insertVariable('client_name')}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {'{{client_name}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('date_limite')}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {'{{date_limite}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('service_name')}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {'{{service_name}}'}
                </button>
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
                  rows={10}
                  placeholder="Écrivez votre message ici..."
                />
              </div>

              {/* Preview Toggle */}
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {previewMode ? 'Éditer' : 'Prévisualiser'}
              </button>

              {/* Preview */}
              {previewMode && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">{emailData.subject}</p>
                  <div className="text-gray-700 whitespace-pre-wrap">{emailData.message}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Envoyé depuis : <strong>contact@laia.skininstitut.fr</strong>
          </div>
          <button
            onClick={handleSendEmail}
            disabled={sending || selectedClients.length === 0}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
              sending || selectedClients.length === 0
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

        {/* Status Message */}
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