'use client';

import { useEffect, useState } from 'react';
import { Gift, CheckCircle, Calendar, CreditCard, X, Plus, Edit, Trash2, Eye, Search, Mail, Settings, Save, User, Download } from 'lucide-react';
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
  paymentStatus?: string;
  paymentMethod?: string;
  purchaseDate: string;
  createdAt: string;
  expiryDate?: string;
  usedDate?: string;
  notes?: string;
  purchaser?: {
    id: string;
    name: string;
    email: string;
  };
  reservations?: any[];
}

export default function AdminCardsOrdersTab() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'settings'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal états
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [processing, setProcessing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [previewCard, setPreviewCard] = useState<GiftCard | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Settings
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

  const fetchGiftCards = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/gift-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGiftCards(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes cadeaux:', error);
    } finally {
      setLoading(false);
    }
  };

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
              alert(`✅ Carte cadeau créée et envoyée à ${newCard.recipientEmail} !`);
            } else {
              alert('✅ Carte créée mais erreur lors de l\'envoi de l\'email. Vous pouvez le renvoyer manuellement.');
            }
          } catch (emailError) {
            alert('✅ Carte créée mais erreur lors de l\'envoi de l\'email. Vous pouvez le renvoyer manuellement.');
          }
        } else {
          alert('✅ Carte cadeau créée avec succès !');
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
        alert(`❌ Erreur: ${error.error || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      console.error('Erreur création carte cadeau:', error);
      alert('❌ Erreur lors de la création de la carte cadeau');
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
        alert('✅ Carte cadeau supprimée');
        fetchGiftCards();
      }
    } catch (error) {
      console.error('Erreur suppression carte cadeau:', error);
      alert('❌ Erreur lors de la suppression');
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
        alert('✅ Carte cadeau mise à jour');
        setShowEditModal(false);
        setSelectedCard(null);
        fetchGiftCards();
      }
    } catch (error) {
      console.error('Erreur mise à jour carte cadeau:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const handlePaymentRecord = async () => {
    if (!selectedCard) return;

    setProcessing(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
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
        fetchGiftCards();
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

  const handleSendEmail = async (card: GiftCard) => {
    if (!card.recipientEmail && !card.purchaser?.email) {
      alert('❌ Aucun email disponible pour l\'envoi');
      return;
    }

    const email = card.recipientEmail || card.purchaser?.email;
    if (!confirm(`Envoyer la carte cadeau à ${email} ?`)) return;

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
        alert(`✅ Carte cadeau envoyée à ${email} !`);
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Erreur lors de l\'envoi'}`);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('❌ Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Filtrer les cartes selon l'onglet actif
  const filteredGiftCards = () => {
    let cards = giftCards;

    if (activeTab === 'pending') {
      cards = cards.filter(gc => gc.paymentStatus === 'pending' || !gc.paymentStatus);
    }

    if (searchTerm) {
      cards = cards.filter(card =>
        card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.purchasedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.purchaser?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return cards;
  };

  const displayedCards = filteredGiftCards();
  const pendingCount = giftCards.filter(gc => gc.paymentStatus === 'pending' || !gc.paymentStatus).length;

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
              Cartes Cadeaux
            </h2>
            <p className="text-gray-600 mt-2">
              Gérez toutes les cartes cadeaux : commandes, paiements, envois
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-pink-600">{giftCards.length}</p>
            <p className="text-sm text-gray-600">cartes totales</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            En attente de paiement
            {pendingCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-pink-500 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gift className="w-5 h-5" />
            Toutes les cartes
            <span className="text-xs text-gray-500">({giftCards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-gray-500 text-gray-600 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            Personnalisation
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'settings' ? (
            // Onglet Paramètres
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800">Personnaliser les emails et cartes cadeaux</h3>

              {settingsLoading ? (
                <div className="text-center py-8">Chargement des paramètres...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre de l'email
                      </label>
                      <input
                        type="text"
                        value={settings.emailTitle}
                        onChange={(e) => setSettings({...settings, emailTitle: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introduction de l'email
                      </label>
                      <textarea
                        value={settings.emailIntro}
                        onChange={(e) => setSettings({...settings, emailIntro: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </label>
                      <textarea
                        value={settings.emailInstructions}
                        onChange={(e) => setSettings({...settings, emailInstructions: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pied de page
                      </label>
                      <input
                        type="text"
                        value={settings.emailFooter}
                        onChange={(e) => setSettings({...settings, emailFooter: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={savingSettings}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                  </button>
                </>
              )}
            </div>
          ) : (
            // Onglets Liste
            <>
              {/* Barre d'actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par code, bénéficiaire, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle carte
                </button>
              </div>

              {/* Liste des cartes */}
              {displayedCards.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {activeTab === 'pending' ? 'Aucune carte en attente de paiement' : 'Aucune carte cadeau trouvée'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {displayedCards.map((card) => (
                    <div key={card.id} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-5 border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-pink-600" />
                            <span className="font-mono font-bold text-pink-700">{card.code}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              card.status === 'active' ? 'bg-green-100 text-green-700' :
                              card.status === 'used' ? 'bg-gray-100 text-gray-700' :
                              card.status === 'expired' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {card.status === 'active' ? '✓ Active' :
                               card.status === 'used' ? 'Utilisée' :
                               card.status === 'expired' ? 'Expirée' : 'Annulée'}
                            </span>
                            {(card.paymentStatus === 'pending' || !card.paymentStatus) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                ⏳ Paiement en attente
                              </span>
                            )}
                            {card.paymentStatus === 'paid' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                ✓ Payée
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bénéficiaire */}
                      {card.purchasedFor && (
                        <div className="bg-pink-100 border border-pink-300 rounded-lg p-2 mb-2">
                          <p className="text-xs text-pink-600 font-medium mb-1">Bénéficiaire</p>
                          <p className="text-pink-900 font-bold">{card.purchasedFor}</p>
                          {card.recipientEmail && (
                            <p className="text-pink-700 text-xs truncate">{card.recipientEmail}</p>
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

                      {/* Message */}
                      {card.message && (
                        <div className="bg-white/50 rounded-lg p-2 mb-2">
                          <p className="text-xs text-gray-700 italic">"{card.message}"</p>
                        </div>
                      )}

                      {/* Montants */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Montant:</span>
                          <span className="font-bold text-pink-600">{card.amount}€</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Solde:</span>
                          <span className={`font-bold ${card.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {card.balance}€
                          </span>
                        </div>
                        {card.paymentMethod && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <CreditCard className="w-3 h-3" />
                            <span>Payée par: <strong>{card.paymentMethod}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <p>Créée: {new Date(card.createdAt || card.purchaseDate).toLocaleDateString('fr-FR')}</p>
                        {card.expiryDate && (
                          <p className="text-orange-600">
                            Expire: {new Date(card.expiryDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>

                      {/* Utilisations */}
                      {card.reservations && card.reservations.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-3">
                          <p className="text-xs text-purple-600 font-medium mb-1">
                            Utilisations ({card.reservations.length})
                          </p>
                          <div className="space-y-1">
                            {card.reservations.map((res: any) => (
                              <div key={res.id} className="text-xs text-purple-800 flex justify-between">
                                <span>{new Date(res.date).toLocaleDateString('fr-FR')}</span>
                                <span className="font-semibold">{res.giftCardUsedAmount || 0}€</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        {(card.paymentStatus === 'pending' || !card.paymentStatus) && (
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setShowPaymentModal(true);
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            Enregistrer le paiement
                          </button>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPreviewCard(card);
                              setShowCardPreview(true);
                            }}
                            className="flex-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>

                          {(card.recipientEmail || card.purchaser?.email) && (
                            <button
                              onClick={() => handleSendEmail(card)}
                              disabled={sendingEmail}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                            >
                              <Mail className="w-4 h-4" />
                              Email
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setShowEditModal(true);
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nouvelle carte cadeau</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (€) *</label>
                <input
                  type="number"
                  value={newCard.amount}
                  onChange={(e) => setNewCard({...newCard, amount: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'émetteur</label>
                <input
                  type="text"
                  value={newCard.senderName}
                  onChange={(e) => setNewCard({...newCard, senderName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du bénéficiaire</label>
                <input
                  type="text"
                  value={newCard.purchasedFor}
                  onChange={(e) => setNewCard({...newCard, purchasedFor: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email du bénéficiaire</label>
                <input
                  type="email"
                  value={newCard.recipientEmail}
                  onChange={(e) => setNewCard({...newCard, recipientEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={newCard.recipientPhone}
                  onChange={(e) => setNewCard({...newCard, recipientPhone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message personnalisé</label>
                <textarea
                  value={newCard.message}
                  onChange={(e) => setNewCard({...newCard, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                <input
                  type="date"
                  value={newCard.expiryDate}
                  onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <select
                  value={newCard.paymentMethod}
                  onChange={(e) => setNewCard({...newCard, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="CB">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes internes</label>
                <textarea
                  value={newCard.notes}
                  onChange={(e) => setNewCard({...newCard, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCard}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Créer la carte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition - À compléter si nécessaire */}
      {showEditModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Modifier la carte cadeau</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCard(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solde (€)</label>
                <input
                  type="number"
                  value={selectedCard.balance}
                  onChange={(e) => setSelectedCard({...selectedCard, balance: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={selectedCard.status}
                  onChange={(e) => setSelectedCard({...selectedCard, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="active">Active</option>
                  <option value="used">Utilisée</option>
                  <option value="expired">Expirée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={selectedCard.notes || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCard(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateCard}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showCardPreview && previewCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Aperçu de la carte cadeau</h3>
              <button
                onClick={() => {
                  setShowCardPreview(false);
                  setPreviewCard(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-8 text-white">
              <div className="text-center mb-6">
                <Gift className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <h4 className="text-3xl font-bold mb-2">CARTE CADEAU</h4>
                <p className="text-white/80 text-lg">Laia Skin Institut</p>
              </div>

              <div className="bg-white/20 rounded-lg p-6 mb-6">
                <p className="text-white/80 text-sm mb-2">Code de la carte</p>
                <p className="font-mono font-bold text-2xl tracking-wider">{previewCard.code}</p>
              </div>

              <div className="bg-white/20 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Valeur</span>
                  <span className="text-4xl font-bold">{previewCard.amount}€</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/80">Solde restant</span>
                  <span className="text-2xl font-bold">{previewCard.balance}€</span>
                </div>
              </div>

              {previewCard.purchasedFor && (
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-white/70 text-sm">Bénéficiaire</p>
                  <p className="font-semibold text-lg">{previewCard.purchasedFor}</p>
                </div>
              )}

              {previewCard.message && (
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-white/70 text-sm mb-2">Message personnalisé</p>
                  <p className="italic">"{previewCard.message}"</p>
                </div>
              )}

              <div className="text-center text-white/70 text-xs">
                <p>Valable jusqu'au {previewCard.expiryDate ? new Date(previewCard.expiryDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
                <p className="mt-2">Utilisable pour tous les soins et services de l'institut</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCardPreview(false);
                setPreviewCard(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
