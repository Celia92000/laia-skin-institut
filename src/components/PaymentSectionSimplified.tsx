'use client';

import { useState } from 'react';
import { CreditCard, Banknote, Building2, CheckCircle, Gift } from 'lucide-react';
import { InvoiceButton } from './InvoiceGenerator';
import ReservationPaymentButton from './ReservationPaymentButton';

interface PaymentSectionProps {
  reservation: any;
  loyaltyProfiles: any[];
  recordPayment: (reservationId: string, appliedDiscount?: { type: string, amount: number }, paymentDetails?: any) => void;
}

export default function PaymentSectionSimplified({ reservation, loyaltyProfiles, recordPayment }: PaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'stripe'>('card');
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');

  const originalPrice = reservation.totalPrice || 0;
  const finalPrice = Math.max(0, originalPrice - discount);

  const handlePayment = () => {
    const paymentDiscount = discount > 0
      ? { type: 'manual', amount: discount, reason: discountReason }
      : undefined;

    const paymentDetails = {
      method: paymentMethod,
      amount: finalPrice,
      originalPrice: originalPrice,
      discount: discount
    };

    recordPayment(reservation.id, paymentDiscount, paymentDetails);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* En-tête avec prix */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Encaisser le paiement</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Montant total</p>
          <p className="text-2xl font-bold text-[#d4b5a0]">{finalPrice.toFixed(2)}€</p>
          {discount > 0 && (
            <p className="text-xs text-gray-400 line-through">{originalPrice.toFixed(2)}€</p>
          )}
        </div>
      </div>

      {/* Réduction rapide */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-green-900">Réduction (optionnel)</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Montant (€)"
            value={discount || ''}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Raison"
            value={discountReason}
            onChange={(e) => setDiscountReason(e.target.value)}
            className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Choix de la méthode de paiement */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Méthode de paiement</h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Espèces */}
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'cash'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Banknote className={`w-8 h-8 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${paymentMethod === 'cash' ? 'text-green-900' : 'text-gray-700'}`}>
                Espèces
              </span>
            </div>
          </button>

          {/* Carte bancaire */}
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${paymentMethod === 'card' ? 'text-blue-900' : 'text-gray-700'}`}>
                Carte
              </span>
            </div>
          </button>

          {/* Virement */}
          <button
            onClick={() => setPaymentMethod('transfer')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'transfer'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Building2 className={`w-8 h-8 ${paymentMethod === 'transfer' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${paymentMethod === 'transfer' ? 'text-purple-900' : 'text-gray-700'}`}>
                Virement
              </span>
            </div>
          </button>

          {/* Stripe */}
          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'stripe'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <CreditCard className={`w-8 h-8 ${paymentMethod === 'stripe' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className={`font-medium text-xs ${paymentMethod === 'stripe' ? 'text-indigo-900' : 'text-gray-700'}`}>
                Stripe (en ligne)
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Actions selon la méthode */}
      {paymentMethod === 'stripe' ? (
        <div className="space-y-3">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-900 mb-3">
              📧 Un lien de paiement sécurisé sera envoyé au client pour payer en ligne
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
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Valider le paiement de {finalPrice.toFixed(2)}€
          </button>

          <InvoiceButton
            reservation={{
              ...reservation,
              client: reservation.userName || 'Client',
              email: reservation.userEmail,
              finalPrice: finalPrice,
              appliedDiscounts: discount > 0 ? [{ type: 'manual', amount: discount, description: discountReason }] : []
            }}
          />
        </div>
      )}

      {/* Info paiement */}
      <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
        <p>✓ Le paiement sera enregistré dans l'historique</p>
        <p>✓ Une facture peut être générée après validation</p>
        {paymentMethod === 'stripe' && <p>✓ Le client recevra un reçu par email</p>}
      </div>
    </div>
  );
}
