'use client';

import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useStripeIntegration } from '@/hooks/useStripeIntegration';

interface StripePaymentButtonProps {
  amount: number;
  currency?: string;
  description: string;
  reservationId?: string;
  productId?: string;
  metadata?: Record<string, any>;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripePaymentButton({
  amount,
  currency = 'eur',
  description,
  reservationId,
  productId,
  metadata = {},
  className = '',
  disabled = false,
  onSuccess,
  onError
}: StripePaymentButtonProps) {
  const { isEnabled, loading: stripeLoading } = useStripeIntegration();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          reservationId,
          productId,
          metadata
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement manquante');
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du paiement';
      setError(errorMessage);
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  // Si Stripe n'est pas activé, ne pas afficher le bouton
  if (!isEnabled && !stripeLoading) {
    return null;
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={disabled || loading || stripeLoading || !isEnabled}
        className={`
          px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg
          hover:from-indigo-700 hover:to-purple-700
          disabled:opacity-50 disabled:cursor-not-allowed
          font-medium transition-all
          flex items-center justify-center gap-2
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirection vers Stripe...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Payer par carte ({amount.toFixed(2)} {currency.toUpperCase()})
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
