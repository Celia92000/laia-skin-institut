'use client';

import { useState, useEffect } from 'react';
import { Gift, CreditCard, Euro, Banknote, Building2, CheckCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { InvoiceButton } from './InvoiceGenerator';
import ReservationPaymentButton from './ReservationPaymentButton';

interface PaymentSectionProps {
  reservation: any;
  loyaltyProfiles: any[];
  recordPayment: (reservationId: string, appliedDiscount?: { type: string, amount: number }, paymentDetails?: any) => void;
}

interface AvailableDiscount {
  type: string;
  amount: number;
  description: string;
  icon: any;
  color: string;
}

export default function PaymentSectionOptimized({ reservation, loyaltyProfiles, recordPayment }: PaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'stripe'>('card');
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState<AvailableDiscount[]>([]);
  const [manualDiscountAmount, setManualDiscountAmount] = useState(0);
  const [manualDiscountReason, setManualDiscountReason] = useState('');

  // Trouver le profil de fidélité
  const userProfile = loyaltyProfiles.find(p => p.user.email === reservation.userEmail);

  // Calculer les réductions disponibles
  const availableDiscounts: AvailableDiscount[] = [];

  if (userProfile && userProfile.individualServicesCount >= 5) {
    availableDiscounts.push({
      type: 'individual',
      amount: 20,
      description: '5 soins réalisés',
      icon: Gift,
      color: 'bg-[#d4b5a0]'
    });
  }

  if (userProfile && userProfile.packagesCount >= 3) {
    availableDiscounts.push({
      type: 'package',
      amount: 40,
      description: '3 forfaits achetés',
      icon: Gift,
      color: 'bg-purple-500'
    });
  }

  const totalDiscounts = appliedDiscounts.reduce((sum, d) => sum + d.amount, 0);
  const finalPrice = Math.max(0, reservation.totalPrice - totalDiscounts);

  const toggleDiscount = (discount: AvailableDiscount) => {
    const isApplied = appliedDiscounts.some(d => d.type === discount.type && d.description === discount.description);
    if (isApplied) {
      setAppliedDiscounts(appliedDiscounts.filter(d => !(d.type === discount.type && d.description === discount.description)));
    } else {
      setAppliedDiscounts([...appliedDiscounts, discount]);
    }
  };

  const addManualDiscount = () => {
    if (manualDiscountAmount > 0 && manualDiscountReason) {
      setAppliedDiscounts([...appliedDiscounts, {
        type: 'manual',
        amount: manualDiscountAmount,
        description: manualDiscountReason,
        icon: Gift,
        color: 'bg-orange-500'
      }]);
      setManualDiscountAmount(0);
      setManualDiscountReason('');
    }
  };

  const handlePayment = () => {
    const combinedDiscount = appliedDiscounts.length > 0
      ? {
          type: appliedDiscounts.map(d => d.type).join('+'),
          amount: totalDiscounts,
          details: appliedDiscounts
        }
      : undefined;

    recordPayment(reservation.id, combinedDiscount, null);
  };

  return (
    <div className="border-t border-[#d4b5a0]/10 pt-6 space-y-4">

      {/* 1. PRIX - Toujours visible */}
      <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-[#2c3e50]/60">Montant à payer</p>
            {totalDiscounts > 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">
                {totalDiscounts}€ de réduction appliquée
              </p>
            )}
          </div>
          <div className="text-right">
            {totalDiscounts > 0 && (
              <p className="text-sm text-gray-400 line-through">{reservation.totalPrice}€</p>
            )}
            <p className="text-3xl font-bold text-[#d4b5a0]">{finalPrice}€</p>
          </div>
        </div>

        {/* Réductions disponibles - Accordéon */}
        {availableDiscounts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#d4b5a0]/20">
            <button
              onClick={() => setShowDiscounts(!showDiscounts)}
              className="flex items-center justify-between w-full text-sm font-medium text-green-700 hover:text-green-800"
            >
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {availableDiscounts.length} réduction(s) disponible(s)
              </span>
              {showDiscounts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDiscounts && (
              <div className="mt-3 space-y-2">
                {/* Réductions fidélité */}
                {availableDiscounts.map((discount, index) => {
                  const isApplied = appliedDiscounts.some(d => d.type === discount.type);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDiscount(discount)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        isApplied
                          ? 'bg-green-100 ring-2 ring-green-500'
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="text-sm font-medium">{discount.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">-{discount.amount}€</span>
                        {isApplied && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    </button>
                  );
                })}

                {/* Réduction manuelle */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-2">Réduction exceptionnelle</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Montant"
                      value={manualDiscountAmount || ''}
                      onChange={(e) => setManualDiscountAmount(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Raison"
                      value={manualDiscountReason}
                      onChange={(e) => setManualDiscountReason(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={addManualDiscount}
                      disabled={!manualDiscountAmount || !manualDiscountReason}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Réductions appliquées */}
                {appliedDiscounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {appliedDiscounts.map((discount, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                      >
                        -{discount.amount}€ {discount.description}
                        <button
                          onClick={() => toggleDiscount(discount)}
                          className="hover:text-green-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. MÉTHODE DE PAIEMENT */}
      <div>
        <h4 className="text-sm font-medium text-[#2c3e50] mb-3">Choisir le mode de paiement</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'cash'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Banknote className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-500'}`} />
            <p className="text-xs font-medium">Espèces</p>
          </button>

          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-500'}`} />
            <p className="text-xs font-medium">Carte</p>
          </button>

          <button
            onClick={() => setPaymentMethod('transfer')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'transfer'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Building2 className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'transfer' ? 'text-purple-600' : 'text-gray-500'}`} />
            <p className="text-xs font-medium">Virement</p>
          </button>

          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'stripe'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'stripe' ? 'text-indigo-600' : 'text-gray-500'}`} />
            <p className="text-xs font-medium">Stripe</p>
          </button>
        </div>
      </div>

      {/* 3. ACTIONS */}
      <div className="pt-2">
        {paymentMethod === 'stripe' ? (
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-indigo-800 mb-3">
                <strong>Paiement en ligne sécurisé</strong><br />
                Générez un lien pour que le client paie par carte en ligne
              </p>
              <ReservationPaymentButton
                reservationId={reservation.id}
                amount={finalPrice}
                serviceName={reservation.services?.[0] || reservation.serviceName || 'Prestation'}
                paymentStatus={reservation.paymentStatus || 'unpaid'}
                paymentMethod={reservation.paymentMethod}
                onPaymentInitiated={() => window.location.reload()}
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handlePayment}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmer le paiement
            </button>
            <InvoiceButton reservation={{
              ...reservation,
              client: reservation.userName || 'Client',
              email: reservation.userEmail,
              finalPrice: finalPrice,
              appliedDiscounts: appliedDiscounts
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
