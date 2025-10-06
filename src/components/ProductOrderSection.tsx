'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Minus, CreditCard, Banknote, Building2, X, User } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ProductOrderSectionProps {
  onOrderCreated?: () => void;
}

export default function ProductOrderSection({ onOrderCreated }: ProductOrderSectionProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchClients();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.filter((u: any) => u.role === 'client'));
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert('Stock insuffisant');
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.product.stock) {
          alert('Stock insuffisant');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        userId: selectedClient,
        items: JSON.stringify(cart.map(item => ({
          type: 'product',
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))),
        totalAmount: getTotalAmount(),
        paymentMethod,
        paymentStatus: 'paid',
        status: 'pending' // Commande en attente de planification
      };

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Commande créée avec succès !');
        setCart([]);
        setSelectedClient('');
        setShowPaymentForm(false);
        fetchProducts(); // Refresh to update stock
        if (onOrderCreated) onOrderCreated();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert('Erreur lors de la création de la commande');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#2c3e50] flex items-center gap-2">
          <Package className="w-6 h-6 text-purple-500" />
          Vente de Produits
        </h3>
        {cart.length > 0 && (
          <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
            {cart.length} produit{cart.length > 1 ? 's' : ''} · {getTotalAmount()}€
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h4 className="font-semibold text-[#2c3e50] mb-2">{product.name}</h4>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-purple-600">{product.price}€</span>
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            </div>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        ))}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Panier
          </h4>

          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium text-[#2c3e50]">{item.product.name}</p>
                  <p className="text-sm text-gray-600">{item.product.price}€ × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="ml-2 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-purple-600">{getTotalAmount()}€</span>
            </div>
          </div>

          {/* Payment Form */}
          {!showPaymentForm ? (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Procéder au paiement
            </button>
          ) : (
            <div className="space-y-4 border border-purple-200 rounded-lg p-4 bg-purple-50">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'cash'
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Espèces
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Carte
                  </button>
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'transfer'
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Virement
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Valider la vente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
