'use client';

import { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2, Eye, Search, Calendar, User, CreditCard, Mail, Download, Settings, Save } from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

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
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [previewCard, setPreviewCard] = useState<GiftCard | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // États pour les paramètres de cartes cadeaux
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    emailSubject: "Vous avez reçu une carte cadeau Laia Skin Institut !",
    emailTitle: "🎁 Vous avez reçu une Carte Cadeau !",
    emailIntro: "Quelle belle attention ! Vous venez de recevoir une carte cadeau pour découvrir ou redécouvrir les soins d'exception de Laia Skin Institut.",
    emailInstructions: "Utilisez le code ci-dessous lors de votre réservation en ligne ou contactez-nous pour prendre rendez-vous.",
    emailFooter: "Cette carte cadeau est valable 1 an à partir de la date d'émission.",
    physicalCardTitle: "CARTE CADEAU",
    physicalCardSubtitle: "Laia Skin Institut",
    physicalCardValidity: "Valable 1 an",
    physicalCardInstructions: "Présentez cette carte lors de votre visite ou utilisez le code en ligne."
  });
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return formatDateLocal(date);
  };

  const [newCard, setNewCard] = useState({
    amount: 50,
    senderName: '',
    purchasedFor: '',
    recipientEmail: '',
    recipientPhone: '',
    message: '',
    expiryDate: getDefaultExpiryDate(),
    notes: '',
    paymentMethod: 'CB'
  });

  useEffect(() => {
    fetchGiftCards();
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/gift-card-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/gift-card-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('✅ Paramètres sauvegardés avec succès !');
      } else {
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSavingSettings(false);
    }
  };

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
        const createdCard = await response.json();

        // Si un email est renseigné, envoyer automatiquement la carte
        if (newCard.recipientEmail && createdCard.id) {
          try {
            const emailResponse = await fetch(`/api/admin/gift-cards/${createdCard.id}/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (emailResponse.ok) {
              alert(`Carte cadeau créée et envoyée à ${newCard.recipientEmail} !`);
            } else {
              alert('Carte créée mais erreur lors de l\'envoi de l\'email. Vous pouvez le renvoyer manuellement.');
            }
          } catch (emailError) {
            alert('Carte créée mais erreur lors de l\'envoi de l\'email. Vous pouvez le renvoyer manuellement.');
          }
        } else {
          alert('Carte cadeau créée avec succès !');
        }

        setShowCreateModal(false);
        setNewCard({
          amount: 50,
          senderName: '',
          purchasedFor: '',
          recipientEmail: '',
          recipientPhone: '',
          message: '',
          expiryDate: getDefaultExpiryDate(),
          notes: '',
          paymentMethod: 'CB'
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
          initialAmount: selectedCard.initialAmount,
          balance: selectedCard.balance,
          purchasedFor: selectedCard.purchasedFor,
          recipientEmail: selectedCard.recipientEmail,
          recipientPhone: selectedCard.recipientPhone,
          message: selectedCard.message,
          expiryDate: selectedCard.expiryDate,
          status: selectedCard.status,
          notes: selectedCard.notes,
          purchaserName: selectedCard.purchaser?.name
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

  const handleSendEmail = async (card: GiftCard) => {
    if (!card.recipientEmail) {
      alert('Aucun email bénéficiaire renseigné');
      return;
    }

    if (!confirm(`Envoyer la carte cadeau à ${card.recipientEmail} ?`)) return;

    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/gift-cards/${card.id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`Carte cadeau envoyée à ${card.recipientEmail} !`);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Erreur lors de l\'envoi'}`);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
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
        {activeTab === 'list' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle carte
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'list'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Liste des cartes
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Personnalisation
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Contenu de la liste existante */}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
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
              {/* Bénéficiaire */}
              {card.purchasedFor && (
                <div className="bg-pink-100 border border-pink-300 rounded-lg p-2 mb-2">
                  <p className="text-xs text-pink-600 font-medium mb-1">Bénéficiaire</p>
                  <p className="text-pink-900 font-bold flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {card.purchasedFor}
                  </p>
                  {card.recipientEmail && (
                    <p className="text-pink-700 text-xs truncate">{card.recipientEmail}</p>
                  )}
                  {card.recipientPhone && (
                    <p className="text-pink-700 text-xs">{card.recipientPhone}</p>
                  )}
                </div>
              )}

              {/* Acheteur */}
              {card.purchaser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                  <p className="text-xs text-blue-600 font-medium mb-1">Acheté par</p>
                  <p className="text-blue-900 font-semibold">{card.purchaser.name}</p>
                  <p className="text-blue-700 text-xs truncate">{card.purchaser.email}</p>
                </div>
              )}

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
              <p className="text-gray-600 text-xs">
                <strong>Créée le:</strong> {new Date(card.purchaseDate).toLocaleDateString('fr-FR')}
              </p>
              {card.expiryDate && (
                <p className="text-orange-600 text-xs">
                  <strong>Expire le:</strong> {new Date(card.expiryDate).toLocaleDateString('fr-FR')}
                </p>
              )}
              {card.reservations && card.reservations.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mt-2">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Utilisations ({card.reservations.length})
                  </p>
                  <div className="space-y-1">
                    {card.reservations.map((res: any, idx: number) => (
                      <div key={res.id} className="text-xs text-purple-800 flex justify-between items-center">
                        <span>{new Date(res.date).toLocaleDateString('fr-FR')} à {res.time}</span>
                        <span className="font-semibold text-purple-900">{res.giftCardUsedAmount || 0}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setPreviewCard(card);
                  setShowCardPreview(true);
                }}
                className="w-full px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Eye className="w-4 h-4" />
                Voir la carte
              </button>

              <div className="flex gap-2">
                {card.recipientEmail && (
                  <button
                    onClick={() => handleSendEmail(card)}
                    disabled={sendingEmail}
                    className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1 disabled:bg-gray-300"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </button>
                )}
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
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Émetteur (De la part de)</label>
                <input
                  type="text"
                  value={newCard.senderName || ''}
                  onChange={(e) => setNewCard({...newCard, senderName: e.target.value})}
                  placeholder="Nom de l'émetteur"
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
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Date d'expiration (1 an par défaut)</label>
                <input
                  type="date"
                  value={newCard.expiryDate}
                  onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Mode de paiement*</label>
                <select
                  value={newCard.paymentMethod}
                  onChange={(e) => setNewCard({...newCard, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="CB">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
                </select>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">Modifier carte cadeau</h3>

            <p className="font-mono font-bold text-pink-700 mb-4">{selectedCard.code}</p>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Montant initial (€)</label>
                  <input
                    type="number"
                    value={selectedCard.initialAmount || selectedCard.amount}
                    onChange={(e) => setSelectedCard({...selectedCard, initialAmount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Solde actuel (€)</label>
                  <input
                    type="number"
                    value={selectedCard.balance}
                    onChange={(e) => setSelectedCard({...selectedCard, balance: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Émetteur (De la part de)</label>
                <input
                  type="text"
                  value={selectedCard.purchaser?.name || ''}
                  onChange={(e) => setSelectedCard({
                    ...selectedCard,
                    purchaser: selectedCard.purchaser
                      ? {...selectedCard.purchaser, name: e.target.value}
                      : {id: '', name: e.target.value, email: ''}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Nom de l'émetteur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Bénéficiaire</label>
                <input
                  type="text"
                  value={selectedCard.purchasedFor || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, purchasedFor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Nom du bénéficiaire"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Email bénéficiaire</label>
                  <input
                    type="email"
                    value={selectedCard.recipientEmail || ''}
                    onChange={(e) => setSelectedCard({...selectedCard, recipientEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="email@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Téléphone bénéficiaire</label>
                  <input
                    type="tel"
                    value={selectedCard.recipientPhone || ''}
                    onChange={(e) => setSelectedCard({...selectedCard, recipientPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Message personnalisé</label>
                <textarea
                  value={selectedCard.message || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, message: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Message pour le bénéficiaire..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Date d'expiration</label>
                  <input
                    type="date"
                    value={selectedCard.expiryDate ? formatDateLocal(new Date(selectedCard.expiryDate)) : ''}
                    onChange={(e) => setSelectedCard({...selectedCard, expiryDate: e.target.value})}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Notes admin</label>
                <textarea
                  value={selectedCard.notes || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Notes internes..."
                />
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {selectedCard.recipientEmail && (
                <button
                  onClick={async () => {
                    await handleUpdateCard();
                    if (selectedCard.recipientEmail) {
                      const updatedCard = await fetch(`/api/admin/gift-cards`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      }).then(r => r.json()).then(cards => cards.find((c: any) => c.id === selectedCard.id));
                      if (updatedCard) {
                        await handleSendEmail(updatedCard);
                      }
                    }
                  }}
                  disabled={sendingEmail}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  <Mail className="w-5 h-5" />
                  Enregistrer et envoyer par email
                </button>
              )}

              <div className="flex gap-2">
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

      {/* Preview Modal - Carte Cadeau Visuelle */}
      {showCardPreview && previewCard && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowCardPreview(false);
            setPreviewCard(null);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2c3e50]">Carte Cadeau</h3>
              <button
                onClick={() => {
                  setShowCardPreview(false);
                  setPreviewCard(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Template de carte cadeau */}
            <div className="relative bg-gradient-to-br from-[#f8f6f0] via-[#fdfbf7] to-[#f5f0e8] rounded-2xl p-8 border-4 border-[#d4b5a0] shadow-2xl">
              {/* Motifs décoratifs */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#d4b5a0]/20 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#c9a084]/20 rounded-full translate-x-20 translate-y-20"></div>

              {/* Logo/Nom institut */}
              <div className="text-center mb-6 relative z-10">
                <Gift className="w-16 h-16 mx-auto text-[#d4b5a0] mb-2" />
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50]">LAIA SKIN INSTITUT</h2>
                <p className="text-[#c9a084] text-lg font-medium">Carte Cadeau</p>
              </div>

              {/* Montant */}
              <div className="bg-white/90 backdrop-blur rounded-xl p-6 mb-6 text-center relative z-10 border-2 border-[#d4b5a0]/30">
                <p className="text-[#c9a084] text-sm mb-2 font-medium">Valeur</p>
                <p className="text-5xl font-bold text-[#d4b5a0]">{previewCard.amount}€</p>
                {previewCard.balance < previewCard.amount && (
                  <p className="text-sm text-gray-600 mt-2">
                    Solde restant: <strong className="text-green-600">{previewCard.balance}€</strong>
                  </p>
                )}
              </div>

              {/* Infos bénéficiaire et émetteur */}
              {(previewCard.purchasedFor || previewCard.purchaser) && (
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-4 relative z-10 border-2 border-[#d4b5a0]/20">
                  {previewCard.purchaser && (
                    <div className="mb-3 pb-3 border-b border-[#d4b5a0]/20">
                      <p className="text-[#c9a084] text-xs font-medium">De la part de</p>
                      <p className="text-lg font-semibold text-[#2c3e50]">{previewCard.purchaser.name}</p>
                    </div>
                  )}
                  {previewCard.purchasedFor && (
                    <>
                      <p className="text-[#c9a084] text-sm font-medium">Pour</p>
                      <p className="text-2xl font-bold text-[#2c3e50]">{previewCard.purchasedFor}</p>
                    </>
                  )}
                  {previewCard.message && (
                    <p className="text-gray-600 italic mt-2 text-sm">"{previewCard.message}"</p>
                  )}
                </div>
              )}

              {/* Code */}
              <div className="bg-white/90 backdrop-blur rounded-xl p-4 text-center relative z-10 mb-4 border-2 border-[#d4b5a0]/30">
                <p className="text-[#c9a084] text-sm mb-1 font-medium">Code</p>
                <p className="font-mono font-bold text-2xl text-[#2c3e50]">{previewCard.code}</p>
              </div>

              {/* Infos supplémentaires */}
              <div className="text-center text-sm text-[#2c3e50]/70 relative z-10">
                <p>Valable jusqu'au {new Date(previewCard.expiryDate || new Date(Date.now() + 365*24*60*60*1000)).toLocaleDateString('fr-FR')}</p>
                <p className="mt-1">Utilisable sur tous nos soins et produits</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {previewCard.recipientEmail && (
                <button
                  onClick={() => {
                    handleSendEmail(previewCard);
                    setShowCardPreview(false);
                  }}
                  disabled={sendingEmail}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300"
                >
                  <Mail className="w-5 h-5" />
                  Envoyer par email
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Imprimer
              </button>
              <button
                onClick={() => {
                  setShowCardPreview(false);
                  setPreviewCard(null);
                }}
                className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <>
        {/* Onglet Personnalisation */}
        <div className="max-w-4xl mx-auto">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Paramètres Email */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Personnalisation des Emails
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      Sujet de l'email
                    </label>
                    <input
                      type="text"
                      value={settings.emailSubject}
                      onChange={(e) => setSettings({...settings, emailSubject: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sujet de l'email..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      Titre principal
                    </label>
                    <input
                      type="text"
                      value={settings.emailTitle}
                      onChange={(e) => setSettings({...settings, emailTitle: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Titre de l'email..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      Introduction
                    </label>
                    <textarea
                      value={settings.emailIntro}
                      onChange={(e) => setSettings({...settings, emailIntro: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Texte d'introduction..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      Instructions d'utilisation
                    </label>
                    <textarea
                      value={settings.emailInstructions}
                      onChange={(e) => setSettings({...settings, emailInstructions: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Instructions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      Pied de page
                    </label>
                    <textarea
                      value={settings.emailFooter}
                      onChange={(e) => setSettings({...settings, emailFooter: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Pied de page..."
                    />
                  </div>
                </div>
              </div>

              {/* Paramètres Carte Physique */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-6 border-2 border-pink-200">
                <h4 className="text-lg font-bold text-pink-900 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Personnalisation de la Carte Physique/PDF
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pink-900 mb-1">
                      Titre principal
                    </label>
                    <input
                      type="text"
                      value={settings.physicalCardTitle}
                      onChange={(e) => setSettings({...settings, physicalCardTitle: e.target.value})}
                      className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="CARTE CADEAU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pink-900 mb-1">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      value={settings.physicalCardSubtitle}
                      onChange={(e) => setSettings({...settings, physicalCardSubtitle: e.target.value})}
                      className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Nom de l'institut"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pink-900 mb-1">
                      Mention de validité
                    </label>
                    <input
                      type="text"
                      value={settings.physicalCardValidity}
                      onChange={(e) => setSettings({...settings, physicalCardValidity: e.target.value})}
                      className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Valable 1 an"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pink-900 mb-1">
                      Instructions
                    </label>
                    <textarea
                      value={settings.physicalCardInstructions}
                      onChange={(e) => setSettings({...settings, physicalCardInstructions: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      placeholder="Instructions d'utilisation..."
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {savingSettings ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                </button>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
