'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Settings, Play, Pause, Trash2, Edit2,
  Clock, Calendar, User, Gift, Mail,
  TrendingUp, Award, Bell, Phone, Star,
  CheckCircle, XCircle, AlertCircle, Filter,
  Save, Copy, ArrowRight, Target, Sparkles,
  Heart, ShoppingBag, UserPlus, UserCheck,
  CalendarCheck, Timer, RefreshCw, Activity,
  Search, SortDesc, FileText, GitBranch
} from 'lucide-react';
import WorkflowBuilder from './WorkflowBuilder';

interface EmailAutomation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'reservation' | 'time' | 'client' | 'loyalty' | 'custom';
    condition: string;
    value?: any;
  };
  actions: {
    type: 'email' | 'tag' | 'notification';
    subject?: string;
    template?: string;
    delay?: number;
    content?: string;
  }[];
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  sentEmails?: Array<{
    id: string;
    clientName: string;
    clientEmail: string;
    subject: string;
    content: string;
    sentAt: Date;
    opened?: boolean;
    clicked?: boolean;
  }>;
  filters?: {
    clientType?: string[];
    services?: string[];
    minSpent?: number;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  subject: string;
  content: string;
  automation: Partial<EmailAutomation>;
}

export default function EmailAutomations() {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'analytics' | 'workflows'>('active');
  const [showSentEmails, setShowSentEmails] = useState(false);
  const [selectedAutomationForEmails, setSelectedAutomationForEmails] = useState<EmailAutomation | null>(null);
  
  // États pour les filtres
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchClient, setSearchClient] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Email de bienvenue',
      description: 'Envoie automatiquement un email de bienvenue aux nouveaux clients',
      icon: <UserPlus className="w-5 h-5" />,
      category: 'Onboarding',
      subject: '🌟 Bienvenue chez LAIA SKIN Institut !',
      content: `Bonjour {clientName},

Je suis ravie de vous compter parmi mes clientes !

Votre peau mérite le meilleur, et je suis là pour vous accompagner dans votre parcours beauté.

✨ Profitez de -15% sur votre première visite avec le code BIENVENUE15

📅 Réservez votre premier soin : laiaskin.com
📞 Une question ? Appelez-moi : 06 12 34 56 78

À très bientôt,
Laïa
LAIA SKIN Institut`,
      automation: {
        name: 'Bienvenue nouveau client',
        trigger: {
          type: 'client',
          condition: 'new_registration'
        },
        actions: [
          {
            type: 'email',
            delay: 0
          },
          {
            type: 'tag',
            content: 'Nouveau client'
          }
        ]
      }
    },
    {
      id: 'reminder_48h',
      name: 'Rappel RDV 48h',
      description: 'Rappel automatique 48h avant chaque rendez-vous',
      icon: <Clock className="w-5 h-5" />,
      category: 'Rappels',
      subject: '📅 Rappel : Votre RDV dans 2 jours',
      content: `Bonjour {clientName},

Je vous rappelle votre rendez-vous :

📅 Date : {appointmentDate}
⏰ Heure : {appointmentTime}
💆 Soin : {serviceName}
⏱️ Durée : {duration}

📍 LAIA SKIN Institut
23 rue de la Beauté, 75001 Paris

💡 Conseils avant votre soin :
• Venez démaquillée si possible
• Évitez l'exposition solaire 48h avant
• Hydratez bien votre peau

Pour modifier ou annuler : 06 12 34 56 78

À très bientôt !
Laïa`,
      automation: {
        name: 'Rappel J-2',
        trigger: {
          type: 'reservation',
          condition: 'before_appointment',
          value: 48 // heures
        },
        actions: [
          {
            type: 'email'
          }
        ]
      }
    },
    {
      id: 'post_care',
      name: 'Suivi post-soin',
      description: 'Email de suivi 3 jours après un soin',
      icon: <Heart className="w-5 h-5" />,
      category: 'Fidélisation',
      subject: 'Comment se porte votre peau ? 💕',
      content: `Bonjour {clientName},

J'espère que vous êtes satisfaite de votre {serviceName} de {dayOfWeek}.

💡 Mes conseils post-soin pour optimiser les résultats :
✅ Continuez à bien hydrater votre peau matin et soir
✅ Appliquez votre SPF50 tous les jours
✅ Buvez au moins 1,5L d'eau par jour
✅ Évitez les gommages pendant 1 semaine

📸 N'hésitez pas à m'envoyer une photo de votre peau !

Pour maintenir les résultats, je recommande une séance toutes les 3-4 semaines.

📅 Réserver mon prochain soin : laiaskin.com

Belle journée,
Laïa`,
      automation: {
        name: 'Suivi après soin',
        trigger: {
          type: 'reservation',
          condition: 'after_appointment',
          value: 72 // heures
        },
        actions: [
          {
            type: 'email'
          }
        ]
      }
    },
    {
      id: 'birthday',
      name: 'Email anniversaire',
      description: 'Message et cadeau d\'anniversaire automatique',
      icon: <Gift className="w-5 h-5" />,
      category: 'Fidélisation',
      subject: '🎂 Joyeux anniversaire {clientName} ! 🎉',
      content: `Chère {clientName},

Toute l'équipe de LAIA SKIN vous souhaite un merveilleux anniversaire ! 🎂

Pour célébrer ce jour spécial, j'ai le plaisir de vous offrir :

🎁 -30% sur le soin de votre choix
✨ Un masque LED offert lors de votre visite
🥂 Une coupe de champagne pour fêter ça

Cette offre est valable tout le mois de votre anniversaire.

📅 Réservez votre moment détente : laiaskin.com
📞 Par téléphone : 06 12 34 56 78

Passez une merveilleuse journée !

Avec toute mon affection,
Laïa`,
      automation: {
        name: 'Joyeux anniversaire',
        trigger: {
          type: 'time',
          condition: 'birthday',
          value: '09:00'
        },
        actions: [
          {
            type: 'email'
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
      description: 'Email automatique après 5 visites',
      icon: <Award className="w-5 h-5" />,
      category: 'Fidélisation',
      subject: '🌟 Félicitations ! Vous avez atteint 5 visites',
      content: `Chère {clientName},

FÉLICITATIONS ! 🎉

Vous avez atteint 5 visites chez LAIA SKIN et je tiens à vous remercier pour votre fidélité.

Votre cadeau fidélité vous attend :
🎁 1 soin LED OFFERT (valeur 60€)
✨ Valable sur votre prochaine réservation

Vous avez également cumulé {loyaltyPoints} points de fidélité !

Continuez à prendre soin de vous, votre peau vous remerciera.

📅 Réserver mon soin offert : laiaskin.com

Merci pour votre confiance,
Laïa`,
      automation: {
        name: 'Programme fidélité',
        trigger: {
          type: 'loyalty',
          condition: 'visits_count',
          value: 5
        },
        actions: [
          {
            type: 'email'
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
      subject: 'Votre peau me manque ! 💕',
      content: `Bonjour {clientName},

Cela fait 2 mois qu'on ne s'est pas vues et votre peau me manque !

J'espère que tout va bien pour vous. 

Pour faciliter votre retour, j'ai le plaisir de vous offrir :
✨ -25% sur le soin de votre choix
🎁 Un diagnostic de peau offert
☕ Un moment détente avec thé/café bio

J'ai également de nouvelles prestations qui pourraient vous intéresser :
• Hydra'Naissance 2.0 - Notre soin signature amélioré
• LED Therapy Gold - La dernière génération
• Peeling doux aux acides de fruits

📅 Réservez votre retour : laiaskin.com
📞 Discutons de vos besoins : 06 12 34 56 78

J'espère vous revoir très bientôt !

Chaleureusement,
Laïa`,
      automation: {
        name: 'Win-back campaign',
        trigger: {
          type: 'client',
          condition: 'inactive_days',
          value: 60
        },
        actions: [
          {
            type: 'email'
          }
        ]
      }
    },
    {
      id: 'review_request',
      name: 'Demande d\'avis',
      description: '7 jours après un soin réussi',
      icon: <Star className="w-5 h-5" />,
      category: 'Avis',
      subject: 'Votre avis compte pour moi ⭐',
      content: `Bonjour {clientName},

J'espère que les résultats de votre {serviceName} de la semaine dernière vous ravissent !

Votre satisfaction est ma priorité absolue et j'aimerais connaître votre expérience.

Pourriez-vous prendre 2 minutes pour :

⭐ Laisser un avis Google : {googleReviewLink}
📷 Partager votre expérience sur Instagram : @laia.skin

En remerciement, je vous offrirai 10% sur votre prochaine visite !

Vos retours m'aident à améliorer constamment mes services et permettent à d'autres clientes de découvrir l'institut.

Merci infiniment pour votre confiance,
Laïa

PS : N'hésitez pas à me faire part de vos suggestions directement !`,
      automation: {
        name: 'Collecte avis clients',
        trigger: {
          type: 'reservation',
          condition: 'after_appointment',
          value: 168 // heures (7 jours)
        },
        actions: [
          {
            type: 'email'
          }
        ]
      }
    },
    {
      id: 'seasonal_tips',
      name: 'Conseils saisonniers',
      description: 'Newsletter mensuelle avec conseils beauté',
      icon: <Sparkles className="w-5 h-5" />,
      category: 'Newsletter',
      subject: '🌸 Vos conseils beauté du mois',
      content: `Chère {clientName},

Voici vos conseils beauté pour ce mois !

🌟 ROUTINE DU MOIS
• Matin : Nettoyage doux + Sérum vitamine C + Crème hydratante + SPF50
• Soir : Double nettoyage + Sérum rétinol (2x/semaine) + Crème nourrissante

💡 FOCUS : Préparer sa peau pour l'hiver
✅ Augmentez l'hydratation
✅ Ajoutez des oméga-3 à votre alimentation
✅ N'oubliez pas le contour des yeux
✅ Exfoliez en douceur 1x/semaine

🎁 OFFRE DU MOIS
-20% sur tous les soins hydratants
Code : HYDRATE20

📚 À LIRE SUR LE BLOG
"Les 5 erreurs skincare à éviter en hiver"
Lien : laiaskin.com/blog

À très bientôt à l'institut !
Laïa`,
      automation: {
        name: 'Newsletter mensuelle',
        trigger: {
          type: 'time',
          condition: 'monthly',
          value: 1 // 1er du mois
        },
        actions: [
          {
            type: 'email'
          }
        ]
      }
    }
  ];

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = () => {
    // Automatisations configurées avec vos vrais templates EmailJS
    const savedAutomations: EmailAutomation[] = [
      {
        id: '1',
        name: '✅ Confirmation de réservation (EmailJS)',
        description: 'Template EmailJS : template_myu4emv - Envoi automatique après chaque réservation',
        trigger: {
          type: 'reservation',
          condition: 'new_booking',
          value: 0
        },
        actions: [
          {
            type: 'email',
            subject: '✨ Votre réservation chez LAIA SKIN est confirmée',
            template: 'template_myu4emv'
          }
        ],
        enabled: true,
        createdAt: new Date('2025-09-15'),
        lastTriggered: new Date(),
        triggerCount: 12,
        sentEmails: [
          {
            id: 'email1',
            clientName: 'Marie Dupont',
            clientEmail: 'marie.dupont@email.com',
            subject: '📅 Rappel : Votre RDV dans 2 jours',
            content: 'Bonjour Marie, Je vous rappelle votre rendez-vous...',
            sentAt: new Date(),
            opened: true,
            clicked: true
          },
          {
            id: 'email2',
            clientName: 'Sophie Martin',
            clientEmail: 'sophie.martin@email.com',
            subject: '📅 Rappel : Votre RDV dans 2 jours',
            content: 'Bonjour Sophie, Je vous rappelle votre rendez-vous...',
            sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            opened: true,
            clicked: false
          },
          {
            id: 'email3',
            clientName: 'Julie Bernard',
            clientEmail: 'julie.bernard@email.com',
            subject: '📅 Rappel : Votre RDV dans 2 jours',
            content: 'Bonjour Julie, Je vous rappelle votre rendez-vous...',
            sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            opened: false,
            clicked: false
          }
        ]
      },
      {
        id: '2',
        name: '⭐ Demande d\'avis avec fidélité (EmailJS)',
        description: 'Template EmailJS : template_36zodeb - 3 jours après le soin avec programme fidélité',
        trigger: {
          type: 'reservation',
          condition: 'after_appointment',
          value: 72 // 72 heures = 3 jours
        },
        actions: [
          {
            type: 'email',
            subject: '{{client_name}}, comment s\'est passé votre soin ?',
            template: 'template_36zodeb'
          }
        ],
        enabled: true,
        createdAt: new Date('2025-09-15'),
        lastTriggered: new Date('2025-09-12'),
        triggerCount: 45,
        sentEmails: [
          {
            id: 'email4',
            clientName: 'Emma Leclerc',
            clientEmail: 'emma.leclerc@email.com',
            subject: '🎂 Joyeux anniversaire Emma !',
            content: 'Chère Emma, Toute l\'équipe de LAIA SKIN...',
            sentAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            opened: true,
            clicked: true
          }
        ]
      }
    ];
    setAutomations(savedAutomations);
  };

  const createAutomation = (template?: EmailTemplate) => {
    const newAutomation: EmailAutomation = template ? {
      id: Date.now().toString(),
      name: template.automation.name || template.name,
      description: template.description,
      trigger: template.automation.trigger!,
      actions: [
        {
          type: 'email',
          subject: template.subject,
          content: template.content
        },
        ...(template.automation.actions?.filter(a => a.type !== 'email') || [])
      ],
      enabled: false,
      createdAt: new Date(),
      triggerCount: 0
    } : {
      id: Date.now().toString(),
      name: 'Nouvelle automatisation email',
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

  const getTriggerLabel = (trigger: EmailAutomation['trigger']) => {
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
    emailsSent: automations.reduce((sum, a) => sum + a.triggerCount, 0),
    lastWeek: 89,
    openRate: 67,
    clickRate: 23
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-500" />
            Automatisations Email
          </h2>
          <p className="text-gray-600 mt-1">
            Créez des séquences d\'emails automatiques pour fidéliser vos clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle automatisation
        </button>
      </div>

      {/* Stats cliquables */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-blue-900">{stats.total}</span>
          </div>
          <p className="text-blue-700 text-xs font-medium">Total</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-xl font-bold text-green-900">{stats.active}</span>
          </div>
          <p className="text-green-700 text-xs font-medium">Actives</p>
        </div>
        <div 
          className="bg-purple-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => setShowSentEmails(true)}
        >
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold text-purple-900">{stats.emailsSent}</span>
          </div>
          <p className="text-purple-700 text-xs font-medium">Emails envoyés</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-orange-900">+{stats.lastWeek}</span>
          </div>
          <p className="text-orange-700 text-xs font-medium">Cette semaine</p>
        </div>
        <div className="bg-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-6 h-6 text-pink-500" />
            <span className="text-xl font-bold text-pink-900">{stats.openRate}%</span>
          </div>
          <p className="text-pink-700 text-xs font-medium">Taux ouverture</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold text-indigo-900">{stats.clickRate}%</span>
          </div>
          <p className="text-indigo-700 text-xs font-medium">Taux de clic</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'active'
                ? 'bg-purple-500 text-white shadow-md'
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
                ? 'bg-purple-500 text-white shadow-md'
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
                ? 'bg-purple-500 text-white shadow-md'
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
        <div className="space-y-4">
          {automations.map(automation => (
            <div
              key={automation.id}
              className={`border rounded-lg p-4 transition-all ${
                automation.enabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    automation.enabled ? 'bg-blue-100' : 'bg-gray-100'
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
                        <Mail className="w-3 h-3" />
                        {automation.triggerCount} emails envoyés
                      </span>
                      {automation.lastTriggered && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Dernier : {new Date(automation.lastTriggered).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Indicateurs de performance */}
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {automation.triggerCount > 0 && (
                        <>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            automation.sentEmails && automation.sentEmails.filter(e => e.opened).length / automation.sentEmails.length > 0.5
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            📧 Taux ouverture: {automation.sentEmails ? 
                              Math.round((automation.sentEmails.filter(e => e.opened).length / automation.sentEmails.length) * 100) : 0}%
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            automation.sentEmails && automation.sentEmails.filter(e => e.clicked).length > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            🔗 Clics: {automation.sentEmails ? 
                              automation.sentEmails.filter(e => e.clicked).length : 0}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            automation.lastTriggered && (Date.now() - new Date(automation.lastTriggered).getTime()) < 7 * 24 * 60 * 60 * 1000
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {automation.lastTriggered && (Date.now() - new Date(automation.lastTriggered).getTime()) < 7 * 24 * 60 * 60 * 1000
                              ? '✅ Actif récemment'
                              : '⚠️ Inactif +7j'}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            automation.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {automation.enabled ? '🟢 En marche' : '🔴 Arrêté'}
                          </div>
                        </>
                      )}
                      {automation.triggerCount === 0 && (
                        <div className="col-span-4 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs text-center">
                          ⏳ Pas encore déclenché - En attente du premier événement
                        </div>
                      )}
                    </div>
                    {automation.sentEmails && automation.sentEmails.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedAutomationForEmails(automation);
                          setShowSentEmails(true);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir les {automation.sentEmails.length} emails envoyés →
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomation(automation.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      automation.enabled ? 'bg-blue-500' : 'bg-gray-300'
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
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune automatisation email
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre première automatisation pour engager vos clients par email
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Créer une automatisation
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'workflows' && (
        <WorkflowBuilder />
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-2 gap-4">
          {emailTemplates.map(template => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => createAutomation(template)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
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
                  <span className="text-sm font-medium">234 envois</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Anniversaires</span>
                  <span className="text-sm font-medium">67 envois</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Suivi post-soin</span>
                  <span className="text-sm font-medium">156 envois</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Performance emails</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux d\'ouverture</span>
                  <span className="text-sm font-medium text-green-600">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de clic</span>
                  <span className="text-sm font-medium text-blue-600">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Désabonnements</span>
                  <span className="text-sm font-medium text-red-600">0.5%</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Cette semaine</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emails envoyés</span>
                  <span className="text-sm font-medium">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ouverts</span>
                  <span className="text-sm font-medium">60</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Clics</span>
                  <span className="text-sm font-medium">21</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Créer une automatisation email
            </h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Choisissez un template ou créez depuis zéro
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => createAutomation()}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Créer depuis zéro</span>
                </button>
                {emailTemplates.slice(0, 5).map(template => (
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

      {/* Modal pour afficher les emails envoyés */}
      {showSentEmails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Emails envoyés {selectedAutomationForEmails ? `- ${selectedAutomationForEmails.name}` : ''}
              </h3>
              <button
                onClick={() => {
                  setShowSentEmails(false);
                  setSelectedAutomationForEmails(null);
                  setFilterDateRange('all');
                  setSearchClient('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filtres simplifiés */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterDateRange('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterDateRange === 'all' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setFilterDateRange('today')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterDateRange === 'today' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => setFilterDateRange('week')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterDateRange === 'week' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Cette semaine
                  </button>
                  <button
                    onClick={() => setFilterDateRange('month')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterDateRange === 'month' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Ce mois
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SortDesc className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc')}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date-desc">Plus récent</option>
                  <option value="date-asc">Plus ancien</option>
                </select>
              </div>
            </div>

            {/* Liste des emails */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                // Collecter tous les emails
                let allEmails: any[] = [];
                
                if (selectedAutomationForEmails) {
                  allEmails = selectedAutomationForEmails.sentEmails || [];
                } else {
                  automations.forEach(automation => {
                    if (automation.sentEmails) {
                      allEmails = [...allEmails, ...automation.sentEmails.map(email => ({
                        ...email,
                        automationName: automation.name
                      }))];
                    }
                  });
                }

                // Filtrer par date
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                let filteredEmails = allEmails.filter(email => {
                  const emailDate = new Date(email.sentAt);
                  
                  switch (filterDateRange) {
                    case 'today':
                      return emailDate >= today;
                    case 'week':
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      return emailDate >= weekAgo;
                    case 'month':
                      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                      return emailDate >= monthAgo;
                    default:
                      return true;
                  }
                });

                // Filtrer par recherche client
                if (searchClient) {
                  filteredEmails = filteredEmails.filter(email => 
                    email.clientName.toLowerCase().includes(searchClient.toLowerCase()) ||
                    email.clientEmail.toLowerCase().includes(searchClient.toLowerCase())
                  );
                }

                // Trier
                filteredEmails.sort((a, b) => {
                  const dateA = new Date(a.sentAt).getTime();
                  const dateB = new Date(b.sentAt).getTime();
                  return sortBy === 'date-desc' ? dateB - dateA : dateA - dateB;
                });

                if (filteredEmails.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun email trouvé avec ces filtres</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredEmails.map(email => (
                      <div key={email.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{email.clientName}</span>
                              <span className="text-sm text-gray-500">({email.clientEmail})</span>
                              {!selectedAutomationForEmails && email.automationName && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {email.automationName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{email.subject}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{email.content}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-500">
                              {new Date(email.sentAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <div className="flex gap-2">
                              {email.opened && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  Ouvert
                                </span>
                              )}
                              {email.clicked && (
                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                  <Target className="w-3 h-3" />
                                  Cliqué
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}