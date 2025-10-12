'use client';

import React, { useState, useEffect } from 'react';

// Types
interface Template {
  id: string;
  category: string;
  title: string;
  emoji: string;
  message: string;
  variables: string[];
}

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit?: string;
  preferredService?: string;
  email?: string;
}

interface VariableValues {
  [key: string]: string;
}

interface CommunicationHistory {
  id: string;
  type: 'whatsapp' | 'email';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateUsed?: string;
}

// Mock data pour les templates
const mockTemplates: Template[] = [
  // RDV Templates
  {
    id: 'rdv-1',
    category: 'RDV',
    title: 'Confirmation de rendez-vous',
    emoji: '📅',
    message: 'Bonjour {{nom}}, votre rendez-vous pour {{service}} est confirmé le {{date}} à {{heure}} chez LAIA SKIN Institut. À bientôt ! ✨',
    variables: ['nom', 'service', 'date', 'heure']
  },
  {
    id: 'rdv-2',
    category: 'RDV',
    title: 'Rappel de rendez-vous',
    emoji: '⏰',
    message: 'Rappel : Votre rdv {{service}} est demain {{date}} à {{heure}}. Nous avons hâte de vous accueillir chez LAIA SKIN ! 💫',
    variables: ['service', 'date', 'heure']
  },
  {
    id: 'rdv-3',
    category: 'RDV',
    title: 'Demande de confirmation',
    emoji: '❓',
    message: 'Bonjour {{nom}}, pouvez-vous confirmer votre présence pour votre rdv {{service}} prévu le {{date}} à {{heure}} ? Merci 🌟',
    variables: ['nom', 'service', 'date', 'heure']
  },
  // Promotions Templates
  {
    id: 'promo-1',
    category: 'Promotions',
    title: 'Offre spéciale soin',
    emoji: '🎁',
    message: 'Offre exclusive ! {{reduction}}% de réduction sur votre soin {{service}} jusqu\'au {{date_fin}}. Réservez vite votre créneau ! 💆‍♀️✨',
    variables: ['reduction', 'service', 'date_fin']
  },
  {
    id: 'promo-2',
    category: 'Promotions',
    title: 'Nouveau soin disponible',
    emoji: '🌟',
    message: 'Nouveau chez LAIA SKIN ! Découvrez notre soin {{nouveau_service}} à partir de {{prix}}€. Prenez rdv dès maintenant ! 💫',
    variables: ['nouveau_service', 'prix']
  },
  {
    id: 'promo-3',
    category: 'Promotions',
    title: 'Week-end détente',
    emoji: '🧘‍♀️',
    message: 'Week-end bien-être ! Offrez-vous un moment de détente avec {{reduction}}% sur tous nos soins le {{date}}. Réservez votre parenthèse beauté ! 🌸',
    variables: ['reduction', 'date']
  },
  // Fidélité Templates
  {
    id: 'fidelite-1',
    category: 'Fidélité',
    title: 'Points fidélité',
    emoji: '⭐',
    message: 'Félicitations {{nom}} ! Vous avez cumulé {{points}} points fidélité. Profitez de votre réduction sur votre prochain soin ! 🎉',
    variables: ['nom', 'points']
  },
  {
    id: 'fidelite-2',
    category: 'Fidélité',
    title: 'Anniversaire client',
    emoji: '🎂',
    message: 'Joyeux anniversaire {{nom}} ! 🎉 Offrez-vous un soin d\'exception avec {{reduction}}% de réduction valable jusqu\'au {{date_fin}} ! 🎁',
    variables: ['nom', 'reduction', 'date_fin']
  },
  // Suivi Templates
  {
    id: 'suivi-1',
    category: 'Suivi',
    title: 'Satisfaction après soin',
    emoji: '💕',
    message: 'Bonjour {{nom}}, comment avez-vous trouvé votre soin {{service}} ? Votre avis nous intéresse pour vous offrir le meilleur ! ✨',
    variables: ['nom', 'service']
  },
  {
    id: 'suivi-2',
    category: 'Suivi',
    title: 'Conseil personnalisé',
    emoji: '💡',
    message: 'Bonjour {{nom}}, pour optimiser les résultats de votre soin {{service}}, nous vous conseillons {{conseil}}. Belle journée ! 🌟',
    variables: ['nom', 'service', 'conseil']
  }
];

const categories = ['Tous', 'RDV', 'Promotions', 'Fidélité', 'Suivi'];

