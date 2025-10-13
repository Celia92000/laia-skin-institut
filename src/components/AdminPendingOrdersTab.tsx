'use client';

import { useEffect, useState } from 'react';
import { Gift, CheckCircle, Calendar, CreditCard, X } from 'lucide-react';

interface PendingGiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail: string;
  purchasedFor: string;
  message?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  purchaser?: {
    name: string;
    email: string;
  };
}

export default function AdminPendingOrdersTab() {
  const [pendingGiftCards, setPendingGiftCards] = useState<PendingGiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PendingGiftCard | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingGiftCards();
  }, []);

  const fetchPendingGiftCards = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Récupérer uniquement les cartes cadeaux en attente de paiement
      const giftCardsRes = await fetch('/api/admin/gift-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const giftCardsData = await giftCardsRes.json();
      // Carte en attente = pas encore payée (paymentStatus === 'pending' ou non défini)
      const pendingCards = giftCardsData.filter((gc: any) =>
        gc.paymentStatus === 'pending' || !gc.paymentStatus
      );
      setPendingGiftCards(pendingCards);
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes cadeaux en attente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRecord = async () => {
    if (!selectedCard) return;

    setProcessing(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Enregistrer le paiement et mettre à jour la carte cadeau
      const res = await fetch(`/api/admin/gift-cards/${selectedCard.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentMethod: paymentMethod,
          status: 'active'
        })
      });

      if (res.ok) {
        // Envoyer l'email à l'acheteur
        if (selectedCard.purchaser?.email) {
          try {
            await fetch(`/api/admin/gift-cards/${selectedCard.id}/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
          }
        }

        alert('✅ Paiement enregistré avec succès !');
        setShowPaymentModal(false);
        setSelectedCard(null);
        setPaymentMethod('CB');
        fetchPendingGiftCards();
      } else {
        alert('❌ Erreur lors de l\'enregistrement du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'enregistrement du paiement');
    } finally {
      setProcessing(false);
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">Carte Cadeau</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          card.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {card.paymentStatus === 'paid' ? '✓ Payée' : '⏳ En attente de paiement'}
                        </span>
                      </div>
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

                  {card.purchaser && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-600 font-medium">Acheteur</p>
                      <p className="font-semibold">{card.purchaser.name}</p>
                      <p className="text-sm text-gray-500">{card.purchaser.email}</p>
                    </div>
                  )}

                  {card.message && (
                    <div className="bg-pink-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700 italic">"{card.message}"</p>
                    </div>
                  )}

                  {card.paymentMethod && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Payée par: <strong>{card.paymentMethod}</strong></span>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Créée le {new Date(card.createdAt).toLocaleDateString('fr-FR')} à {new Date(card.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {card.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => {
                        setSelectedCard(card);
                        setShowPaymentModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                      <CreditCard className="w-4 h-4" />
                      Enregistrer le paiement
                    </button>
                  )}
                  {card.paymentStatus === 'paid' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Paiement enregistré
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de paiement */}
      {showPaymentModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Enregistrer le paiement</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedCard(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Carte cadeau</p>
              <p className="font-mono font-bold text-pink-700">{selectedCard.code}</p>
              <p className="font-bold text-2xl text-pink-600 mt-2">{selectedCard.amount}€</p>
              {selectedCard.purchasedFor && (
                <p className="text-sm text-gray-600 mt-2">Pour: {selectedCard.purchasedFor}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="CB">Carte bancaire</option>
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedCard(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePaymentRecord}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Enregistrement...' : 'Valider le paiement'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💌 Un email sera automatiquement envoyé à l'acheteur
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
