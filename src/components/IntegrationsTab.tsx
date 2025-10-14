'use client';

import { useState, useEffect } from 'react';
import {
  Plug, Check, X, AlertCircle, ExternalLink, Loader2,
  CreditCard, Calendar, Send, ShoppingBag, FileText, Globe,
  MessageSquare, Package, TrendingUp, Users, Gift
} from 'lucide-react';
import StripeConfigModal from './integrations/StripeConfigModal';

interface Integration {
  id: string;
  type: string;
  enabled: boolean;
  status: 'disconnected' | 'connected' | 'error' | 'expired';
  displayName?: string;
  description?: string;
  lastSync?: string;
  errorMessage?: string;
  hasConfig: boolean;
}

// Catalogue des intégrations disponibles
const AVAILABLE_INTEGRATIONS = [
  {
    type: 'stripe',
    name: 'Stripe',
    description: 'Paiements en ligne sécurisés par carte bancaire',
    category: 'payments',
    icon: CreditCard,
    color: 'bg-indigo-500',
    docsUrl: 'https://stripe.com/docs',
    importance: 'essential'
  },
  {
    type: 'planity',
    name: 'Planity',
    description: 'Plateforme de réservation #1 en France pour la beauté',
    category: 'booking',
    icon: Calendar,
    color: 'bg-pink-500',
    docsUrl: 'https://developers.planity.com',
    importance: 'essential'
  },
  {
    type: 'treatwell',
    name: 'Treatwell',
    description: 'Réservations beauté en Europe (UK, DE, ES, IT...)',
    category: 'booking',
    icon: Users,
    color: 'bg-purple-500',
    docsUrl: 'https://developers.treatwell.com',
    importance: 'important'
  },
  {
    type: 'groupon',
    name: 'Groupon',
    description: 'Gestion des bons de réduction et promotions',
    category: 'promotions',
    icon: Gift,
    color: 'bg-green-500',
    docsUrl: 'https://partner-api.groupon.com',
    importance: 'important'
  },
  {
    type: 'google_calendar',
    name: 'Google Calendar',
    description: 'Synchronisation bidirectionnelle de vos rendez-vous',
    category: 'calendar',
    icon: Calendar,
    color: 'bg-blue-500',
    docsUrl: 'https://developers.google.com/calendar',
    importance: 'important'
  },
  {
    type: 'brevo',
    name: 'Brevo (Sendinblue)',
    description: 'Email marketing et automation (RGPD compliant)',
    category: 'marketing',
    icon: Send,
    color: 'bg-teal-500',
    docsUrl: 'https://developers.brevo.com',
    importance: 'useful'
  },
  {
    type: 'twilio',
    name: 'Twilio',
    description: 'SMS et WhatsApp Business API',
    category: 'communication',
    icon: MessageSquare,
    color: 'bg-red-500',
    docsUrl: 'https://www.twilio.com/docs',
    importance: 'useful'
  },
  {
    type: 'shopify',
    name: 'Shopify',
    description: 'E-commerce pour vendre vos produits beauté',
    category: 'ecommerce',
    icon: ShoppingBag,
    color: 'bg-green-600',
    docsUrl: 'https://shopify.dev',
    importance: 'bonus'
  },
  {
    type: 'quickbooks',
    name: 'QuickBooks',
    description: 'Comptabilité et gestion financière',
    category: 'accounting',
    icon: FileText,
    color: 'bg-blue-600',
    docsUrl: 'https://developer.intuit.com',
    importance: 'bonus'
  },
  {
    type: 'google_my_business',
    name: 'Google My Business',
    description: 'Gestion automatique de votre fiche Google',
    category: 'reputation',
    icon: Globe,
    color: 'bg-yellow-500',
    docsUrl: 'https://developers.google.com/my-business',
    importance: 'bonus'
  }
];

