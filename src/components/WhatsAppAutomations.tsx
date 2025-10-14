'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Settings, Play, Pause, Trash2, Edit2,
  Clock, Calendar, User, Gift, MessageCircle,
  TrendingUp, Award, Bell, Mail, Phone, Star,
  CheckCircle, XCircle, AlertCircle, Filter,
  Save, Copy, ArrowRight, Target, Sparkles,
  Heart, ShoppingBag, UserPlus, UserCheck,
  CalendarCheck, Timer, RefreshCw, Activity,
  Search, SortDesc, GitBranch
} from 'lucide-react';
import WorkflowBuilder from './WorkflowBuilder';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'reservation' | 'time' | 'client' | 'loyalty' | 'custom';
    condition: string;
    value?: any;
  };
  actions: {
    type: 'message' | 'tag' | 'notification' | 'email';
    template?: string;
    delay?: number;
    content?: string;
  }[];
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  sentMessages?: Array<{
    id: string;
    clientName: string;
    clientPhone: string;
    message: string;
    sentAt: Date;
  }>;
  filters?: {
    clientType?: string[];
    services?: string[];
    minSpent?: number;
  };
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  automation: Partial<Automation>;
}

export default function WhatsAppAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'analytics' | 'workflows'>('active');
  const [showSentMessages, setShowSentMessages] = useState(false);
  
  // États pour les filtres
  const [filterAutomation, setFilterAutomation] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchClient, setSearchClient] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'client' | 'automation'>('date-desc');

  const automationTemplates: AutomationTemplate[] = [
    {
      id: 'welcome',
      name: 'Message de bienvenue',
      description: 'Envoie automatiquement un message de bienvenue aux nouveaux clients',
      icon: <UserPlus className="w-5 h-5" />,
      category: 'Onboarding',
      automation: {
        name: 'Bienvenue nouveau client',
        trigger: {
          type: 'client',
          condition: 'new_registration'
        },
        actions: [
          {
            type: 'message',
            delay: 0,
            content: '🌟 Bienvenue chez LAIA SKIN {clientName} ! 🌟\n\nJe suis ravie de vous compter parmi mes clientes.\n\n✨ Profitez de -15% sur votre première visite avec le code BIENVENUE15\n\n📅 Réservez votre premier soin : laiaskin.com\n\nÀ très bientôt,\nLaïa 💕'
          },
          {
            type: 'tag',
            content: 'Nouveau client'
          }
        ]
      }
    },
    {
      id: 'reminder_24h',
      name: 'Rappel RDV 24h',
      description: 'Rappel automatique 24h avant chaque rendez-vous',
      icon: <Clock className="w-5 h-5" />,
      category: 'Rappels',
      automation: {
        name: 'Rappel J-1',
        trigger: {
          type: 'reservation',
          condition: 'before_appointment',
          value: 24 // heures
        },
        actions: [
          {
            type: 'message',
            content: '📅 Rappel de votre RDV demain\n\nBonjour {clientName},\n\nJe vous attends demain à {appointmentTime} pour votre soin {serviceName}.\n\n📍 LAIA SKIN Institut\n💆 Durée : {duration}\n\nÀ demain ! 💕\n\nPour modifier : 06 12 34 56 78'
          }
        ]
      }
    },
    {
      id: 'post_care',
      name: 'Suivi post-soin',
      description: 'Message de suivi 2 jours après un soin',
      icon: <Heart className="w-5 h-5" />,
      category: 'Fidélisation',
      automation: {
        name: 'Suivi après soin',
        trigger: {
          type: 'reservation',
          condition: 'after_appointment',
          value: 48 // heures
        },
        actions: [
          {
            type: 'message',
            content: 'Bonjour {clientName} 😊\n\nJ\'espère que vous êtes satisfaite de votre {serviceName} de {dayOfWeek}.\n\n💡 Conseils post-soin :\n✅ Hydratez bien votre peau\n✅ Protection SPF50 obligatoire\n✅ Évitez le maquillage 24h\n\nN\'hésitez pas si vous avez des questions !\n\nBelle journée,\nLaïa 💕'
          }
        ]
      }
    },
    {
      id: 'birthday',
      name: 'Anniversaire client',
      description: 'Message et cadeau d\'anniversaire automatique',
      icon: <Gift className="w-5 h-5" />,
      category: 'Fidélisation',
      automation: {
        name: 'Joyeux anniversaire',
        trigger: {
          type: 'time',
          condition: 'birthday',
          value: '09:00'
        },
        actions: [
          {
            type: 'message',
            content: '🎂 Joyeux anniversaire {clientName} ! 🎉\n\nPour célébrer votre jour spécial, je vous offre :\n\n🎁 -30% sur le soin de votre choix\n✨ Un masque LED offert\n🥂 Une coupe de champagne\n\nOffre valable tout le mois !\n\nRéservez votre moment détente : 06 12 34 56 78\n\nBelle journée d\'anniversaire ! 💕\nLaïa'
          },
          {
            type: 'tag',
            content: 'Anniversaire du mois'
          }
        ]
      }
    },
    {
      id: 'loyalty_reward',
      name: 'Récompense fidélité',
      description: 'Déclenché après 5 visites',
      icon: <Award className="w-5 h-5" />,
      category: 'Fidélisation',
      automation: {
        name: 'Programme fidélité',
        trigger: {
          type: 'loyalty',
          condition: 'visits_count',
          value: 5
        },
        actions: [
          {
            type: 'message',
            content: '🌟 Félicitations {clientName} ! 🌟\n\nVous avez atteint 5 visites ! 🎉\n\nVotre récompense :\n🎁 1 soin LED OFFERT (valeur 60€)\n\nValable sur votre prochaine réservation.\n\nMerci pour votre fidélité ! 💕\n\nRéservez : laiaskin.com\n\nÀ très bientôt,\nLaïa'
          },
          {
            type: 'notification',
            content: 'Client {clientName} a atteint 5 visites - Récompense activée'
          }
        ]
      }
    },
    {
      id: 'reactivation',
      name: 'Réactivation client inactif',
      description: 'Relance après 2 mois sans visite',
      icon: <RefreshCw className="w-5 h-5" />,
      category: 'Réengagement',
      automation: {
        name: 'Win-back campaign',
        trigger: {
          type: 'client',
          condition: 'inactive_days',
          value: 60
        },
        actions: [
          {
            type: 'message',
            content: 'Bonjour {clientName} 👋\n\nVotre peau me manque ! 😊\n\nCela fait 2 mois qu\'on ne s\'est pas vues...\n\n✨ Pour votre retour, je vous offre -25% sur le soin de votre choix !\n\nDécouvrez aussi mes nouveautés :\n• Hydro\'Naissance 2.0\n• LED Therapy Gold\n\nRéservez vite : laiaskin.com\n\nÀ très bientôt j\'espère,\nLaïa 💕'
          }
        ]
      }
    },
    {
      id: 'review_request',
      name: 'Demande d\'avis Google',
      description: '5 jours après un soin réussi',
      icon: <Star className="w-5 h-5" />,
      category: 'Avis',
      automation: {
        name: 'Collecte avis Google',
        trigger: {
          type: 'reservation',
          condition: 'after_appointment',
          value: 120 // heures (5 jours)
        },
        actions: [
          {
            type: 'message',
            content: 'Bonjour {clientName} 😊\n\nJ\'espère que les résultats de votre {serviceName} vous ravissent !\n\nVotre satisfaction est ma priorité 💕\n\nPourriez-vous prendre 2 minutes pour partager votre expérience sur Google ? Cela m\'aide énormément !\n\n⭐ Laisser un avis : {googleReviewLink}\n\nMerci infiniment pour votre soutien !\n\nÀ bientôt,\nLaïa'
          }
        ]
      }
    },
    {
      id: 'seasonal_promo',
      name: 'Promotions saisonnières',
      description: 'Campagnes automatiques selon la saison',
      icon: <Sparkles className="w-5 h-5" />,
      category: 'Marketing',
      automation: {
        name: 'Promo automne/hiver',
        trigger: {
          type: 'time',
          condition: 'monthly',
          value: 1 // 1er du mois
        },
        actions: [
          {
            type: 'message',
            content: '❄️ Offre Spéciale Hiver ❄️\n\n{clientName}, protégez votre peau du froid !\n\n📦 Pack Hydratation Intense :\n• Hydro\'Cleaning\n• Hydro\'Naissance\n• LED Therapy\n• Masque collagène OFFERT\n\n💰 149€ au lieu de 210€\n\nOffre limitée jusqu\'au {endDate} !\n\nRéservez : 06 12 34 56 78\n\nPrenez soin de vous,\nLaïa 💕'
          }
        ]
      }
    },
    {
      id: 'abandoned_booking',
      name: 'Panier abandonné',
      description: 'Relance si réservation non finalisée',
      icon: <ShoppingBag className="w-5 h-5" />,
      category: 'Conversion',
      automation: {
        name: 'Réservation abandonnée',
        trigger: {
          type: 'client',
          condition: 'abandoned_cart',
          value: 2 // heures
        },
        actions: [
          {
            type: 'message',
            content: 'Bonjour {clientName} 👋\n\nVous étiez sur le point de réserver votre soin {serviceName}...\n\nUn souci ? Je peux vous aider !\n\n💡 Astuce : Des créneaux sont encore disponibles cette semaine.\n\n📅 Finaliser ma réservation : {bookingLink}\n\nOu appelez-moi : 06 12 34 56 78\n\nÀ bientôt,\nLaïa 😊'
          }
        ]
      }
    }
  ];

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = () => {
    // Charger les automatisations existantes
    const savedAutomations: Automation[] = [
      {
        id: '1',
        name: 'Rappel RDV 24h',
        description: 'Envoie un rappel 24h avant chaque RDV',
        trigger: {
          type: 'reservation',
          condition: 'before_appointment',
          value: 24
        },
        actions: [
          {
            type: 'message',
            template: 'reminder_appointment'
          }
        ],
        enabled: true,
        createdAt: new Date('2024-01-15'),
        lastTriggered: new Date('2024-11-20'),
        triggerCount: 156,
        sentMessages: [
          {
            id: 'sent1',
            clientName: 'Sophie Martin',
            clientPhone: '+33623456789',
            message: '📅 Rappel de votre RDV demain\n\nBonjour Sophie,\n\nJe vous attends demain à 10h00 pour votre soin Hydro\'Glow.\n\n📍 LAIA SKIN Institut\n💆 Durée : 90 min\n\nÀ demain ! 💕',
            sentAt: new Date() // Aujourd'hui
          },
          {
            id: 'sent2',
            clientName: 'Emma Dubois',
            clientPhone: '+33634567890',
            message: '📅 Rappel de votre RDV demain\n\nBonjour Emma,\n\nJe vous attends demain à 15h30 pour votre soin Hydro\'Naissance.\n\n📍 LAIA SKIN Institut\n💆 Durée : 60 min\n\nÀ demain ! 💕',
            sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Il y a 3 jours
          },
          {
            id: 'sent3',
            clientName: 'Julie Moreau',
            clientPhone: '+33645678901',
            message: '📅 Rappel de votre RDV\n\nBonjour Julie,\n\nJe vous attends demain pour votre soin.\n\nÀ demain ! 💕',
            sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // Il y a 10 jours
          },
          {
            id: 'sent4',
            clientName: 'Claire Petit',
            clientPhone: '+33656789012',
            message: '📅 Rappel de votre RDV\n\nBonjour Claire,\n\nJe vous attends demain pour votre soin.\n\nÀ demain ! 💕',
            sentAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // Il y a 40 jours
          }
        ]
      },
      {
        id: '2',
        name: 'Anniversaire clients',
        description: 'Message personnalisé pour les anniversaires',
        trigger: {
          type: 'time',
          condition: 'birthday',
          value: '09:00'
        },
        actions: [
          {
            type: 'message',
            template: 'birthday'
          },
          {
            type: 'tag',
            content: 'Anniversaire'
          }
        ],
        enabled: true,
        createdAt: new Date('2024-02-01'),
        lastTriggered: new Date('2024-11-18'),
        triggerCount: 43,
        sentMessages: [
          {
            id: 'birthday1',
            clientName: 'Lucie Bernard',
            clientPhone: '+33667890123',
            message: '🎂 Joyeux anniversaire Lucie ! 🎉\n\nPour célébrer votre jour spécial, je vous offre :\n\n🎁 -30% sur le soin de votre choix\n✨ Un masque LED offert\n🥂 Une coupe de champagne\n\nÀ très bientôt,\nLaïa',
            sentAt: new Date() // Aujourd'hui
          },
          {
            id: 'birthday2',
            clientName: 'Marie Lambert',
            clientPhone: '+33678901234',
            message: '🎂 Joyeux anniversaire Marie ! 🎉\n\nPour célébrer votre jour spécial, je vous offre :\n\n🎁 -30% sur le soin de votre choix\n\nÀ très bientôt,\nLaïa',
            sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Il y a 5 jours
          }
        ]
      }
    ];
    setAutomations(savedAutomations);
  };

  const createAutomation = (template?: AutomationTemplate) => {
    const newAutomation: Automation = template ? {
      id: Date.now().toString(),
      ...template.automation,
      name: template.automation.name || template.name,
      description: template.description,
      enabled: false,
      createdAt: new Date(),
      triggerCount: 0
    } as Automation : {
      id: Date.now().toString(),
      name: 'Nouvelle automatisation',
      description: '',
      trigger: {
        type: 'reservation',
        condition: ''
      },
      actions: [],
      enabled: false,
      createdAt: new Date(),
      triggerCount: 0
    };

    setAutomations([...automations, newAutomation]);
    setEditingAutomation(newAutomation);
    setShowCreateModal(false);
  };

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const deleteAutomation = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette automatisation ?')) {
      setAutomations(automations.filter(a => a.id !== id));
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'reservation': return <Calendar className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'client': return <User className="w-4 h-4" />;
      case 'loyalty': return <Award className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = (trigger: Automation['trigger']) => {
    switch (trigger.type) {
      case 'reservation':
        if (trigger.condition === 'before_appointment') {
          return `${trigger.value}h avant RDV`;
        } else if (trigger.condition === 'after_appointment') {
          return `${trigger.value}h après RDV`;
        }
        return 'Sur réservation';
      case 'time':
        if (trigger.condition === 'birthday') return 'Anniversaire client';
        if (trigger.condition === 'monthly') return `Le ${trigger.value} du mois`;
        return `À ${trigger.value}`;
      case 'client':
        if (trigger.condition === 'new_registration') return 'Nouveau client';
        if (trigger.condition === 'inactive_days') return `Inactif depuis ${trigger.value}j`;
        return 'Événement client';
      case 'loyalty':
        return `${trigger.value} visites`;
      default:
        return 'Personnalisé';
    }
  };

  const stats = {
    total: automations.length,
    active: automations.filter(a => a.enabled).length,
    triggered: automations.reduce((sum, a) => sum + a.triggerCount, 0),
    lastWeek: 234
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-500" />
            Automatisations WhatsApp
          </h2>
          <p className="text-gray-600 mt-1">
            Créez des workflows automatiques pour engager vos clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle automatisation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-900">{stats.total}</span>
          </div>
          <p className="text-blue-700 text-sm font-medium">Total automatisations</p>
          <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Cliquez pour voir →
          </p>
        </button>
        <button
          onClick={() => {
            setActiveTab('active');
            // Scroll vers les automatisations actives
            setTimeout(() => {
              document.getElementById('active-automations')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-green-900">{stats.active}</span>
          </div>
          <p className="text-green-700 text-sm font-medium">Actives</p>
          <p className="text-xs text-green-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir les automatisations actives →
          </p>
        </button>
        <button
          onClick={() => {
            setShowSentMessages(true);
            // Pré-filtrer sur tous les messages
            setFilterAutomation('all');
            setFilterDateRange('all');
          }}
          className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-purple-900">{stats.triggered}</span>
          </div>
          <p className="text-purple-700 text-sm font-medium">Messages envoyés</p>
          <p className="text-xs text-purple-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir l'historique →
          </p>
        </button>
        <button
          onClick={() => {
            setShowSentMessages(true);
            // Pré-filtrer sur cette semaine
            setFilterAutomation('all');
            setFilterDateRange('week');
          }}
          className="bg-orange-50 rounded-lg p-4 hover:bg-orange-100 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-900">+{stats.lastWeek}</span>
          </div>
          <p className="text-orange-700 text-sm font-medium">Cette semaine</p>
          <p className="text-xs text-orange-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir les messages de la semaine →
          </p>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'active'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Automatisations actives</span>
            <span className="sm:hidden">⚡</span>
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'workflows'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Workflows Intelligents</span>
            <span className="sm:hidden">🔀</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'templates'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">📋</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">📊</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'active' && (
        <div className="space-y-4" id="active-automations">
          {automations.map(automation => (
            <div
              key={automation.id}
              className={`border rounded-lg p-4 transition-all ${
                automation.enabled ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    automation.enabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {getTriggerIcon(automation.trigger.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {automation.name}
                      </h3>
                      {automation.enabled && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {automation.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Déclencheur : {getTriggerLabel(automation.trigger)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {automation.actions.length} action(s)
                      </span>
                      {automation.lastTriggered && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Dernier : {new Date(automation.lastTriggered).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {automation.triggerCount} déclenchements
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomation(automation.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      automation.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        automation.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setEditingAutomation(automation)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteAutomation(automation.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {automations.length === 0 && (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune automatisation
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre première automatisation pour engager vos clients
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Créer une automatisation
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-2 gap-4">
          {automationTemplates.map(template => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => createAutomation(template)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.description}
                  </p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {template.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Top automatisations</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rappel RDV</span>
                  <span className="text-sm font-medium">156 envois</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Anniversaires</span>
                  <span className="text-sm font-medium">43 envois</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Suivi post-soin</span>
                  <span className="text-sm font-medium">89 envois</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux d\'ouverture</span>
                  <span className="text-sm font-medium text-green-600">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de clic</span>
                  <span className="text-sm font-medium text-blue-600">34%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversions</span>
                  <span className="text-sm font-medium text-purple-600">12%</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Cette semaine</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages envoyés</span>
                  <span className="text-sm font-medium">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nouveaux clients</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">RDV confirmés</span>
                  <span className="text-sm font-medium">45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <WorkflowBuilder />
      )}

      {/* Modal création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Créer une automatisation
            </h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Choisissez un template ou créez depuis zéro
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => createAutomation()}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Créer depuis zéro</span>
                </button>
                {automationTemplates.slice(0, 5).map(template => (
                  <button
                    key={template.id}
                    onClick={() => createAutomation(template)}
                    className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {template.icon}
                      <span className="text-sm font-medium text-gray-900">
                        {template.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {template.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editingAutomation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Configurer l\'automatisation
            </h3>

            <div className="space-y-6">
              {/* Nom et description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l\'automatisation
                  </label>
                  <input
                    type="text"
                    value={editingAutomation.name}
                    onChange={(e) => setEditingAutomation({
                      ...editingAutomation,
                      name: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingAutomation.description}
                    onChange={(e) => setEditingAutomation({
                      ...editingAutomation,
                      description: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Envoie un rappel 24h avant chaque RDV"
                  />
                </div>
              </div>

              {/* Déclencheur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Déclencheur
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-3 border border-gray-200 rounded-lg hover:border-green-500 transition-colors">
                    <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-xs">Réservation</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:border-green-500 transition-colors">
                    <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-xs">Horaire</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:border-green-500 transition-colors">
                    <User className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-xs">Client</span>
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message WhatsApp
                </label>
                
                {/* Variables disponibles */}
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-2">Variables disponibles (cliquez pour insérer) :</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '{clientName}', '{serviceName}', '{appointmentTime}', 
                      '{appointmentDate}', '{duration}', '{price}', 
                      '{dayOfWeek}', '{phone}', '{email}'
                    ].map(variable => (
                      <button
                        key={variable}
                        onClick={() => {
                          const currentContent = editingAutomation.actions[0]?.content || '';
                          const updatedActions = [...editingAutomation.actions];
                          if (updatedActions.length === 0) {
                            updatedActions.push({ type: 'message', content: variable });
                          } else {
                            updatedActions[0] = {
                              ...updatedActions[0],
                              content: currentContent + ' ' + variable
                            };
                          }
                          setEditingAutomation({
                            ...editingAutomation,
                            actions: updatedActions
                          });
                        }}
                        className="px-2 py-1 bg-white text-blue-700 border border-blue-300 rounded text-xs hover:bg-blue-100 transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={editingAutomation.actions[0]?.content || ''}
                  onChange={(e) => {
                    const updatedActions = [...editingAutomation.actions];
                    if (updatedActions.length === 0) {
                      updatedActions.push({ type: 'message', content: e.target.value });
                    } else {
                      updatedActions[0] = {
                        ...updatedActions[0],
                        content: e.target.value
                      };
                    }
                    setEditingAutomation({
                      ...editingAutomation,
                      actions: updatedActions
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={8}
                  placeholder="Tapez votre message ici... Utilisez les variables ci-dessus pour personnaliser."
                />

                {/* Aperçu du message */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Aperçu :</p>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {(editingAutomation.actions[0]?.content || '')
                        .replace(/{clientName}/g, 'Marie Dupont')
                        .replace(/{serviceName}/g, 'Hydro\'Naissance')
                        .replace(/{appointmentTime}/g, '14h00')
                        .replace(/{appointmentDate}/g, '15 novembre')
                        .replace(/{duration}/g, '60 min')
                        .replace(/{price}/g, '90€')
                        .replace(/{dayOfWeek}/g, 'mercredi')
                        .replace(/{phone}/g, '06 12 34 56 78')
                        .replace(/{email}/g, 'marie@example.com')
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingAutomation(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Sauvegarder les changements
                  setAutomations(automations.map(a =>
                    a.id === editingAutomation.id ? editingAutomation : a
                  ));
                  setEditingAutomation(null);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Messages envoyés via automatisation */}
      {showSentMessages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-7 h-7 text-blue-500" />
                Messages envoyés via automatisation
              </h3>
              <button
                onClick={() => setShowSentMessages(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Barre de filtres simplifiée */}
            <div className="mb-4">
              {/* Filtres rapides */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => {
                    setFilterDateRange('today');
                    setFilterAutomation('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterDateRange === 'today' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => {
                    setFilterDateRange('week');
                    setFilterAutomation('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterDateRange === 'week' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cette semaine
                </button>
                <button
                  onClick={() => {
                    setFilterDateRange('month');
                    setFilterAutomation('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterDateRange === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ce mois
                </button>
                <div className="border-l border-gray-300 mx-2"></div>
                {automations.slice(0, 3).map(auto => (
                  <button
                    key={auto.id}
                    onClick={() => {
                      setFilterAutomation(auto.id);
                      setFilterDateRange('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterAutomation === auto.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {auto.name}
                  </button>
                ))}
                {filterDateRange !== 'all' || filterAutomation !== 'all' || searchClient ? (
                  <button
                    onClick={() => {
                      setFilterDateRange('all');
                      setFilterAutomation('all');
                      setSearchClient('');
                    }}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    ✕ Effacer filtres
                  </button>
                ) : null}
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  placeholder="Rechercher par nom ou téléphone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="space-y-4">
                {(() => {
                  // Filtrer et trier les messages
                  let allMessages: any[] = [];
                  
                  // Collecter tous les messages
                  automations.forEach(automation => {
                    if (automation.sentMessages) {
                      automation.sentMessages.forEach(msg => {
                        allMessages.push({
                          ...msg,
                          automationId: automation.id,
                          automationName: automation.name,
                          automationIcon: getTriggerIcon(automation.trigger.type)
                        });
                      });
                    }
                  });
                  
                  // Appliquer les filtres
                  let filteredMessages = allMessages;
                  
                  // Filtre par automatisation
                  if (filterAutomation !== 'all') {
                    filteredMessages = filteredMessages.filter(msg => msg.automationId === filterAutomation);
                  }
                  
                  // Filtre par période
                  if (filterDateRange !== 'all') {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    
                    filteredMessages = filteredMessages.filter(msg => {
                      const msgDate = new Date(msg.sentAt);
                      switch (filterDateRange) {
                        case 'today':
                          return msgDate >= today;
                        case 'week':
                          return msgDate >= weekAgo;
                        case 'month':
                          return msgDate >= monthAgo;
                        default:
                          return true;
                      }
                    });
                  }
                  
                  // Filtre par recherche client
                  if (searchClient) {
                    const search = searchClient.toLowerCase();
                    filteredMessages = filteredMessages.filter(msg => 
                      msg.clientName.toLowerCase().includes(search) ||
                      msg.clientPhone.includes(search)
                    );
                  }
                  
                  // Tri
                  filteredMessages.sort((a, b) => {
                    switch (sortBy) {
                      case 'date-desc':
                        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
                      case 'date-asc':
                        return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
                      case 'client':
                        return a.clientName.localeCompare(b.clientName);
                      case 'automation':
                        return a.automationName.localeCompare(b.automationName);
                      default:
                        return 0;
                    }
                  });
                  
                  // Afficher le compteur
                  const totalMessages = allMessages.length;
                  const displayedMessages = filteredMessages.length;
                  
                  return (
                    <>
                      {/* Compteur de résultats */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">{displayedMessages}</span> message{displayedMessages !== 1 ? 's' : ''} trouvé{displayedMessages !== 1 ? 's' : ''} 
                          {displayedMessages !== totalMessages && ` sur ${totalMessages} au total`}
                        </p>
                      </div>
                      
                      {/* Messages filtrés */}
                      {filteredMessages.length > 0 ? (
                        filteredMessages.map((msg, index) => (
                          <div key={`${msg.id}-${index}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{msg.clientName}</p>
                                <p className="text-sm text-gray-500">{msg.clientPhone}</p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  {msg.automationIcon}
                                  {msg.automationName}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  Envoyé
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(msg.sentAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded p-3 border border-gray-200">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Aucun message trouvé
                          </h3>
                          <p className="text-gray-600">
                            Essayez de modifier vos critères de recherche
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}