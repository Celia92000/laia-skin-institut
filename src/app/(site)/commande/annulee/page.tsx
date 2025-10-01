'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function CommandeAnnuleePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Icône d'annulation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-6">
              <XCircle className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Paiement annulé
        </h1>

        <p className="text-center text-gray-600 text-lg mb-8">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>

        {/* Informations */}
        <div className="bg-orange-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Que s'est-il passé ?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Vous avez annulé le paiement avant qu'il ne soit complété. Votre commande n'a pas été enregistrée.
              </p>
              <p className="text-gray-600 text-sm">
                Si vous avez rencontré un problème ou si vous avez des questions, n'hésitez pas à nous contacter.
              </p>
            </div>
          </div>
        </div>

        {/* Raisons possibles */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Problèmes courants</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2"></div>
              <p className="text-gray-700 text-sm">
                <strong>Délai de paiement expiré</strong> - Veuillez réessayer avec un nouveau paiement
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2"></div>
              <p className="text-gray-700 text-sm">
                <strong>Erreur de carte bancaire</strong> - Vérifiez vos informations de paiement
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2"></div>
              <p className="text-gray-700 text-sm">
                <strong>Problème technique</strong> - Contactez notre support si le problème persiste
              </p>
            </li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            href="/produits"
            className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition text-center"
          >
            Continuer mes achats
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500 mb-2">
            Besoin d'aide avec votre commande ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@laiaskininstitut.fr" className="text-rose-600 hover:underline text-sm font-medium">
              contact@laiaskininstitut.fr
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a href="tel:+33123456789" className="text-rose-600 hover:underline text-sm font-medium">
              01 23 45 67 89
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
