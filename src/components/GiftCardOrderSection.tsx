'use client';

import { useState, useEffect } from 'react';
import { Gift, ShoppingCart, Plus, Minus, CreditCard, Banknote, Building2, X, User } from 'lucide-react';

interface GiftCard {
  id: string;
  name: string;
  amount: number;
}

interface CartItem {
  giftCard: GiftCard;
  quantity: number;
}

interface GiftCardOrderSectionProps {
  onOrderCreated?: () => void;
}

// Cartes cadeaux prédéfinies
const GIFT_CARDS: GiftCard[] = [
  { id: '1', name: 'Carte cadeau 50€', amount: 50 },
  { id: '2', name: 'Carte cadeau 100€', amount: 100 },
  { id: '3', name: 'Carte cadeau 150€', amount: 150 },
  { id: '4', name: 'Carte cadeau 200€', amount: 200 },
  { id: '5', name: 'Carte cadeau personnalisée', amount: 0 }, // Montant personnalisé
];

export default function GiftCardOrderSection({ onOrderCreated }: GiftCardOrderSectionProps = {}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(0);

  useEffect(() => {
    fetchClients();
  }, []);

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

  const addToCart = (giftCard: GiftCard) => {
    // Pour la carte personnalisée, demander le montant
    if (giftCard.amount === 0) {
      const amount = prompt('Entrez le montant de la carte cadeau (€):');
      if (!amount || isNaN(Number(amount))) {
        alert('Montant invalide');
        return;
      }
      const customGiftCard = {
        ...giftCard,
        name: `Carte cadeau ${amount}€`,
        amount: Number(amount)
      };
      setCart([...cart, { giftCard: customGiftCard, quantity: 1 }]);
      return;
    }

    const existingItem = cart.find(item => item.giftCard.id === giftCard.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.giftCard.id === giftCard.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { giftCard, quantity: 1 }]);
    }
  };

  const updateQuantity = (giftCardId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.giftCard.id === giftCardId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (giftCardId: string) => {
    setCart(cart.filter(item => item.giftCard.id !== giftCardId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.giftCard.amount * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      alert('Veuillez ajouter au moins une carte cadeau');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        userId: selectedClient,
        items: JSON.stringify(cart.map(item => ({
          type: 'giftcard',
          id: item.giftCard.id,
          name: item.giftCard.name,
          price: item.giftCard.amount,
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
        alert('Commande de carte(s) cadeau créée avec succès !');
        setCart([]);
        setSelectedClient('');
        setShowPaymentForm(false);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#2c3e50] flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-500" />
          Vente de Cartes Cadeaux
        </h3>
        {cart.length > 0 && (
          <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold">
            {cart.length} carte{cart.length > 1 ? 's' : ''} · {getTotalAmount()}€
          </div>
        )}
      </div>

      {/* Gift Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {GIFT_CARDS.map(giftCard => (
          <div
            key={giftCard.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-pink-50 to-rose-50"
          >
            <div className="flex items-center justify-between mb-3">
              <Gift className="w-8 h-8 text-pink-500" />
              <h4 className="font-semibold text-[#2c3e50] text-right">{giftCard.name}</h4>
            </div>
            {giftCard.amount > 0 && (
              <div className="text-2xl font-bold text-pink-600 mb-3">
                {giftCard.amount}€
              </div>
            )}
            <button
              onClick={() => addToCart(giftCard)}
              className="w-full px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
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
            {cart.map((item, idx) => (
              <div key={`${item.giftCard.id}-${idx}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium text-[#2c3e50]">{item.giftCard.name}</p>
                  <p className="text-sm text-gray-600">{item.giftCard.amount}€ × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.giftCard.id, -1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.giftCard.id, 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.giftCard.id)}
                    className="ml-2 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-pink-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-pink-600">{getTotalAmount()}€</span>
            </div>
          </div>

          {/* Payment Form */}
          {!showPaymentForm ? (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Procéder au paiement
            </button>
          ) : (
            <div className="space-y-4 border border-pink-200 rounded-lg p-4 bg-pink-50">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                        ? 'border-pink-500 bg-pink-100 text-pink-700'
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
                        ? 'border-pink-500 bg-pink-100 text-pink-700'
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
                        ? 'border-pink-500 bg-pink-100 text-pink-700'
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
