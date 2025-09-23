"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Save, X, Trash2, Eye, EyeOff, Package, 
  Clock, Euro, Tag, Search, Upload, ChevronUp, ChevronDown,
  AlertTriangle, Box, DollarSign, Hash, Archive
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  stockAlert?: number;
  category?: string;
  brand?: string;
  supplier?: string;
  mainImage?: string;
  gallery?: string;
  weight?: number;
  dimensions?: string;
  ingredients?: string;
  usage?: string;
  benefits?: string;
  active: boolean;
  featured: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'stock' | 'media' | 'details'>('general');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const method = product.id && product.id !== 'new' ? 'PUT' : 'POST';
      const url = product.id && product.id !== 'new' 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        await fetchProducts();
        setEditingProduct(null);
        setShowNewProductForm(false);
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

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await fetchProducts();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const toggleProductExpansion = (id: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProducts(newExpanded);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const newProduct: Product = {
    id: 'new',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    stockAlert: 5,
    active: true,
    featured: false,
    order: products.length
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Gestion des Produits</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {products.length} produits
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Barre de recherche */}
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Filtre par catégorie */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Bouton nouveau produit */}
            <button
              onClick={() => {
                setEditingProduct(newProduct);
                setShowNewProductForm(true);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau produit
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Produits actifs</p>
            <p className="text-xl font-bold text-green-600">
              {products.filter(p => p.active).length}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Valeur stock</p>
            <p className="text-xl font-bold text-blue-600">
              {products.reduce((sum, p) => sum + (p.stock * p.price), 0).toFixed(0)}€
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Stock faible</p>
            <p className="text-xl font-bold text-yellow-600">
              {products.filter(p => p.stock <= (p.stockAlert || 5)).length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">En promotion</p>
            <p className="text-xl font-bold text-purple-600">
              {products.filter(p => p.salePrice && p.salePrice < p.price).length}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Rupture stock</p>
            <p className="text-xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="divide-y">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Image produit */}
                  {product.mainImage ? (
                    <img 
                      src={product.mainImage} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {product.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          En vedette
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          Rupture
                        </span>
                      )}
                      {product.stock > 0 && product.stock <= (product.stockAlert || 5) && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          Stock faible
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.shortDescription || product.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        SKU: {product.sku || 'Non défini'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: <span className={product.stock === 0 ? 'text-red-600 font-bold' : ''}>{product.stock}</span>
                      </span>
                      <span className="text-sm">
                        Prix: {product.salePrice ? (
                          <>
                            <span className="line-through text-gray-400">{product.price}€</span>
                            <span className="text-green-600 font-bold ml-1">{product.salePrice}€</span>
                          </>
                        ) : (
                          <span className="font-bold">{product.price}€</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleProductExpansion(product.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedProducts.has(product.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const updatedProduct = { ...product, active: !product.active };
                      handleSaveProduct(updatedProduct);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      product.active 
                        ? 'hover:bg-green-50 text-green-600' 
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    {product.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Détails étendus */}
              {expandedProducts.has(product.id) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Catégorie</p>
                      <p className="font-semibold">{product.category || 'Non catégorisé'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Marque</p>
                      <p className="font-semibold">{product.brand || 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Fournisseur</p>
                      <p className="font-semibold">{product.supplier || 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Code-barres</p>
                      <p className="font-semibold">{product.barcode || 'Non défini'}</p>
                    </div>
                  </div>
                  {product.ingredients && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">Ingrédients</p>
                      <p className="text-sm mt-1">{product.ingredients}</p>
                    </div>
                  )}
                  {product.benefits && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">Bénéfices</p>
                      <p className="text-sm mt-1">{product.benefits}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire d'édition/création */}
      {(editingProduct || showNewProductForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingProduct?.id === 'new' ? 'Nouveau produit' : 'Modifier le produit'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowNewProductForm(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Onglets */}
              <div className="flex gap-2 mb-6 border-b">
                {(['general', 'stock', 'media', 'details'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'general' && 'Général'}
                    {tab === 'stock' && 'Stock & Prix'}
                    {tab === 'media' && 'Médias'}
                    {tab === 'details' && 'Détails'}
                  </button>
                ))}
              </div>

              {/* Contenu des onglets */}
              <div className="space-y-4">
                {activeTab === 'general' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom du produit *</label>
                      <input
                        type="text"
                        value={editingProduct?.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Description courte</label>
                      <input
                        type="text"
                        value={editingProduct?.shortDescription || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, shortDescription: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Description complète</label>
                      <textarea
                        value={editingProduct?.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Catégorie</label>
                        <input
                          type="text"
                          value={editingProduct?.category || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: Soins visage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Marque</label>
                        <input
                          type="text"
                          value={editingProduct?.brand || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, brand: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct?.active || false}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, active: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Produit actif</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct?.featured || false}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, featured: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Mettre en vedette</span>
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'stock' && (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Prix normal *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct?.price || 0}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, price: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Prix promotionnel</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct?.salePrice || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Prix d'achat</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct?.cost || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock actuel *</label>
                        <input
                          type="number"
                          value={editingProduct?.stock || 0}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Alerte stock faible</label>
                        <input
                          type="number"
                          value={editingProduct?.stockAlert || 5}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, stockAlert: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">SKU</label>
                        <input
                          type="text"
                          value={editingProduct?.sku || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, sku: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Code-barres</label>
                        <input
                          type="text"
                          value={editingProduct?.barcode || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, barcode: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Fournisseur</label>
                      <input
                        type="text"
                        value={editingProduct?.supplier || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, supplier: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'media' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image principale (URL)</label>
                      <input
                        type="text"
                        value={editingProduct?.mainImage || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, mainImage: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Galerie (URLs séparées par des virgules)</label>
                      <textarea
                        value={editingProduct?.gallery || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, gallery: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        placeholder="https://image1.jpg, https://image2.jpg"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'details' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ingrédients</label>
                      <textarea
                        value={editingProduct?.ingredients || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, ingredients: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Mode d'utilisation</label>
                      <textarea
                        value={editingProduct?.usage || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, usage: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Bénéfices</label>
                      <textarea
                        value={editingProduct?.benefits || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, benefits: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Poids (g)</label>
                        <input
                          type="number"
                          value={editingProduct?.weight || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Dimensions</label>
                        <input
                          type="text"
                          value={editingProduct?.dimensions || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, dimensions: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ex: 10x5x3 cm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                      <input
                        type="number"
                        value={editingProduct?.order || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, order: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                {saveStatus !== 'idle' && (
                  <div className={`px-3 py-1 rounded-lg text-sm ${
                    saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
                    saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {saveStatus === 'saving' && 'Enregistrement...'}
                    {saveStatus === 'saved' && '✓ Enregistré'}
                    {saveStatus === 'error' && '✗ Erreur'}
                  </div>
                )}
                
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowNewProductForm(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => editingProduct && handleSaveProduct(editingProduct)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}