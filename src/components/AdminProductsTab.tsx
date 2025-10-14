"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Save, X, Trash2, Eye, EyeOff, Package, 
  Clock, Euro, Tag, Search, Upload, ChevronUp, ChevronDown,
  AlertTriangle, Box, DollarSign, Hash, Archive
} from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  category?: string;
  brand?: string;
  mainImage?: string;
  imageSettings?: string;  // JSON: {objectFit, position, zoom}
  gallery?: string;
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
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'details'>('general');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editedCategories, setEditedCategories] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  // Image editor states - moved outside conditional render to fix hooks order
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Load image editor settings when editing product changes
  useEffect(() => {
    if (editingProduct?.imageSettings) {
      try {
        const settings = JSON.parse(editingProduct.imageSettings);
        setObjectFit(settings.objectFit || 'cover');
        setPosition(settings.position || { x: 50, y: 50 });
        setZoom(settings.zoom || 100);
      } catch {
        // Reset to defaults if parsing fails
        setObjectFit('cover');
        setPosition({ x: 50, y: 50 });
        setZoom(100);
      }
    } else {
      // Reset to defaults for new products
      setObjectFit('cover');
      setPosition({ x: 50, y: 50 });
      setZoom(100);
    }
  }, [editingProduct?.id]);

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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/product-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        setEditedCategories(data.map((cat: any) => ({...cat})));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    }
  };

  const handleSaveCategories = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/product-categories', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categories: editedCategories })
      });

      if (response.ok) {
        setCategories(editedCategories.map(cat => ({...cat})));
        setSaveStatus('saved');
        setShowCategoryManager(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des catégories:', error);
      setSaveStatus('error');
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
      return null;
    } finally {
      setUploadingImage(false);
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

      // Add image settings to product
      const productWithSettings = {
        ...product,
        imageSettings: JSON.stringify({ objectFit, position, zoom })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productWithSettings)
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
                          product.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const newProduct: Product = {
    id: 'new',
    slug: '',
    name: '',
    description: '',
    price: 0,
    active: true,
    featured: false,
    order: products.length
  };

  return (
    <div className="space-y-6">
      {/* Gestionnaire de catégories */}
      {showCategoryManager && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Gestion des catégories</h3>
            <button
              onClick={() => setShowCategoryManager(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {editedCategories.map((category, index) => (
              <div key={category.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={category.active}
                  onChange={(e) => {
                    const newCategories = [...editedCategories];
                    newCategories[index].active = e.target.checked;
                    setEditedCategories(newCategories);
                  }}
                  className="w-5 h-5 text-rose-600"
                />
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => {
                    const newCategories = [...editedCategories];
                    newCategories[index].name = e.target.value;
                    setEditedCategories(newCategories);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newCategories = [...editedCategories];
                      if (index > 0) {
                        [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
                        newCategories.forEach((cat, i) => cat.order = i);
                        setEditedCategories(newCategories);
                      }
                    }}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newCategories = [...editedCategories];
                      if (index < newCategories.length - 1) {
                        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
                        newCategories.forEach((cat, i) => cat.order = i);
                        setEditedCategories(newCategories);
                      }
                    }}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    disabled={index === editedCategories.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {category._count?.products || 0} produit(s)
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setEditedCategories(categories.map(cat => ({...cat})));
                setShowCategoryManager(false);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveCategories}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
            >
              {saveStatus === 'saving' ? (
                <>Sauvegarde...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Bouton nouveau produit */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Gérer les catégories
              </button>
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
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Produits actifs</p>
            <p className="text-xl font-bold text-green-600">
              {products.filter(p => p.active).length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">En promotion</p>
            <p className="text-xl font-bold text-purple-600">
              {products.filter(p => p.salePrice && p.salePrice < p.price).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">En vedette</p>
            <p className="text-xl font-bold text-yellow-600">
              {products.filter(p => p.featured).length}
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
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full"
                        style={(() => {
                          try {
                            if (product.imageSettings) {
                              const settings = JSON.parse(product.imageSettings);
                              return {
                                objectFit: settings.objectFit || 'cover',
                                objectPosition: `${settings.position?.x || 50}% ${settings.position?.y || 50}%`,
                                transform: `scale(${(settings.zoom || 100) / 100})`
                              };
                            }
                          } catch {}
                          return { objectFit: 'cover' as const };
                        })()}
                      />
                    </div>
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
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.shortDescription || product.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        Slug: {product.slug || 'Non défini'}
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Catégorie</p>
                      <p className="font-semibold">{product.category || 'Non catégorisé'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Marque</p>
                      <p className="font-semibold">{product.brand || 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ordre</p>
                      <p className="font-semibold">{product.order}</p>
                    </div>
                  </div>
                  {product.ingredients && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">Ingrédients</p>
                      <p className="text-sm mt-1">{product.ingredients}</p>
                    </div>
                  )}
                  {product.usage && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">Mode d'utilisation</p>
                      <p className="text-sm mt-1">{product.usage}</p>
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
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {(['general', 'media', 'details'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base whitespace-nowrap flex-shrink-0 ${
                        activeTab === tab
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab === 'general' && (
                        <>
                          <span className="hidden sm:inline">📋 Général</span>
                          <span className="sm:hidden">📋</span>
                        </>
                      )}
                      {tab === 'media' && (
                        <>
                          <span className="hidden sm:inline">📸 Médias</span>
                          <span className="sm:hidden">📸</span>
                        </>
                      )}
                      {tab === 'details' && (
                        <>
                          <span className="hidden sm:inline">📝 Détails</span>
                          <span className="sm:hidden">📝</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenu des onglets */}
              <div className="space-y-4">
                {activeTab === 'general' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
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
                        <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
                        <input
                          type="text"
                          value={editingProduct?.slug || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, slug: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="ex: serum-vitamine-c"
                          required
                        />
                      </div>
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
                        <label className="block text-sm font-medium mb-1">Prix normal (€) *</label>
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
                        <label className="block text-sm font-medium mb-1">Prix promotionnel (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct?.salePrice || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Catégorie</label>
                        <select
                          value={editingProduct?.category || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct!, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">-- Sélectionner une catégorie --</option>
                          {categories
                            .filter(cat => cat.active)
                            .sort((a, b) => a.order - b.order)
                            .map(category => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                        </select>
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

                    <div>
                      <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                      <input
                        type="number"
                        value={editingProduct?.order || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, order: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
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

                {activeTab === 'media' && (
                  <>
                    <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Image principale
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={editingProduct?.mainImage || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct!, mainImage: e.target.value })}
                            className="flex-1 px-4 py-3 text-lg border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="URL de l'image ou utilisez le bouton parcourir"
                          />
                          <label className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleImageUpload(file);
                                  if (url) {
                                    setEditingProduct({ ...editingProduct!, mainImage: url });
                                  }
                                }
                              }}
                              disabled={uploadingImage}
                            />
                            <span className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer transition-colors text-lg font-medium ${
                              uploadingImage
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-purple-500'
                            }`}>
                              {uploadingImage ? (
                                <>
                                  <span className="animate-spin">⏳</span>
                                  Upload...
                                </>
                              ) : (
                                <>
                                  📁 Parcourir
                                </>
                              )}
                            </span>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Formats acceptés: JPG, PNG, WEBP, GIF (max 5MB)
                        </p>
                      </div>
                      {editingProduct?.mainImage && (
                        <div className="mt-6 bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Éditeur d'image moderne
                              </h3>
                              <p className="text-purple-100 text-sm mt-1">🖱️ Cliquez pour positionner • 🔍 Molette pour zoomer • Drag & drop supporté</p>
                            </div>

                            <div className="p-6 space-y-6">
                              {/* Preview Section */}
                              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                {/* Grid overlay */}
                                <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
                                  <div className="grid grid-cols-3 grid-rows-3 h-full">
                                    {[...Array(9)].map((_, i) => (
                                      <div key={i} className="border border-white/30"></div>
                                    ))}
                                  </div>
                                </div>

                                {/* Interactive Image */}
                                <div
                                  className="relative h-80 cursor-move select-none"
                                  onMouseDown={(e) => {
                                    const startX = e.clientX;
                                    const startY = e.clientY;
                                    const startPosX = position.x;
                                    const startPosY = position.y;
                                    const rect = e.currentTarget.getBoundingClientRect();

                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
                                      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;
                                      setPosition({
                                        x: Math.max(0, Math.min(100, startPosX + deltaX)),
                                        y: Math.max(0, Math.min(100, startPosY + deltaY))
                                      });
                                    };

                                    const handleMouseUp = () => {
                                      document.removeEventListener('mousemove', handleMouseMove);
                                      document.removeEventListener('mouseup', handleMouseUp);
                                    };

                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                  }}
                                  onWheel={(e) => {
                                    e.preventDefault();
                                    const delta = e.deltaY > 0 ? -5 : 5;
                                    setZoom(Math.max(50, Math.min(200, zoom + delta)));
                                  }}
                                >
                                  <img
                                    src={editingProduct.mainImage}
                                    alt="Aperçu"
                                    className="w-full h-full transition-transform duration-100"
                                    style={{
                                      objectFit,
                                      objectPosition: `${position.x}% ${position.y}%`,
                                      transform: `scale(${zoom / 100})`
                                    }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                    }}
                                    draggable={false}
                                  />
                                  {/* Position indicator */}
                                  <div
                                    className="absolute w-4 h-4 bg-purple-500 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                                  />
                                </div>

                                {/* Quick info overlay */}
                                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-3">
                                  <span>📍 {position.x}%, {position.y}%</span>
                                  <span className="text-purple-300">|</span>
                                  <span>🔍 {zoom}%</span>
                                </div>
                              </div>

                              {/* Compact Toolbar */}
                              <div className="flex flex-wrap gap-2 items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                                {/* Mode buttons */}
                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                  {[
                                    { mode: 'cover' as const, icon: '⬜', tooltip: 'Remplir' },
                                    { mode: 'contain' as const, icon: '🔲', tooltip: 'Contenir' },
                                    { mode: 'fill' as const, icon: '↔️', tooltip: 'Étirer' }
                                  ].map(({ mode, icon, tooltip }) => (
                                    <button
                                      key={mode}
                                      type="button"
                                      title={tooltip}
                                      onClick={() => setObjectFit(mode)}
                                      className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                                        objectFit === mode
                                          ? 'bg-purple-500 text-white shadow-sm'
                                          : 'text-gray-600 hover:text-gray-900'
                                      }`}
                                    >
                                      {icon}
                                    </button>
                                  ))}
                                </div>

                                {/* Quick positions */}
                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                  {[
                                    { dx: -10, dy: -10, icon: '↖' }, { dx: 0, dy: -10, icon: '↑' }, { dx: 10, dy: -10, icon: '↗' },
                                    { dx: -10, dy: 0, icon: '←' }, { dx: 0, dy: 0, icon: '·', reset: true }, { dx: 10, dy: 0, icon: '→' },
                                    { dx: -10, dy: 10, icon: '↙' }, { dx: 0, dy: 10, icon: '↓' }, { dx: 10, dy: 10, icon: '↘' }
                                  ].map(({ dx, dy, icon, reset }, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (reset) {
                                          setPosition({ x: 50, y: 50 });
                                        } else {
                                          setPosition({
                                            x: Math.max(0, Math.min(100, position.x + dx)),
                                            y: Math.max(0, Math.min(100, position.y + dy))
                                          });
                                        }
                                      }}
                                      className={`w-7 h-7 text-xs rounded transition-all ${
                                        reset && position.x === 50 && position.y === 50
                                          ? 'bg-purple-500 text-white shadow-sm'
                                          : 'text-gray-600 hover:bg-white'
                                      }`}
                                      title={reset ? 'Centrer' : `Déplacer de ${Math.abs(dx || dy)}%`}
                                    >
                                      {icon}
                                    </button>
                                  ))}
                                </div>

                                {/* Zoom controls */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                  <button
                                    type="button"
                                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                                    className="w-7 h-7 text-gray-600 hover:text-gray-900 font-bold"
                                  >
                                    −
                                  </button>
                                  <span className="text-xs font-mono font-bold text-purple-600 min-w-[40px] text-center">
                                    {zoom}%
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                                    className="w-7 h-7 text-gray-600 hover:text-gray-900 font-bold"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Reset */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setObjectFit('cover');
                                    setPosition({ x: 50, y: 50 });
                                    setZoom(100);
                                  }}
                                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs"
                                  title="Réinitialiser"
                                >
                                  ↺
                                </button>
                              </div>
                            </div>
                          </div>
                      )}
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
                        rows={4}
                        placeholder="Liste des ingrédients du produit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Mode d'utilisation</label>
                      <textarea
                        value={editingProduct?.usage || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, usage: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                        placeholder="Comment utiliser ce produit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Bénéfices</label>
                      <textarea
                        value={editingProduct?.benefits || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct!, benefits: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                        placeholder="Les bénéfices et avantages du produit"
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