const CATEGORIES = {
  booking: { name: 'Réservations', icon: Calendar, color: 'text-pink-600' },
  payments: { name: 'Paiements', icon: CreditCard, color: 'text-indigo-600' },
  promotions: { name: 'Promotions', icon: Gift, color: 'text-green-600' },
  calendar: { name: 'Calendrier', icon: Calendar, color: 'text-blue-600' },
  marketing: { name: 'Marketing', icon: TrendingUp, color: 'text-teal-600' },
  communication: { name: 'Communication', icon: MessageSquare, color: 'text-red-600' },
  ecommerce: { name: 'E-commerce', icon: Package, color: 'text-green-700' },
  accounting: { name: 'Comptabilité', icon: FileText, color: 'text-blue-700' },
  reputation: { name: 'Réputation', icon: Globe, color: 'text-yellow-600' }
};

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/integrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Erreur chargement intégrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationStatus = (type: string) => {
    return integrations.find(i => i.type === type);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <Check className="w-3 h-3" /> Connecté
        </span>;
      case 'error':
        return <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
          <X className="w-3 h-3" /> Erreur
        </span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
          <AlertCircle className="w-3 h-3" /> Expiré
        </span>;
      default:
        return <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Non configuré
        </span>;
    }
  };

  const handleActivateIntegration = (type: string) => {
    if (type === 'stripe') {
      setShowStripeModal(true);
    } else {
      setSelectedIntegration(type);
    }
  };

  const handleSaveStripe = async (config: any) => {
    try {
      const response = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'stripe',
          enabled: true,
          config,
          displayName: 'Stripe',
          description: 'Paiements en ligne sécurisés'
        })
      });

      if (response.ok) {
        await fetchIntegrations();
        setShowStripeModal(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde Stripe:', error);
      throw error;
    }
  };

  const filteredIntegrations = selectedCategory === 'all'
    ? AVAILABLE_INTEGRATIONS
    : AVAILABLE_INTEGRATIONS.filter(i => i.category === selectedCategory);

  // Grouper par importance
  const essential = filteredIntegrations.filter(i => i.importance === 'essential');
  const important = filteredIntegrations.filter(i => i.importance === 'important');
  const useful = filteredIntegrations.filter(i => i.importance === 'useful');
  const bonus = filteredIntegrations.filter(i => i.importance === 'bonus');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Plug className="w-7 h-7" />
              Intégrations
            </h2>
            <p className="text-white/90">
              Connectez votre logiciel à vos outils préférés pour automatiser votre activité
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm text-white/80">Intégrations actives</p>
            <p className="text-2xl font-bold">{integrations.filter(i => i.enabled).length}</p>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const Icon = cat.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-[#d4b5a0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des intégrations */}
      <div className="space-y-6">
        {/* ESSENTIELLES */}
        {essential.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                ESSENTIEL
              </span>
              Incontournables pour votre activité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {essential.map((integration) => {
                const status = getIntegrationStatus(integration.type);
                const Icon = integration.icon;

                return (
                  <div
                    key={integration.type}
                    className="bg-white rounded-xl shadow-sm border-2 border-[#d4b5a0]/20 hover:border-[#d4b5a0] transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${integration.color} p-3 rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2c3e50]">{integration.name}</h4>
                          {status && getStatusBadge(status.status)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActivateIntegration(integration.type)}
                        className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors font-medium"
                      >
                        {status?.enabled ? 'Gérer' : 'Activer'}
                      </button>
                      <a
                        href={integration.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* IMPORTANTES */}
        {important.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded">
                IMPORTANT
              </span>
              Recommandées pour optimiser votre activité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {important.map((integration) => {
                const status = getIntegrationStatus(integration.type);
                const Icon = integration.icon;

                return (
                  <div
                    key={integration.type}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${integration.color} p-2.5 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-[#2c3e50]">{integration.name}</h4>
                        {status && getStatusBadge(status.status)}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-3">{integration.description}</p>

                    <button
                      onClick={() => handleActivateIntegration(integration.type)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-[#d4b5a0] hover:text-white transition-colors text-sm font-medium"
                    >
                      {status?.enabled ? 'Configurer' : 'Activer'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* UTILES + BONUS groupés */}
        {(useful.length > 0 || bonus.length > 0) && (
          <div>
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                BONUS
              </span>
              Fonctionnalités supplémentaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...useful, ...bonus].map((integration) => {
                const status = getIntegrationStatus(integration.type);
                const Icon = integration.icon;

                return (
                  <div
                    key={integration.type}
                    className="bg-white rounded-lg shadow-sm hover:shadow transition-all p-4 cursor-pointer"
                    onClick={() => handleActivateIntegration(integration.type)}
                  >
                    <div className={`${integration.color} p-2 rounded-lg w-fit mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-sm text-[#2c3e50] mb-1">{integration.name}</h4>
                    {status && getStatusBadge(status.status)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Stripe */}
      {showStripeModal && (
        <StripeConfigModal
          onClose={() => setShowStripeModal(false)}
          onSave={handleSaveStripe}
          existingConfig={integrations.find(i => i.type === 'stripe')?.config}
        />
      )}

      {/* Modal de configuration (autres intégrations) */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">Configuration de {selectedIntegration}</h3>
            <p className="text-gray-600 mb-4">
              La configuration détaillée pour cette intégration sera disponible prochainement.
            </p>
            <button
              onClick={() => setSelectedIntegration(null)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
