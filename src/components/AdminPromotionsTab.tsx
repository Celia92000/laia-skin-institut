'use client';

import { useState, useEffect } from 'react';
import {
  Tag, Plus, Edit2, Trash2, Calendar, Euro, Percent, Users,
  Gift, Star, TrendingUp, Clock, CheckCircle, XCircle, Copy,
  AlertCircle, Download, Upload, Filter, Search, MoreVertical, X
} from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'gift';
  value: number;
  minPurchase?: number;
  code?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'draft';
  usageCount: number;
  usageLimit?: number;
  targetAudience: 'all' | 'new' | 'vip' | 'birthday' | 'custom';
  applicableServices: string[];
  createdAt: string;
}

export default function AdminPromotionsTab() {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Bienvenue -15%',
      description: 'Remise de bienvenue pour les nouveaux clients',
      type: 'percentage',
      value: 15,
      code: 'WELCOME15',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active',
      usageCount: 12,
      targetAudience: 'new',
      applicableServices: ['all'],
      createdAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Black Friday -30%',
      description: 'Promotion exceptionnelle Black Friday',
      type: 'percentage',
      value: 30,
      minPurchase: 100,
      code: 'BLACK30',
      startDate: '2025-11-24',
      endDate: '2025-11-27',
      status: 'scheduled',
      usageCount: 0,
      usageLimit: 100,
      targetAudience: 'all',
      applicableServices: ['all'],
      createdAt: '2025-01-15'
    },
    {
      id: '3',
      name: 'Fidélité VIP',
      description: '20€ offerts pour nos clients VIP',
      type: 'fixed',
      value: 20,
      minPurchase: 80,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active',
      usageCount: 8,
      targetAudience: 'vip',
      applicableServices: ['all'],
      createdAt: '2025-01-01'
    },
    {
      id: '4',
      name: 'Anniversaire -10%',
      description: 'Offre spéciale anniversaire',
      type: 'percentage',
      value: 10,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active',
      usageCount: 45,
      targetAudience: 'birthday',
      applicableServices: ['all'],
      createdAt: '2025-01-01'
    }
  ]);

  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'scheduled' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    applicableServices: ['all']
  });

  const createPromotion = () => {
    const promotion: Promotion = {
      id: Date.now().toString(),
      ...newPromotion as any,
      status: 'draft',
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setPromotions([...promotions, promotion]);
    setShowNewPromotion(false);
    setNewPromotion({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      startDate: '',
      endDate: '',
      targetAudience: 'all',
      applicableServices: ['all']
    });
  };

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const deletePromotion = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  const duplicatePromotion = (promotion: Promotion) => {
    const newPromo = {
      ...promotion,
      id: Date.now().toString(),
      name: `${promotion.name} (copie)`,
      code: promotion.code ? `${promotion.code}_COPY` : undefined,
      status: 'draft' as const,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    setPromotions([...promotions, newPromo]);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <Euro className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const filteredPromotions = promotions
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Statistiques
  const stats = {
    active: promotions.filter(p => p.status === 'active').length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usageCount, 0),
    revenue: promotions.reduce((sum, p) => {
      const value = p.type === 'fixed' ? p.value : (p.minPurchase || 100) * p.value / 100;
      return sum + (value * p.usageCount);
    }, 0)
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Promotions & Offres</h2>
            <p className="text-gray-600 mt-1">Gérez vos codes promos et offres spéciales</p>
          </div>
          <button
            onClick={() => setShowNewPromotion(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle promotion
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promotions actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisations totales</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsage}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Économies clients</p>
                <p className="text-2xl font-bold text-purple-600">{stats.revenue.toFixed(0)}€</p>
              </div>
              <Euro className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une promotion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Toutes</option>
            <option value="active">Actives</option>
            <option value="scheduled">Programmées</option>
            <option value="expired">Expirées</option>
          </select>
        </div>
      </div>

      {/* Liste des promotions */}
      <div className="grid gap-4">
        {filteredPromotions.map((promotion) => (
          <div key={promotion.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{promotion.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                    {promotion.status === 'active' ? 'Active' :
                     promotion.status === 'scheduled' ? 'Programmée' :
                     promotion.status === 'expired' ? 'Expirée' : 'Brouillon'}
                  </span>
                  {promotion.code && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                      <Tag className="w-3 h-3" />
                      <span className="font-mono text-sm">{promotion.code}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(promotion.code || '')}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{promotion.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(promotion.type)}
                    <span>
                      {promotion.type === 'percentage' ? `${promotion.value}%` :
                       promotion.type === 'fixed' ? `${promotion.value}€` :
                       promotion.type === 'bogo' ? '1 acheté = 1 offert' : 'Cadeau'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(promotion.startDate).toLocaleDateString('fr-FR')} - 
                      {new Date(promotion.endDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {promotion.usageCount} utilisations
                      {promotion.usageLimit && ` / ${promotion.usageLimit}`}
                    </span>
                  </div>
                  
                  {promotion.minPurchase && (
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Min. {promotion.minPurchase}€</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => updatePromotion(promotion.id, { 
                    status: promotion.status === 'active' ? 'draft' : 'active' 
                  })}
                  className={`px-3 py-1 rounded ${
                    promotion.status === 'active' 
                      ? 'bg-gray-200 hover:bg-gray-300' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {promotion.status === 'active' ? 'Désactiver' : 'Activer'}
                </button>
                
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-10 hidden group-hover:block bg-white border rounded-lg shadow-lg z-10 w-48">
                    <button
                      onClick={() => setEditingPromotion(promotion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => duplicatePromotion(promotion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Dupliquer
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => deletePromotion(promotion.id)}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal nouvelle promotion */}
      {showNewPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Nouvelle promotion</h3>
                <button
                  onClick={() => setShowNewPromotion(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom de la promotion</label>
                  <input
                    type="text"
                    value={newPromotion.name}
                    onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Offre de printemps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newPromotion.description}
                    onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Description de la promotion"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={newPromotion.type}
                      onChange={(e) => setNewPromotion({...newPromotion, type: e.target.value as any})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                      <option value="bogo">1 acheté = 1 offert</option>
                      <option value="gift">Cadeau</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {newPromotion.type === 'percentage' ? 'Réduction (%)' : 'Valeur (€)'}
                    </label>
                    <input
                      type="number"
                      value={newPromotion.value}
                      onChange={(e) => setNewPromotion({...newPromotion, value: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code promo (optionnel)</label>
                  <input
                    type="text"
                    value={newPromotion.code}
                    onChange={(e) => setNewPromotion({...newPromotion, code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
                    placeholder="CODE2025"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date de début</label>
                    <input
                      type="date"
                      value={newPromotion.startDate}
                      onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date de fin</label>
                    <input
                      type="date"
                      value={newPromotion.endDate}
                      onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Audience cible</label>
                  <select
                    value={newPromotion.targetAudience}
                    onChange={(e) => setNewPromotion({...newPromotion, targetAudience: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">Tous les clients</option>
                    <option value="new">Nouveaux clients</option>
                    <option value="vip">Clients VIP</option>
                    <option value="birthday">Anniversaires</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Achat minimum (€)</label>
                    <input
                      type="number"
                      value={newPromotion.minPurchase || ''}
                      onChange={(e) => setNewPromotion({...newPromotion, minPurchase: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Limite d'utilisation</label>
                    <input
                      type="number"
                      value={newPromotion.usageLimit || ''}
                      onChange={(e) => setNewPromotion({...newPromotion, usageLimit: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Illimité"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewPromotion(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={createPromotion}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Créer la promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}