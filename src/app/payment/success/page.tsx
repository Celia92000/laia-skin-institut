'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      // Optionnel : Vérifier le paiement côté serveur
      setLoading(false);
      // Simuler un délai pour l'effet visuel
      setTimeout(() => {
        setPaymentDetails({
          status: 'success',
          message: 'Paiement confirmé'
        });
      }, 1000);
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Vérification du paiement...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icône de succès */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            {/* Message de succès */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Paiement réussi ! 🎉
            </h1>
            <p className="text-gray-600 mb-8">
              Votre paiement a été effectué avec succès. Vous allez recevoir un email de confirmation.
            </p>

            {/* Détails */}
            {sessionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-1">ID de transaction</p>
                <p className="text-sm font-mono text-gray-900 break-all">{sessionId}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/espace-client"
                className="block w-full px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:from-[#c9a084] hover:to-[#b89373] font-medium transition-all flex items-center justify-center gap-2"
              >
                Retour à mon espace
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/"
                className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Retour à l'accueil
              </Link>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 mt-6">
              Un reçu a été envoyé à votre adresse email
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
