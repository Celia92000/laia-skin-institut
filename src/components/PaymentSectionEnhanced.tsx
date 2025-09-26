'use client';

import { useState, useEffect } from 'react';
import { Gift, CreditCard, Euro, Banknote, Building2, Users, Cake, Star, CheckCircle, AlertCircle, X } from 'lucide-react';
import { InvoiceButton } from './InvoiceGenerator';

interface PaymentSectionProps {
  reservation: any;
  loyaltyProfiles: any[];
  recordPayment: (reservationId: string, appliedDiscount?: { type: string, amount: number }, paymentDetails?: any) => void;
}

interface AvailableDiscount {
  type: 'individual' | 'package' | 'birthday' | 'referral' | 'manual';
  amount: number;
  description: string;
  icon: any;
  color: string;
  automatic?: boolean;
}

export default function PaymentSectionEnhanced({ reservation, loyaltyProfiles, recordPayment }: PaymentSectionProps) {
  const [appliedDiscounts, setAppliedDiscounts] = useState<AvailableDiscount[]>([]);
  const [paymentMode, setPaymentMode] = useState<'simple' | 'mixed'>('simple');
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [showManualDiscount, setShowManualDiscount] = useState(false);
  const [manualDiscountAmount, setManualDiscountAmount] = useState(0);
  const [manualDiscountReason, setManualDiscountReason] = useState('');
  const [availableReferralRewards, setAvailableReferralRewards] = useState(0);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  
  // Trouver le profil de fidélité du client
  const userProfile = loyaltyProfiles.find(p => p.user.email === reservation.userEmail);
  
  // Calculer les réductions disponibles
  const availableDiscounts: AvailableDiscount[] = [];
  
  // 5 soins individuels = -20€
  if (userProfile && userProfile.individualServicesCount >= 5) {
    availableDiscounts.push({
      type: 'individual',
      amount: 20,
      description: '5 soins réalisés',
      icon: Gift,
      color: 'bg-[#d4b5a0]',
      automatic: true
    });
  }
  
  // 3 forfaits = -30€
  if (userProfile && userProfile.packagesCount >= 3) {
    availableDiscounts.push({
      type: 'package',
      amount: 30,
      description: '3 forfaits achetés',
      icon: Star,
      color: 'bg-purple-500',
      automatic: true
    });
  }
  
  // Anniversaire = -10€
  if (userProfile && userProfile.user.birthDate) {
    const birthDate = new Date(userProfile.user.birthDate);
    const today = new Date();
    if (birthDate.getMonth() === today.getMonth()) {
      availableDiscounts.push({
        type: 'birthday',
        amount: 10,
        description: `Anniversaire (${birthDate.getDate()}/${birthDate.getMonth() + 1})`,
        icon: Cake,
        color: 'bg-pink-500',
        automatic: true
      });
    }
  }

  // Charger les récompenses de parrainage disponibles
  useEffect(() => {
    const fetchReferralRewards = async () => {
      if (!userProfile) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/referral/available', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userProfile.userId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAvailableReferralRewards(data.totalAmount || 0);
          
          // Ajouter les réductions de parrainage disponibles
          if (data.rewards && data.rewards.length > 0) {
            data.rewards.forEach((reward: any) => {
              availableDiscounts.push({
                type: 'referral',
                amount: reward.amount,
                description: `Parrainage de ${reward.referredName}`,
                icon: Users,
                color: 'bg-green-500',
                automatic: false
              });
            });
          }
        }
      } catch (error) {
        console.error('Erreur chargement parrainages:', error);
      } finally {
        setLoadingReferrals(false);
      }
    };

    fetchReferralRewards();
  }, [userProfile]);

  // Calculer le montant total des réductions appliquées
  const totalDiscounts = appliedDiscounts.reduce((sum, d) => sum + d.amount, 0);
  const finalPrice = Math.max(0, reservation.totalPrice - totalDiscounts);

  // Appliquer ou retirer une réduction
  const toggleDiscount = (discount: AvailableDiscount) => {
    const isApplied = appliedDiscounts.some(d => d.type === discount.type && d.description === discount.description);
    
    if (isApplied) {
      setAppliedDiscounts(appliedDiscounts.filter(d => !(d.type === discount.type && d.description === discount.description)));
    } else {
      setAppliedDiscounts([...appliedDiscounts, discount]);
    }
  };

  // Ajouter une réduction manuelle
  const addManualDiscount = () => {
    if (manualDiscountAmount > 0 && manualDiscountReason) {
      const manualDiscount: AvailableDiscount = {
        type: 'manual',
        amount: manualDiscountAmount,
        description: manualDiscountReason,
        icon: Gift,
        color: 'bg-blue-500',
        automatic: false
      };
      
      setAppliedDiscounts([...appliedDiscounts, manualDiscount]);
      setManualDiscountAmount(0);
      setManualDiscountReason('');
      setShowManualDiscount(false);
    }
  };

  // Valider le paiement
  const handlePayment = () => {
    const paymentDetails = paymentMode === 'mixed' 
      ? { 
          cash: cashAmount, 
          card: cardAmount, 
          transfer: transferAmount,
          total: cashAmount + cardAmount + transferAmount
        }
      : null;
    
    // Combiner toutes les réductions en une seule
    const combinedDiscount = appliedDiscounts.length > 0
      ? {
          type: appliedDiscounts.map(d => d.type).join('+'),
          amount: totalDiscounts,
          details: appliedDiscounts.map(d => ({
            type: d.type,
            amount: d.amount,
            description: d.description
          }))
        }
      : undefined;
    
    recordPayment(reservation.id, combinedDiscount, paymentDetails);
  };

  return (
    <div className="border-t border-[#d4b5a0]/10 pt-4">
      {/* Section des réductions disponibles */}
      {(availableDiscounts.length > 0 || availableReferralRewards > 0) && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Réductions disponibles pour ce client
            </h4>
            <div className="text-sm text-green-700">
              Total disponible: <span className="font-bold">
                {availableDiscounts.reduce((sum, d) => sum + d.amount, 0) + availableReferralRewards}€
              </span>
            </div>
          </div>

          {/* Grille des réductions */}
          <div className="grid md:grid-cols-2 gap-3">
            {availableDiscounts.map((discount, index) => {
              const isApplied = appliedDiscounts.some(d => 
                d.type === discount.type && d.description === discount.description
              );
              const Icon = discount.icon;

              return (
                <div
                  key={`${discount.type}-${index}`}
                  className={`relative rounded-lg p-4 cursor-pointer transition-all ${
                    isApplied 
                      ? 'bg-white ring-2 ring-green-500 shadow-lg' 
                      : 'bg-white/70 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => toggleDiscount(discount)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${discount.color} rounded-full flex items-center justify-center text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[#2c3e50]">{discount.description}</p>
                        {discount.automatic && (
                          <span className="text-xs text-green-600">Automatique</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#2c3e50]">-{discount.amount}€</span>
                      {isApplied && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Réductions de parrainage */}
            {availableReferralRewards > 0 && (
              <div
                className="relative rounded-lg p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2c3e50]">Parrainages disponibles</p>
                      <span className="text-xs text-green-600">Cliquez pour voir le détail</span>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-700">{availableReferralRewards}€</span>
                </div>
              </div>
            )}
          </div>

          {/* Résumé des réductions appliquées */}
          {appliedDiscounts.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
              <h5 className="text-sm font-semibold text-[#2c3e50] mb-2">Réductions appliquées:</h5>
              <div className="space-y-2">
                {appliedDiscounts.map((discount, index) => (
                  <div key={`applied-${index}`} className="flex justify-between items-center text-sm">
                    <span className="text-[#2c3e50]/70">{discount.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">-{discount.amount}€</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDiscount(discount);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-[#2c3e50]">Total des réductions:</span>
                  <span className="text-lg font-bold text-green-600">-{totalDiscounts}€</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bouton pour ajouter une réduction manuelle */}
      <div className="mb-4">
        <button
          onClick={() => setShowManualDiscount(!showManualDiscount)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showManualDiscount ? '▲ Masquer' : '▼ Ajouter une réduction manuelle'}
        </button>
        
        {showManualDiscount && (
          <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">Réduction manuelle</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Montant (€)"
                value={manualDiscountAmount || ''}
                onChange={(e) => setManualDiscountAmount(Number(e.target.value))}
                className="px-3 py-2 border border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Raison (ex: Geste commercial)"
                value={manualDiscountReason}
                onChange={(e) => setManualDiscountReason(e.target.value)}
                className="px-3 py-2 border border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={addManualDiscount}
                disabled={!manualDiscountAmount || !manualDiscountReason}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Ajouter -{manualDiscountAmount || 0}€
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Récapitulatif du prix final */}
      <div className="mb-6 p-4 bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#2c3e50]/60">Prix original</span>
            <span className={`text-sm ${totalDiscounts > 0 ? 'line-through text-gray-400' : 'font-semibold text-[#2c3e50]'}`}>
              {reservation.totalPrice}€
            </span>
          </div>
          {totalDiscounts > 0 && (
            <>
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm font-medium">Réductions appliquées</span>
                <span className="font-semibold">-{totalDiscounts}€</span>
              </div>
              <div className="pt-2 mt-2 border-t border-[#d4b5a0]/20 flex justify-between items-center">
                <span className="text-lg font-bold text-[#2c3e50]">Total à payer</span>
                <span className="text-2xl font-bold text-[#d4b5a0]">{finalPrice}€</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mode de paiement */}
      <h4 className="font-medium text-[#2c3e50] mb-3">Mode de paiement</h4>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPaymentMode('simple')}
            className={`px-4 py-2 rounded-lg transition-all ${
              paymentMode === 'simple'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Paiement simple
          </button>
          <button
            onClick={() => setPaymentMode('mixed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              paymentMode === 'mixed'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Paiement mixte
          </button>
        </div>

        {paymentMode === 'simple' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-[#2c3e50]/60 mb-1 block">Montant payé</label>
              <input
                type="number"
                placeholder="Montant payé"
                defaultValue={finalPrice}
                id={`amount-${reservation.id}`}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-[#2c3e50]/60 mb-1 block">Mode de paiement</label>
              <select
                id={`method-${reservation.id}`}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="transfer">Virement</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-[#2c3e50]/60 mb-1 block">N° Facture</label>
              <input
                type="text"
                placeholder="ex: 2024-001"
                id={`invoice-${reservation.id}`}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-[#2c3e50] mb-3">
                Total à payer : {finalPrice}€
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  <label className="text-sm text-[#2c3e50]/60">Espèces</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-[#d4b5a0]/20 rounded focus:border-[#d4b5a0] focus:outline-none"
                  />
                  <span className="text-sm">€</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <label className="text-sm text-[#2c3e50]/60">Carte</label>
                  <input
                    type="number"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-[#d4b5a0]/20 rounded focus:border-[#d4b5a0] focus:outline-none"
                  />
                  <span className="text-sm">€</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <label className="text-sm text-[#2c3e50]/60">Virement</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-[#d4b5a0]/20 rounded focus:border-[#d4b5a0] focus:outline-none"
                  />
                  <span className="text-sm">€</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total payé :</span>
                  <span className={`font-bold ${
                    cashAmount + cardAmount + transferAmount === finalPrice
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {cashAmount + cardAmount + transferAmount}€
                  </span>
                </div>
                {cashAmount + cardAmount + transferAmount !== finalPrice && (
                  <p className="text-xs text-orange-600 mt-1">
                    Reste : {finalPrice - (cashAmount + cardAmount + transferAmount)}€
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3">
        <button
          onClick={handlePayment}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Valider le paiement
        </button>
        <InvoiceButton reservation={{
          ...reservation,
          client: reservation.userName || 'Client',
          email: reservation.userEmail,
          finalPrice: finalPrice,
          appliedDiscounts: appliedDiscounts
        }} />
      </div>
    </div>
  );
}