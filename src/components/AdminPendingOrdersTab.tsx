'use client';

import { useEffect, useState } from 'react';
import { Gift, CheckCircle, Calendar } from 'lucide-react';

interface PendingGiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail: string;
  purchasedFor: string;
  message?: string;
  status: string;
  createdAt: string;
}

export default function AdminPendingOrdersTab() {
  const [pendingGiftCards, setPendingGiftCards] = useState<PendingGiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingGiftCards();
  }, []);

  const fetchPendingGiftCards = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Récupérer uniquement les cartes cadeaux en attente (achetées sans réservation)
      const giftCardsRes = await fetch('/api/admin/gift-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const giftCardsData = await giftCardsRes.json();
      // Carte en attente = achetée sans réservation associée
      const pendingCards = giftCardsData.filter((gc: any) =>
        gc.status === 'active' && (!gc.reservations || gc.reservations.length === 0)
      );
      setPendingGiftCards(pendingCards);
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes cadeaux en attente:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateGiftCard = async (cardId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/gift-cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'active',
          notes: 'Validée par l\'admin'
        })
      });

      if (res.ok) {
        alert('Carte cadeau validée avec succès !');
        fetchPendingGiftCards();
      } else {
        alert('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Gift className="w-8 h-8 text-pink-600" />
              Cartes Cadeaux en attente
            </h2>
            <p className="text-gray-600 mt-2">
              Cartes cadeaux achetées sans réservation immédiate
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-pink-600">{pendingGiftCards.length}</p>
            <p className="text-sm text-gray-600">en attente</p>
          </div>
        </div>
      </div>

      {pendingGiftCards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune carte cadeau en attente</p>
          <p className="text-gray-400 text-sm mt-2">Les cartes achetées sans réservation immédiate apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cartes cadeaux en attente */}
          {pendingGiftCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg p-6 border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Gift className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Carte Cadeau</h3>
                      <p className="text-sm text-gray-500">Code: {card.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Bénéficiaire</p>
                      <p className="font-semibold">{card.purchasedFor}</p>
                      <p className="text-sm text-gray-500">{card.recipientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montant</p>
                      <p className="font-bold text-pink-600 text-xl">{card.amount}€</p>
                      <p className="text-sm text-gray-500">Solde: {card.balance}€</p>
                    </div>
                  </div>

                  {card.message && (
                    <div className="bg-pink-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700 italic">"{card.message}"</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Achetée le {new Date(card.createdAt).toLocaleDateString('fr-FR')} à {new Date(card.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => validateGiftCard(card.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