const WhatsAppSimple: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les clients au démarrage
  useEffect(() => {
    loadClients();
  }, []);

  // Filter templates based on category and search
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'Tous' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Charger les clients depuis l'API
  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/crm/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const clientsWithPhone = data.filter((c: any) => c.phone && c.phone !== '');
        setClients(clientsWithPhone);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  // Charger l'historique de communication pour un client
  const loadCommunicationHistory = async (clientId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${clientId}/communications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommunicationHistory(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      // Utiliser des données mockées en cas d'erreur
      setCommunicationHistory([
        {
          id: '1',
          type: 'whatsapp',
          content: 'Bonjour Marie, votre rendez-vous pour Soin visage anti-âge est confirmé le 25/03/2024 à 14:00 chez LAIA SKIN Institut.',
          timestamp: new Date('2024-03-24T10:00:00'),
          status: 'delivered',
          templateUsed: 'Confirmation de rendez-vous'
        },
        {
          id: '2',
          type: 'email',
          content: 'Merci pour votre visite ! Nous espérons que vous avez apprécié votre soin.',
          timestamp: new Date('2024-03-25T16:30:00'),
          status: 'read',
          templateUsed: 'Suivi après soin'
        }
      ]);
    }
  };

  // Initialize variable values when template is selected
  useEffect(() => {
    if (selectedTemplate && selectedClient) {
      const initialValues: VariableValues = {};
      selectedTemplate.variables.forEach(variable => {
        switch (variable) {
          case 'nom':
            initialValues[variable] = selectedClient.name;
            break;
          case 'service':
            initialValues[variable] = selectedClient.preferredService || 'votre soin';
            break;
          case 'date':
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            initialValues[variable] = tomorrow.toLocaleDateString('fr-FR');
            break;
          case 'heure':
            initialValues[variable] = '14:00';
            break;
          case 'reduction':
            initialValues[variable] = '20';
            break;
          case 'prix':
            initialValues[variable] = '85';
            break;
          case 'points':
            initialValues[variable] = '150';
            break;
          default:
            initialValues[variable] = '';
        }
      });
      setVariableValues(initialValues);
    }
  }, [selectedTemplate, selectedClient]);

  // Generate preview message
  const generatePreview = (): string => {
    if (!selectedTemplate) return '';
    let preview = selectedTemplate.message;
    Object.entries(variableValues).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return preview;
  };

  // Handle step transition with animation
  const goToStep = (step: 1 | 2 | 3) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsAnimating(false);
    }, 150);
  };

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    goToStep(2);
  };

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    loadCommunicationHistory(client.id);
    goToStep(3);
  };

  // Format phone number for WhatsApp
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('33')) {
      cleaned = '33' + cleaned;
    }
    return '+' + cleaned;  // Ajouter le + pour le format international
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedClient || !selectedTemplate) return;

    setLoading(true);
    const message = generatePreview();

    try {
      const token = localStorage.getItem('token');
      const formattedPhone = formatPhoneNumber(selectedClient.phone);
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
          clientName: selectedClient.name,
          clientId: selectedClient.id,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.title
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Enregistrer dans l'historique
        const newHistory: CommunicationHistory = {
          id: Date.now().toString(),
          type: 'whatsapp',
          content: message,
          timestamp: new Date(),
          status: 'sent',
          templateUsed: selectedTemplate.title
        };
        setCommunicationHistory(prev => [newHistory, ...prev]);
        
        alert('Message envoyé avec succès !');
        resetFlow();
      } else {
        alert(`Erreur lors de l'envoi: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur de connexion lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  // Reset to start
  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedTemplate(null);
    setSelectedClient(null);
    setVariableValues({});
    setSearchTerm('');
    setSelectedCategory('Tous');
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            📱 WhatsApp LAIA SKIN
          </h1>
          <p className="text-stone-600">
            Envoyez des messages personnalisés à vos clients avec templates prédéfinis
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] shadow-lg'
                      : 'bg-stone-300'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all duration-300 ${
                      currentStep > step ? 'bg-[#c9a084]' : 'bg-stone-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-16 text-sm text-stone-600">
            <span className={currentStep === 1 ? 'font-semibold text-[#c9a084]' : ''}>
              📝 Sélectionner un modèle
            </span>
            <span className={currentStep === 2 ? 'font-semibold text-[#c9a084]' : ''}>
              👤 Choisir un client
            </span>
            <span className={currentStep === 3 ? 'font-semibold text-[#c9a084]' : ''}>
              ✨ Personnaliser et envoyer
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="🔍 Rechercher un modèle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#c9a084] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-md'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#d4b5a0]"
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">{template.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-stone-800">{template.title}</h3>
                          <span className="text-xs bg-[#d4b5a0] text-white px-2 py-1 rounded-full">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-stone-600 line-clamp-3">
                        {template.message.replace(/{{.*?}}/g, '...')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Selected Template Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-800">
                    {selectedTemplate?.emoji} {selectedTemplate?.title}
                  </h2>
                  <button
                    onClick={() => goToStep(1)}
                    className="text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    ← Retour
                  </button>
                </div>
                <p className="text-stone-600 bg-stone-50 p-4 rounded-xl">
                  {selectedTemplate?.message}
                </p>
              </div>

              {/* Client Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">
                  👤 Sélectionner un client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#d4b5a0]"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-stone-800">{client.name}</h4>
                          <p className="text-sm text-stone-600">{client.phone}</p>
                        </div>
                      </div>
                      {client.lastVisit && (
                        <p className="text-xs text-stone-500 mb-2">
                          📅 Dernière visite: {client.lastVisit}
                        </p>
                      )}
                      {client.preferredService && (
                        <p className="text-xs text-stone-500">
                          💆‍♀️ Service préféré: {client.preferredService}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customization Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-800">
                      ✨ Personnaliser le message
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-stone-500 hover:text-stone-700 transition-colors text-sm bg-stone-100 px-3 py-1 rounded-lg"
                      >
                        📊 Historique
                      </button>
                      <button
                        onClick={() => goToStep(2)}
                        className="text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        ← Retour
                      </button>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-stone-800 mb-2">👤 Client sélectionné</h3>
                    <p className="text-stone-700">{selectedClient?.name}</p>
                    <p className="text-sm text-stone-600">{selectedClient?.phone}</p>
                  </div>

                  {/* Communication History */}
                  {showHistory && (
                    <div className="bg-stone-50 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
                      <h3 className="font-semibold text-stone-800 mb-3">📊 Historique des communications</h3>
                      {communicationHistory.length === 0 ? (
                        <p className="text-stone-500 text-sm">Aucun historique disponible</p>
                      ) : (
                        <div className="space-y-3">
                          {communicationHistory.map((comm) => (
                            <div key={comm.id} className="bg-white rounded-lg p-3 border-l-4 border-[#d4b5a0]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#c9a084]">
                                  {comm.type === 'whatsapp' ? '📱 WhatsApp' : '📧 Email'}
                                </span>
                                <span className="text-xs text-stone-500">
                                  {comm.timestamp.toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-sm text-stone-700 mb-1">{comm.content}</p>
                              {comm.templateUsed && (
                                <p className="text-xs text-stone-500">Template: {comm.templateUsed}</p>
                              )}
                              <div className="flex items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  comm.status === 'sent' ? 'bg-green-100 text-green-800' :
                                  comm.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                  comm.status === 'read' ? 'bg-purple-100 text-purple-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {comm.status === 'sent' ? 'Envoyé' :
                                   comm.status === 'delivered' ? 'Livré' :
                                   comm.status === 'read' ? 'Lu' : 'Échec'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Variable Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-stone-800">🔧 Variables à personnaliser</h3>
                    {selectedTemplate?.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium text-stone-700 mb-2 capitalize">
                          {variable === 'nom' && '👤 Nom'}
                          {variable === 'service' && '💆‍♀️ Service'}
                          {variable === 'date' && '📅 Date'}
                          {variable === 'heure' && '⏰ Heure'}
                          {variable === 'reduction' && '🎁 Réduction (%)'}
                          {variable === 'prix' && '💰 Prix (€)'}
                          {variable === 'points' && '⭐ Points'}
                          {variable === 'date_fin' && '📅 Date de fin'}
                          {variable === 'nouveau_service' && '🌟 Nouveau service'}
                          {variable === 'conseil' && '💡 Conseil'}
                          {!['nom', 'service', 'date', 'heure', 'reduction', 'prix', 'points', 'date_fin', 'nouveau_service', 'conseil'].includes(variable) && `📝 ${variable}`}
                        </label>
                        <input
                          type="text"
                          value={variableValues[variable] || ''}
                          onChange={(e) => setVariableValues(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#c9a084] focus:outline-none transition-colors"
                          placeholder={`Entrez ${variable}...`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSendMessage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>📱 Envoyer via WhatsApp</>
                      )}
                    </button>
                    <button
                      onClick={resetFlow}
                      className="px-6 py-4 border-2 border-stone-300 text-stone-600 rounded-xl font-semibold transition-all duration-200 hover:bg-stone-50"
                    >
                      🔄 Recommencer
                    </button>
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">
                    👁️ Aperçu du message
                  </h3>
                  
                  {/* Phone Mockup */}
                  <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-3xl p-4 max-w-sm mx-auto">
                    <div className="bg-green-500 rounded-2xl p-4 h-96 flex flex-col">
                      {/* WhatsApp Header */}
                      <div className="flex items-center bg-green-600 -m-4 mb-4 p-4 rounded-t-2xl">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold text-sm">
                            {selectedClient?.name.split(' ').map(n => n[0]).join('') || 'LS'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {selectedClient?.name || 'Client'}
                          </p>
                          <p className="text-green-100 text-xs">en ligne</p>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="bg-white rounded-lg p-3 ml-2 max-w-[85%] shadow-sm">
                          <p className="text-stone-800 text-sm whitespace-pre-wrap">
                            {generatePreview() || 'Votre message apparaîtra ici...'}
                          </p>
                          <div className="flex justify-end mt-2">
                            <span className="text-xs text-stone-500">
                              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Input Area */}
                      <div className="bg-white rounded-full p-2 mt-4 flex items-center">
                        <div className="flex-1 px-3 py-2 text-sm text-stone-400">
                          Tapez un message...
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🎤</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Stats */}
                  <div className="mt-4 text-center text-sm text-stone-600">
                    <p>📝 Caractères: {generatePreview().length}</p>
                    <p>📱 Format: WhatsApp</p>
                    <p>📊 Template: {selectedTemplate?.title}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSimple;