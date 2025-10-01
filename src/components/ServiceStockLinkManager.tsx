'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, AlertTriangle, PackagePlus } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit?: string;
}

interface ServiceStockLink {
  id?: string;
  stockId: string;
  stockName?: string;
  quantityPerUse: number;
  unit?: string;
}

interface ServiceStockLinkManagerProps {
  serviceId: string;
  onLinksChange?: (links: ServiceStockLink[]) => void;
}

export default function ServiceStockLinkManager({ serviceId, onLinksChange }: ServiceStockLinkManagerProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [serviceLinks, setServiceLinks] = useState<ServiceStockLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantityPerUse, setQuantityPerUse] = useState(1);
  const [showNewStockForm, setShowNewStockForm] = useState(false);
  const [newStock, setNewStock] = useState({
    name: '',
    quantity: 0,
    minQuantity: 5,
    unit: 'ml',
    category: 'Consommables'
  });

  useEffect(() => {
    loadStockItems();
    if (serviceId && serviceId !== 'new') {
      loadServiceLinks();
    } else {
      setLoading(false);
    }
  }, [serviceId]);

  const loadStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stock', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStockItems(data.filter((item: StockItem) => item.quantity > 0)); // Seulement les items en stock
      }
    } catch (error) {
      console.error('Erreur lors du chargement des consommables:', error);
    }
  };

  const loadServiceLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/services/${serviceId}/stock-links`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServiceLinks(data);
        onLinksChange?.(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des liens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!selectedStockId || quantityPerUse <= 0) {
      alert('Veuillez sélectionner un consommable et entrer une quantité valide');
      return;
    }

    // Vérifier si le consommable est déjà lié
    if (serviceLinks.some(link => link.stockId === selectedStockId)) {
      alert('Ce consommable est déjà lié à cette prestation');
      return;
    }

    const selectedStock = stockItems.find(item => item.id === selectedStockId);
    if (!selectedStock) return;

    const newLink: ServiceStockLink = {
      stockId: selectedStockId,
      stockName: selectedStock.name,
      quantityPerUse,
      unit: selectedStock.unit
    };

    try {
      if (serviceId && serviceId !== 'new') {
        // Sauvegarder en base si le service existe déjà
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/services/${serviceId}/stock-links`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newLink)
        });

        if (response.ok) {
          await loadServiceLinks();
        }
      } else {
        // Stocker temporairement si c'est un nouveau service
        const updated = [...serviceLinks, newLink];
        setServiceLinks(updated);
        onLinksChange?.(updated);
      }

      setSelectedStockId('');
      setQuantityPerUse(1);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lien:', error);
    }
  };

  const handleDeleteLink = async (linkId?: string, stockId?: string) => {
    try {
      if (linkId && serviceId !== 'new') {
        // Supprimer de la base si le lien existe
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/services/${serviceId}/stock-links/${linkId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await loadServiceLinks();
        }
      } else {
        // Supprimer localement pour les nouveaux services
        const updated = serviceLinks.filter(link => link.stockId !== stockId);
        setServiceLinks(updated);
        onLinksChange?.(updated);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du lien:', error);
    }
  };

  const calculateRemainingUses = (stock: StockItem, link: ServiceStockLink) => {
    return Math.floor(stock.quantity / link.quantityPerUse);
  };

  const handleCreateNewStock = async () => {
    if (!newStock.name || newStock.quantity <= 0) {
      alert('Veuillez remplir au moins le nom et la quantité');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newStock,
          initialQuantity: newStock.quantity,
          active: true
        })
      });

      if (response.ok) {
        const createdStock = await response.json();
        await loadStockItems();
        setShowNewStockForm(false);
        setNewStock({
          name: '',
          quantity: 0,
          minQuantity: 5,
          unit: 'ml',
          category: 'Consommables'
        });
        // Sélectionner automatiquement le nouveau produit
        setSelectedStockId(createdStock.id);
      } else {
        alert('Erreur lors de la création du consommable');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du consommable');
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Consommables utilisés pour cette prestation
        </h4>
        <p className="text-sm text-blue-700 mb-4">
          Définissez quels consommables sont utilisés et en quelle quantité. Le stock sera automatiquement diminué après chaque rendez-vous.
        </p>

        {/* Bouton créer nouveau consommable */}
        {!showNewStockForm && (
          <button
            type="button"
            onClick={() => setShowNewStockForm(true)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <PackagePlus className="w-4 h-4" />
            Créer un nouveau consommable
          </button>
        )}

        {/* Formulaire création nouveau consommable */}
        {showNewStockForm && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-semibold text-green-900">Nouveau consommable</h5>
              <button
                type="button"
                onClick={() => setShowNewStockForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={newStock.name}
                onChange={(e) => setNewStock({...newStock, name: e.target.value})}
                placeholder="Nom du consommable *"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <select
                value={newStock.category}
                onChange={(e) => setNewStock({...newStock, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Consommables">Consommables</option>
                <option value="Matériel">Matériel</option>
                <option value="Produits de soin">Produits de soin</option>
                <option value="Accessoires">Accessoires</option>
              </select>
              <input
                type="number"
                value={newStock.quantity}
                onChange={(e) => setNewStock({...newStock, quantity: parseFloat(e.target.value) || 0})}
                placeholder="Quantité *"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={newStock.unit}
                onChange={(e) => setNewStock({...newStock, unit: e.target.value})}
                placeholder="Unité (ml, L, g...)"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateNewStock}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Créer et utiliser
              </button>
              <button
                type="button"
                onClick={() => setShowNewStockForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            value={selectedStockId}
            onChange={(e) => setSelectedStockId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un consommable</option>
            {stockItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.quantity} {item.unit || 'unités'} disponible{item.quantity > 1 ? 's' : ''})
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.1"
            min="0.1"
            value={quantityPerUse}
            onChange={(e) => setQuantityPerUse(parseFloat(e.target.value))}
            placeholder="Quantité par prestation"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleAddLink}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Liste des consommables liés */}
        {serviceLinks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Aucun consommable lié pour le moment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {serviceLinks.map((link, index) => {
              const stockItem = stockItems.find(s => s.id === link.stockId);
              const remainingUses = stockItem ? calculateRemainingUses(stockItem, link) : 0;
              const isLowStock = remainingUses < 5;

              return (
                <div
                  key={link.id || index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isLowStock ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {link.stockName || stockItem?.name}
                      </span>
                      {isLowStock && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>Consomme : {link.quantityPerUse} {link.unit || stockItem?.unit || 'unités'} par prestation</span>
                      {stockItem && (
                        <span className={`ml-3 ${isLowStock ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          ≈ {remainingUses} prestations restantes
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLink(link.id, link.stockId)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {serviceId === 'new' && serviceLinks.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Les consommables seront liés à cette prestation après l'enregistrement.
          </p>
        </div>
      )}
    </div>
  );
}
