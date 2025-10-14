'use client';

import { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ReservationPaymentButtonProps {
  reservationId: string;
  amount: number;
  serviceName: string;
  paymentStatus: string;
  paymentMethod?: string;
  onPaymentInitiated?: () => void;
}

export default function ReservationPaymentButton({
  reservationId,
  amount,
  serviceName,
  paymentStatus,
  paymentMethod,
  onPaymentInitiated
}: ReservationPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si déjà payée, afficher le badge
  if (paymentStatus === 'paid') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
        <CheckCircle size={16} />
        Payée {paymentMethod && `(${paymentMethod})`}
      </div>
    );
  }

  // Si en attente de paiement
  if (paymentStatus === 'pending') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium">
        <Loader2 size={16} className="animate-spin" />
        En attente de paiement
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        setLoading(false);
        return;
      }

      // Créer une session de paiement Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency: 'eur',
          description: serviceName,
          reservationId,
          metadata: {
            source: 'admin_panel'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        onPaymentInitiated?.();
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de paiement manquante');
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'initialisation du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Payer {amount.toFixed(2)}€
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs">
          <XCircle size={14} />
          {error}
        </div>
      )}

      {paymentStatus === 'unpaid' && (
        <div className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs">
          Non payée
        </div>
      )}
    </div>
  );
}
