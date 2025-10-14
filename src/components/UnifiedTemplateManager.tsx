'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Copy, Search, Filter,
  MessageCircle, Mail, Zap, Check, X, Save, Eye, Code,
  Tag, Star, Clock, Calendar, User, Gift, Target, Sparkles
} from 'lucide-react';

export interface UnifiedTemplate {
  id: string;
  name: string;
  subject?: string;
  content: string;
  category: string;
  usageTypes: ('conversation' | 'campaign' | 'automation')[];
  variables?: string[];
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  favorite?: boolean;
  description?: string;
}

interface UnifiedTemplateManagerProps {
  mode?: 'full' | 'selector'; // full = gestionnaire complet, selector = sélecteur rapide
  filterUsage?: 'conversation' | 'campaign' | 'automation'; // Filtre pré-appliqué
  onSelect?: (template: UnifiedTemplate) => void; // Callback quand on sélectionne un template
  onClose?: () => void; // Pour fermer le sélecteur
}

export default function UnifiedTemplateManager({
  mode = 'full',
  filterUsage,
  onSelect,
  onClose
}: UnifiedTemplateManagerProps) {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<UnifiedTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsageFilter, setSelectedUsageFilter] = useState<'all' | 'conversation' | 'campaign' | 'automation'>(
    filterUsage || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UnifiedTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<UnifiedTemplate | null>(null);

  // Templates par défaut
  const defaultTemplates: UnifiedTemplate[] = [
    {
      id: '1',
      name: 'Bienvenue nouveau client',
      subject: '🌟 Bienvenue chez LAIA SKIN Institut',
      content: `Bonjour {clientName},

Je suis ravie de vous compter parmi mes clientes !

Votre peau mérite le meilleur, et je suis là pour vous accompagner dans votre parcours beauté.

✨ Profitez de -15% sur votre première visite avec le code BIENVENUE15

📅 Réservez votre premier soin : laiaskin.com

À très bientôt,
Laïa`,
      category: 'Onboarding',
      usageTypes: ['conversation', 'automation'],
      variables: ['{clientName}'],
      createdAt: new Date('2024-01-15'),
      tags: ['bienvenue', 'nouveau client'],
      favorite: true,
      description: 'Message de bienvenue chaleureux pour nouveaux clients'
    },
    {
      id: '2',
      name: 'Rappel RDV 24h',
      subject: '📅 Rappel : Votre RDV demain chez LAIA SKIN',
      content: `Bonjour {clientName},

Je vous attends demain à {appointmentTime} pour votre soin {serviceName}.

📍 LAIA SKIN Institut
💆 Durée : {duration}
💰 Prix : {price}€

Pour toute modification : 06 12 34 56 78

À demain ! 💕
Laïa`,
      category: 'Rappels',
      usageTypes: ['automation'],
      variables: ['{clientName}', '{appointmentTime}', '{serviceName}', '{duration}', '{price}'],
      createdAt: new Date('2024-02-01'),
      tags: ['rappel', 'rdv'],
      favorite: true,
      description: 'Rappel automatique 24h avant un RDV'
    },
    {
      id: '3',
      name: 'Promo Été - Soins Hydratants',
      subject: '☀️ Offre Été : -30% sur les soins hydratants !',
      content: `Bonjour {clientName},

L'été arrive, prenez soin de votre peau ! 🌞

🎁 OFFRE SPÉCIALE ÉTÉ 🎁
-30% sur tous les soins hydratants jusqu'au {endDate}

✨ Hydro'Naissance : 63€ au lieu de 90€
✨ Hydro'Cleaning : 49€ au lieu de 70€
✨ Pack Hydratation Complète : 99€ au lieu de 150€

📅 Réservez vite : laiaskin.com

Belle journée ensoleillée ! ☀️
Laïa`,
      category: 'Promotions',
      usageTypes: ['campaign'],
      variables: ['{clientName}', '{endDate}'],
      createdAt: new Date('2024-05-15'),
      tags: ['promo', 'été', 'hydratation'],
      favorite: false,
      description: 'Campagne promotionnelle pour l\'été'
    },
    {
      id: '4',
      name: 'Joyeux Anniversaire VIP',
      subject: '🎂 Joyeux anniversaire {clientName} !',
      content: `🎂 Joyeux anniversaire {clientName} ! 🎉

Pour célébrer votre jour spécial, je vous offre :

🎁 -30% sur tous les soins
🥂 Une coupe de champagne offerte
💎 Un soin LED OFFERT (valeur 60€)

Offre valable tout le mois de {month} !

Réservez votre moment détente : 06 12 34 56 78

Profitez bien de votre journée ! 💕
Laïa`,
      category: 'Fidélisation',
      usageTypes: ['conversation', 'campaign', 'automation'],
      variables: ['{clientName}', '{month}'],
      createdAt: new Date('2024-03-10'),
      tags: ['anniversaire', 'vip', 'fidélité'],
      favorite: true,
      description: 'Message d\'anniversaire pour clients VIP'
    },
    {
      id: '5',
      name: 'Suivi post-soin',
      subject: 'Comment se porte votre peau ? 😊',
      content: `Bonjour {clientName},

J'espère que vous êtes satisfaite de votre {serviceName} ! 😊

💡 Conseils post-soin :
✅ Hydratez bien votre peau matin et soir
✅ Protection SPF50 obligatoire
✅ Évitez le maquillage pendant 24h

N'hésitez pas à me contacter si vous avez des questions.

Prenez soin de vous ! 💕
Laïa`,
      category: 'Suivi',
      usageTypes: ['conversation', 'automation'],
      variables: ['{clientName}', '{serviceName}'],
      createdAt: new Date('2024-04-05'),
      tags: ['suivi', 'conseils'],
      favorite: false,
      description: 'Suivi personnalisé après un soin'
    },
    {
      id: '6',
      name: 'Demande avis Google',
      subject: 'Votre avis compte énormément ! ⭐',
      content: `Bonjour {clientName},

J'espère que les résultats de votre {serviceName} vous ravissent !

Votre satisfaction est ma priorité 💕

Pourriez-vous prendre 2 minutes pour partager votre expérience sur Google ? Cela m'aide énormément !

⭐ Laisser un avis : {googleReviewLink}

Merci infiniment pour votre soutien !

À bientôt,
Laïa`,
      category: 'Avis',
      usageTypes: ['automation'],
      variables: ['{clientName}', '{serviceName}', '{googleReviewLink}'],
      createdAt: new Date('2024-06-20'),
      tags: ['avis', 'google', 'feedback'],
      favorite: true,
      description: 'Demande d\'avis Google après un soin'
    }
  ];

  useEffect(() => {
    // Charger les templates (pour l'instant templates par défaut, à remplacer par API)
    setTemplates(defaultTemplates);
  }, []);

  useEffect(() => {
    // Filtrer les templates
    let filtered = [...templates];

    // Filtre par usage
    if (selectedUsageFilter !== 'all') {
      filtered = filtered.filter(t => t.usageTypes.includes(selectedUsageFilter));
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filtre favoris
    if (showOnlyFavorites) {
      filtered = filtered.filter(t => t.favorite);
    }

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedUsageFilter, selectedCategory, showOnlyFavorites, searchQuery]);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const getUsageIcon = (usage: string) => {
    switch (usage) {
      case 'conversation': return <MessageCircle className="w-3 h-3" />;
      case 'campaign': return <Mail className="w-3 h-3" />;
      case 'automation': return <Zap className="w-3 h-3" />;
      default: return null;
    }
  };

  const getUsageLabel = (usage: string) => {
    switch (usage) {
      case 'conversation': return 'Conversation';
      case 'campaign': return 'Campagne';
      case 'automation': return 'Automatisation';
      default: return usage;
    }
  };

  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, favorite: !t.favorite } : t
    ));
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Supprimer ce template ?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const duplicateTemplate = (template: UnifiedTemplate) => {
    const newTemplate: UnifiedTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (copie)`,
      createdAt: new Date()
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className={mode === 'full' ? 'bg-white rounded-xl shadow-lg p-6' : 'bg-white rounded-xl p-4'}>
      {/* Header */}
      {mode === 'full' && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-indigo-500" />
              Gestionnaire de Templates
            </h2>
            <p className="text-gray-600 mt-1">
              Créez et gérez vos templates pour conversations, campagnes et automatisations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau template
          </button>
        </div>
      )}

      {mode === 'selector' && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Sélectionner un template</h3>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un template..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap gap-2">
          {/* Filtre par usage */}
          {!filterUsage && (
            <>
              <button
                onClick={() => setSelectedUsageFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedUsageFilter === 'all'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedUsageFilter('conversation')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedUsageFilter === 'conversation'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Conversations
              </button>
              <button
                onClick={() => setSelectedUsageFilter('campaign')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedUsageFilter === 'campaign'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mail className="w-4 h-4" />
                Campagnes
              </button>
              <button
                onClick={() => setSelectedUsageFilter('automation')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedUsageFilter === 'automation'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                Automatisations
              </button>
            </>
          )}

          {/* Séparateur */}
          {!filterUsage && <div className="border-l border-gray-300 mx-2"></div>}

          {/* Filtre favoris */}
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              showOnlyFavorites
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className={showOnlyFavorites ? 'w-4 h-4 fill-current' : 'w-4 h-4'} />
            Favoris
          </button>
        </div>

        {/* Filtre par catégorie */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Toutes catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-indigo-900">{templates.length}</div>
          <div className="text-xs text-indigo-700">Templates total</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-900">
            {templates.filter(t => t.usageTypes.includes('conversation')).length}
          </div>
          <div className="text-xs text-green-700">Conversations</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-900">
            {templates.filter(t => t.usageTypes.includes('campaign')).length}
          </div>
          <div className="text-xs text-blue-700">Campagnes</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-900">
            {templates.filter(t => t.usageTypes.includes('automation')).length}
          </div>
          <div className="text-xs text-yellow-700">Automatisations</div>
        </div>
      </div>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => {
              if (mode === 'selector' && onSelect) {
                onSelect(template);
              }
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {template.name}
                  {template.favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                </h3>
                {template.description && (
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                )}
              </div>
              {mode === 'full' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Star className={`w-4 h-4 ${template.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                </button>
              )}
            </div>

            {/* Usage types */}
            <div className="flex flex-wrap gap-1 mb-2">
              {template.usageTypes.map(usage => (
                <span
                  key={usage}
                  className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                    usage === 'conversation' ? 'bg-green-100 text-green-700' :
                    usage === 'campaign' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {getUsageIcon(usage)}
                  {getUsageLabel(usage)}
                </span>
              ))}
            </div>

            {/* Catégorie et tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {template.category}
              </span>
              {template.tags?.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Aperçu contenu */}
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {template.content}
            </p>

            {/* Variables */}
            {template.variables && template.variables.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Variables :</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map(variable => (
                    <code key={variable} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {variable}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {mode === 'full' && (
              <div className="flex items-center gap-2 pt-3 border-t">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template);
                  }}
                  className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  Aperçu
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTemplate(template);
                  }}
                  className="flex-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTemplate(template);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                  className="p-1.5 hover:bg-red-50 rounded"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}

            {mode === 'selector' && (
              <button
                onClick={() => onSelect && onSelect(template)}
                className="w-full mt-3 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Utiliser ce template
              </button>
            )}
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun template trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos filtres ou créez un nouveau template
            </p>
            {mode === 'full' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600"
              >
                Créer un template
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {previewTemplate.subject && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Objet :</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{previewTemplate.subject}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Contenu :</p>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-900">
                  {previewTemplate.content}
                </div>
              </div>

              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Variables disponibles :</p>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.variables.map(variable => (
                      <code key={variable} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                        {variable}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
