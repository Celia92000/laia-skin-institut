"use client";

import { useState, useEffect } from 'react';
import { Gift, Check, X, Clock, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  balance: number;
  purchasedFor?: string;
  purchasedBy?: string;
  status: string;
  createdAt: string;
  expiryDate?: string;
  usedDate?: string;
  reservations: Array<{
    id: string;
    date: string;
    time: string;
    amount: number;
    status: string;
  }>;
}

export default function ClientGiftCards() {
  const [purchasedCards, setPurchasedCards] = useState<GiftCard[]>([]);
  const [receivedCards, setReceivedCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'purchased'>('received');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/client/gift-cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPurchasedCards(data.purchased || []);
        setReceivedCards(data.received || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes cadeaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string, balance: number) => {
    if (status === 'used' || balance === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          <Check className="w-3 h-3" />
          Utilisée
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Gift className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const renderCard = (card: GiftCard, isPurchased: boolean) => {
    const isExpired = card.expiryDate && new Date(card.expiryDate) < new Date();
    const isUsed = card.status === 'used' || card.balance === 0;

    return (
      <div
        key={card.id}
        className={`rounded-xl border-2 p-6 transition-all ${
          isUsed || isExpired
            ? 'bg-gray-50 border-gray-200 opacity-75'
            : 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 hover:shadow-lg'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isUsed || isExpired ? 'bg-gray-200' : 'bg-pink-200'}`}>
              <Gift className={`w-6 h-6 ${isUsed || isExpired ? 'text-gray-500' : 'text-pink-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#2c3e50]">Carte Cadeau</h3>
              <p className="text-sm text-gray-500">
                {isPurchased ? `Pour: ${card.purchasedFor || 'Non spécifié'}` : `De: ${card.purchasedBy || 'Anonyme'}`}
              </p>
            </div>
          </div>
          {getStatusBadge(card.status, card.balance)}
        </div>

        {/* Code de la carte */}
        <div className="bg-white rounded-lg p-3 mb-4 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Code</p>
              <p className="font-mono font-bold text-pink-900">{card.code}</p>
            </div>
            <button
              onClick={() => copyToClipboard(card.code)}
              className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
              title="Copier le code"
            >
              {copiedCode === card.code ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-pink-600" />
              )}
            </button>
          </div>
        </div>

        {/* Solde */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Montant initial</p>
            <p className="text-xl font-bold text-gray-900">{card.initialAmount}€</p>
          </div>
          <div className={`rounded-lg p-3 border ${card.balance > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <p className="text-xs text-gray-500 mb-1">Solde restant</p>
            <p className={`text-xl font-bold ${card.balance > 0 ? 'text-green-700' : 'text-gray-600'}`}>
              {card.balance}€
            </p>
          </div>
        </div>

        {/* Historique d'utilisation */}
        {card.reservations && card.reservations.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Utilisations ({card.reservations.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {card.reservations.map((res, idx) => (
                <div key={res.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">
                    {new Date(res.date).toLocaleDateString('fr-FR')} à {res.time}
                  </span>
                  <span className="font-semibold text-pink-700">-{res.amount}€</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Créée le {new Date(card.createdAt).toLocaleDateString('fr-FR')}</span>
          {card.expiryDate && (
            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
              {isExpired ? '⚠️ Expirée' : `Expire le ${new Date(card.expiryDate).toLocaleDateString('fr-FR')}`}
            </span>
          )}
        </div>

        {isExpired && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>Cette carte cadeau a expiré</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const hasCards = receivedCards.length > 0 || purchasedCards.length > 0;

  if (!hasCards) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
          <Gift className="w-8 h-8 text-pink-600" />
        </div>
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-2">
          Aucune carte cadeau
        </h3>
        <p className="text-gray-500 mb-6">
          Vous n'avez pas encore de carte cadeau.
        </p>
        <a
          href="/offrir-une-carte-cadeau"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Gift className="w-5 h-5" />
          Offrir une carte cadeau
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
            <Gift className="w-7 h-7 text-pink-600" />
            Mes cartes cadeaux
          </h2>
          <p className="text-gray-500 mt-1">
            Suivez vos cartes cadeaux et leur solde
          </p>
        </div>
        <a
          href="/offrir-une-carte-cadeau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
        >
          <Gift className="w-4 h-4" />
          Offrir une carte
        </a>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'received'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cartes reçues ({receivedCards.length})
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'purchased'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cartes offertes ({purchasedCards.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="grid md:grid-cols-2 gap-6">
        {activeTab === 'received' &&
          receivedCards.map((card) => renderCard(card, false))}
        {activeTab === 'purchased' &&
          purchasedCards.map((card) => renderCard(card, true))}
      </div>

      {/* Message si aucune carte dans l'onglet actif */}
      {activeTab === 'received' && receivedCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Vous n'avez pas encore reçu de carte cadeau
        </div>
      )}
      {activeTab === 'purchased' && purchasedCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Vous n'avez pas encore offert de carte cadeau
        </div>
      )}
    </div>
  );
}
