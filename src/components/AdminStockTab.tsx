"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit2, Save, X, Trash2, Package, AlertTriangle,
  Search, ExternalLink, Calendar, MapPin, DollarSign
} from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  initialQuantity?: number;
  minQuantity: number;
  unit?: string;
  cost?: number;
  supplier?: string;
  purchaseUrl?: string;
  reference?: string;
  barcode?: string;
  expiryDate?: Date | string;
  lastRestocked?: Date | string;
  location?: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  serviceLinks?: Array<{
    quantityPerUse: number;
    service: { name: string };
  }>;
}

export default function AdminStockTab() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetchStockItems();

    // Vérifier si on doit afficher le filtre stock bas
    const params = new URLSearchParams(window.location.search);
    if (params.get('lowStock') === 'true') {
      setShowLowStockOnly(true);
    }
  }, []);

  const fetchStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stock', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: StockItem) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const method = item.id && item.id !== 'new' ? 'PUT' : 'POST';
      const url = item.id && item.id !== 'new'
        ? `/api/admin/stock/${item.id}`
        : '/api/admin/stock';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        await fetchStockItems();
        setEditingItem(null);
        setShowNewItemForm(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/stock/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchStockItems();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleNewItem = () => {
    console.log('Bouton Nouvel Article cliqué');
    setEditingItem({
      id: 'new',
      name: '',
      quantity: 0,
      initialQuantity: 0,
      minQuantity: 5,
      active: true
    });
    setShowNewItemForm(true);
    console.log('Formulaire ouvert:', true);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setShowNewItemForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowNewItemForm(false);
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLowStock = !showLowStockOnly || item.quantity <= item.minQuantity;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = ['Consommables', 'Matériel', 'Produits de soin', 'Accessoires', 'Autre'];

  const lowStockItems = stockItems.filter(item => item.quantity <= item.minQuantity);

  // Calcul des totaux financiers
  const calculateTotals = () => {
    const totals = {
      all: 0,
      byCategory: {} as Record<string, number>
    };

    stockItems.forEach(item => {
      const itemTotal = (item.cost || 0) * item.quantity;
      totals.all += itemTotal;

      const category = item.category || 'Non catégorisé';
      if (!totals.byCategory[category]) {
        totals.byCategory[category] = 0;
      }
      totals.byCategory[category] += itemTotal;
    });

    return totals;
  };

  const totals = calculateTotals();
  const filteredTotals = filteredItems.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50]">Gestion des Stocks</h2>
          <p className="text-[#2c3e50]/60">Gérez vos consommables et votre matériel</p>
        </div>
        <button
          type="button"
          onClick={handleNewItem}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 relative z-20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nouvel Article
        </button>
      </div>

      {/* Statistiques Financières */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-purple-600" />
          Valeur Totale du Stock
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">Valeur Totale</p>
            <p className="text-2xl font-bold text-purple-600">
              {totals.all.toFixed(2)} €
            </p>
            <p className="text-xs text-gray-500 mt-1">{stockItems.length} articles</p>
          </div>

          {filterCategory !== 'all' && (
            <div className="bg-white rounded-lg p-4 shadow border-2 border-purple-300">
              <p className="text-sm text-gray-600 mb-1">Catégorie Sélectionnée</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredTotals.toFixed(2)} €
              </p>
              <p className="text-xs text-gray-500 mt-1">{filteredItems.length} articles</p>
            </div>
          )}

          <div
            className={`bg-white rounded-lg p-4 shadow cursor-pointer transition-all hover:shadow-lg ${
              showLowStockOnly ? 'border-2 border-red-400 ring-2 ring-red-200' : 'border-2 border-transparent'
            }`}
            onClick={() => {
              setShowLowStockOnly(!showLowStockOnly);
              setFilterCategory('all');
            }}
          >
            <p className="text-sm text-gray-600 mb-1 flex items-center justify-between">
              Stock Bas
              {showLowStockOnly && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Actif</span>}
            </p>
            <p className="text-2xl font-bold text-red-600">
              {lowStockItems.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">articles en alerte • Cliquez pour filtrer</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">Catégories</p>
            <p className="text-2xl font-bold text-blue-600">
              {Object.keys(totals.byCategory).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">catégories actives</p>
          </div>
        </div>

        {/* Détails par catégorie */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-[#2c3e50] mb-3">Répartition par Catégorie</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(totals.byCategory).map(([category, total]) => {
              const itemCount = stockItems.filter(item => (item.category || 'Non catégorisé') === category).length;
              return (
                <div
                  key={category}
                  className={`p-3 rounded-lg border-2 transition cursor-pointer hover:shadow-md ${
                    filterCategory === category
                      ? 'bg-purple-100 border-purple-400'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setFilterCategory(filterCategory === category ? 'all' : category)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#2c3e50]">{category}</p>
                      <p className="text-xs text-gray-600">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
                    </div>
                    <p className="font-bold text-purple-600">{total.toFixed(2)} €</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && !showLowStockOnly && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => setShowLowStockOnly(true)}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Stock bas</h3>
              <p className="text-sm text-red-700">
                {lowStockItems.length} article(s) en dessous du seuil d'alerte • Cliquez pour voir le détail
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active filter badge */}
      {showLowStockOnly && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Filtre : Stock bas actif</h3>
                <p className="text-sm text-red-700">
                  Affichage de {filteredItems.length} article(s) en stock bas
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLowStockOnly(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Afficher tous les produits
            </button>
          </div>
        </div>
      )}

      {/* Save Status */}
      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✓ Article enregistré avec succès
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ✗ Erreur lors de l'enregistrement
        </div>
      )}

      {/* Edit/New Form */}
      {showNewItemForm && editingItem && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#2c3e50]">
              {editingItem.id === 'new' ? 'Nouvel Article' : 'Modifier l\'Article'}
            </h3>
            <button onClick={handleCancelEdit} className="text-[#2c3e50]/60 hover:text-[#2c3e50]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Nom de l'article *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Sérum vitamine C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Catégorie
                </label>
                <select
                  value={editingItem.category || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Description
              </label>
              <textarea
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Description de l'article"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Quantité actuelle *
                </label>
                <input
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Quantité initiale
                </label>
                <input
                  type="number"
                  value={editingItem.initialQuantity || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, initialQuantity: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Stock de départ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Seuil d'alerte
                </label>
                <input
                  type="number"
                  value={editingItem.minQuantity}
                  onChange={(e) => setEditingItem({ ...editingItem, minQuantity: parseInt(e.target.value) || 5 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Unité
                </label>
                <input
                  type="text"
                  value={editingItem.unit || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ml, g, pièce..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Prix d'achat (€)
                </label>
                <input
                  type="number"
                  value={editingItem.cost || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, cost: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={editingItem.supplier || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nom du fournisseur"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Lien d'achat (URL)
              </label>
              <input
                type="url"
                value={editingItem.purchaseUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, purchaseUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Pour racheter facilement l'article
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  value={editingItem.reference || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Référence produit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Emplacement
                </label>
                <input
                  type="text"
                  value={editingItem.location || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Étagère, tiroir..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Notes
              </label>
              <textarea
                value={editingItem.notes || ''}
                onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Notes supplémentaires"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingItem.active}
                onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-[#2c3e50]">Article actif</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              className="px-6 py-2 border border-gray-300 text-[#2c3e50] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSaveItem(editingItem)}
              disabled={saveStatus === 'saving'}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!showNewItemForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2c3e50]/40 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un article..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Stock List */}
      {!showNewItemForm && (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Package className="w-16 h-16 mx-auto text-[#2c3e50]/20 mb-4" />
              <p className="text-[#2c3e50]/60">
                {searchTerm || filterCategory !== 'all'
                  ? 'Aucun article ne correspond à vos critères'
                  : 'Aucun article en stock'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                  item.quantity <= item.minQuantity ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#2c3e50]">{item.name}</h3>
                        {item.category && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                            {item.category}
                          </span>
                        )}
                        {item.quantity <= item.minQuantity && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Stock bas
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[#2c3e50]/60 text-sm mb-3">{item.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Quantité:</span>
                          <p className="font-medium text-[#2c3e50]">
                            {item.initialQuantity
                              ? `${item.quantity} sur ${item.initialQuantity} ${item.unit || 'unités'}`
                              : `${item.quantity} ${item.unit || 'unité(s)'}`
                            }
                          </p>
                          {item.serviceLinks && item.serviceLinks.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {item.serviceLinks.map((link, linkIndex) => {
                                const soinsRestants = Math.floor(item.quantity / link.quantityPerUse);
                                return (
                                  <div key={linkIndex}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-purple-600">
                                        {soinsRestants} soins restants
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {link.service.name}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full transition-all ${
                                          item.initialQuantity
                                            ? (item.quantity / item.initialQuantity) * 100 <= 25
                                              ? 'bg-red-500'
                                              : (item.quantity / item.initialQuantity) * 100 <= 50
                                              ? 'bg-orange-500'
                                              : 'bg-green-500'
                                            : soinsRestants <= 5
                                            ? 'bg-red-500'
                                            : soinsRestants <= 10
                                            ? 'bg-orange-500'
                                            : 'bg-green-500'
                                        }`}
                                        style={{
                                          width: item.initialQuantity
                                            ? `${Math.min((item.quantity / item.initialQuantity) * 100, 100)}%`
                                            : `${Math.min((soinsRestants / 20) * 100, 100)}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {!item.serviceLinks?.length && item.initialQuantity && item.initialQuantity > 0 && (
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  (item.quantity / item.initialQuantity) * 100 <= 25
                                    ? 'bg-red-500'
                                    : (item.quantity / item.initialQuantity) * 100 <= 50
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((item.quantity / item.initialQuantity) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {item.cost && (
                          <div>
                            <span className="text-gray-500">Prix d'achat:</span>
                            <p className="font-medium text-[#2c3e50]">{item.cost}€</p>
                          </div>
                        )}
                        {item.supplier && (
                          <div>
                            <span className="text-gray-500">Fournisseur:</span>
                            <p className="font-medium text-[#2c3e50]">{item.supplier}</p>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-[#2c3e50]">{item.location}</p>
                          </div>
                        )}
                      </div>

                      {item.purchaseUrl && (
                        <div className="mt-3">
                          <a
                            href={item.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Lien de rachat
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
