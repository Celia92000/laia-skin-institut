'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react';

function CommandeSuccesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // Optionnel : Récupérer les détails de la commande
      // Pour l'instant on affiche juste la confirmation
      setTimeout(() => setLoading(false), 1000);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Icône de succès */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Paiement réussi !
        </h1>

        <p className="text-center text-gray-600 text-lg mb-8">
          Votre commande a été confirmée et votre paiement a été traité avec succès.
        </p>

        {/* Détails */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <Mail className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Confirmation par email</h3>
              <p className="text-gray-600 text-sm">
                Un email de confirmation contenant tous les détails de votre commande vous a été envoyé.
              </p>
            </div>
          </div>

          {sessionId && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-gray-500">
                Numéro de transaction : <span className="font-mono">{sessionId.substring(0, 24)}...</span>
              </p>
            </div>
          )}
        </div>

        {/* Prochaines étapes */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-rose-600 text-sm font-bold">1</span>
              </div>
              <p className="text-gray-700">
                Consultez votre email pour les détails de la commande
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-rose-600 text-sm font-bold">2</span>
              </div>
              <p className="text-gray-700">
                Nous préparons votre commande et vous tiendrons informé(e)
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-rose-600 text-sm font-bold">3</span>
              </div>
              <p className="text-gray-700">
                Pour toute question, contactez-nous à contact@laiaskininstitut.fr
              </p>
            </li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            Retour à l'accueil
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/produits"
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:border-rose-300 hover:bg-rose-50 transition text-center"
          >
            Continuer mes achats
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">
            Besoin d'aide ? <a href="mailto:contact@laiaskininstitut.fr" className="text-rose-600 hover:underline">Contactez-nous</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CommandeSuccesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <CommandeSuccesContent />
    </Suspense>
  );
}
