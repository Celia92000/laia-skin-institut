'use client';

import { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2, Eye, Search, Calendar, User, CreditCard } from 'lucide-react';

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  initialAmount: number;
  balance: number;
  purchasedBy?: string;
  purchasedFor?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  status: string;
  purchaseDate: string;
  expiryDate?: string;
  usedDate?: string;
  createdBy?: string;
  notes?: string;
  purchaser?: {
    id: string;
    name: string;
    email: string;
  };
  reservations?: any[];
}

export default function AdminGiftCardsTab() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [newCard, setNewCard] = useState({
    amount: 50,
    purchasedFor: '',
    recipientEmail: '',
    recipientPhone: '',
    message: '',
    expiryDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/gift-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGiftCards(data);
      }
    } catch (error) {
      console.error('Erreur chargement cartes cadeaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GIFT-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const code = generateCode();

      const response = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newCard,
          code,
          expiryDate: newCard.expiryDate || null
        })
      });

      if (response.ok) {
        alert('Carte cadeau créée avec succès !');
        setShowCreateModal(false);
        setNewCard({
          amount: 50,
          purchasedFor: '',
          recipientEmail: '',
          recipientPhone: '',
          message: '',
          expiryDate: '',
          notes: ''
        });
        fetchGiftCards();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      console.error('Erreur création carte cadeau:', error);
      alert('Erreur lors de la création de la carte cadeau');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte cadeau ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/gift-cards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Carte cadeau supprimée');
        fetchGiftCards();
      }
    } catch (error) {
      console.error('Erreur suppression carte cadeau:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleUpdateCard = async () => {
    if (!selectedCard) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/gift-cards/${selectedCard.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          balance: selectedCard.balance,
          status: selectedCard.status,
          notes: selectedCard.notes
        })
      });

      if (response.ok) {
        alert('Carte cadeau mise à jour');
        setShowEditModal(false);
        setSelectedCard(null);
        fetchGiftCards();
      }
    } catch (error) {
      console.error('Erreur mise à jour carte cadeau:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const filteredCards = giftCards.filter(card =>
    card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.purchasedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des cartes cadeaux...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-[#2c3e50] flex items-center gap-2">
            <Gift className="w-7 h-7 text-pink-500" />
            Gestion des Cartes Cadeaux
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {giftCards.length} carte{giftCards.length > 1 ? 's' : ''} ·
            {giftCards.filter(c => c.status === 'active').length} active{giftCards.filter(c => c.status === 'active').length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle carte
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code, bénéficiaire, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <div
            key={card.id}
            className="border-2 border-pink-200 rounded-lg p-4 bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono font-bold text-pink-700">{card.code}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  card.status === 'active' ? 'bg-green-100 text-green-700' :
                  card.status === 'used' ? 'bg-gray-100 text-gray-700' :
                  card.status === 'expired' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {card.status === 'active' ? 'Active' :
                   card.status === 'used' ? 'Utilisée' :
                   card.status === 'expired' ? 'Expirée' : 'Annulée'}
                </span>
              </div>
              <Gift className="w-8 h-8 text-pink-400" />
            </div>

            <div className="space-y-2 text-sm mb-3">
              <p className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="font-bold text-pink-600">{card.amount}€</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Solde:</span>
                <span className={`font-bold ${card.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {card.balance}€
                </span>
              </p>
              {card.purchasedFor && (
                <p className="text-gray-700">
                  <strong>Pour:</strong> {card.purchasedFor}
                </p>
              )}
              {card.recipientEmail && (
                <p className="text-gray-600 text-xs truncate">
                  {card.recipientEmail}
                </p>
              )}
              <p className="text-gray-600">
                <strong>Créée le:</strong> {new Date(card.purchaseDate).toLocaleDateString('fr-FR')}
              </p>
              {card.reservations && card.reservations.length > 0 && (
                <p className="text-purple-600">
                  <strong>{card.reservations.length}</strong> réservation{card.reservations.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCard(card);
                  setShowEditModal(true);
                }}
                className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Modifier
              </button>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Aucune carte cadeau trouvée</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">Nouvelle carte cadeau</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Montant (€)*</label>
                <input
                  type="number"
                  value={newCard.amount}
                  onChange={(e) => setNewCard({...newCard, amount: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Bénéficiaire</label>
                <input
                  type="text"
                  value={newCard.purchasedFor}
                  onChange={(e) => setNewCard({...newCard, purchasedFor: e.target.value})}
                  placeholder="Nom du bénéficiaire"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Email bénéficiaire</label>
                <input
                  type="email"
                  value={newCard.recipientEmail}
                  onChange={(e) => setNewCard({...newCard, recipientEmail: e.target.value})}
                  placeholder="email@exemple.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Téléphone bénéficiaire</label>
                <input
                  type="tel"
                  value={newCard.recipientPhone}
                  onChange={(e) => setNewCard({...newCard, recipientPhone: e.target.value})}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Message personnalisé</label>
                <textarea
                  value={newCard.message}
                  onChange={(e) => setNewCard({...newCard, message: e.target.value})}
                  placeholder="Message pour le bénéficiaire..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Date d'expiration (optionnel)</label>
                <input
                  type="date"
                  value={newCard.expiryDate}
                  onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Notes admin</label>
                <textarea
                  value={newCard.notes}
                  onChange={(e) => setNewCard({...newCard, notes: e.target.value})}
                  placeholder="Notes internes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCard}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg font-semibold"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">Modifier carte cadeau</h3>

            <p className="font-mono font-bold text-pink-700 mb-4">{selectedCard.code}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Solde (€)</label>
                <input
                  type="number"
                  value={selectedCard.balance}
                  onChange={(e) => setSelectedCard({...selectedCard, balance: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Statut</label>
                <select
                  value={selectedCard.status}
                  onChange={(e) => setSelectedCard({...selectedCard, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="active">Active</option>
                  <option value="used">Utilisée</option>
                  <option value="expired">Expirée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Notes admin</label>
                <textarea
                  value={selectedCard.notes || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCard(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateCard}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
