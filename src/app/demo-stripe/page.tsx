'use client';

import { useState } from 'react';
import StripePaymentButton from '@/components/StripePaymentButton';
import { CreditCard, Check, Info } from 'lucide-react';
import Link from 'next/link';

export default function DemoStripePage() {
  const [amount, setAmount] = useState(50);
  const [description, setDescription] = useState('Soin visage - Hydratation profonde');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Démo Paiement Stripe 💳
          </h1>
          <p className="text-gray-600">
            Testez l'intégration Stripe avec Stripe Checkout
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">📋 Prérequis</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Activez Stripe dans <strong>Paramètres → Intégrations</strong></li>
                <li>Configurez vos clés API Stripe (mode test recommandé)</li>
                <li>Connectez-vous en tant que client</li>
                <li>Testez le paiement avec les cartes de test Stripe</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-7 h-7" />
              Configuration du paiement
            </h2>

            <div className="space-y-6">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Bouton de paiement */}
              <div className="pt-4">
                <StripePaymentButton
                  amount={amount}
                  currency="eur"
                  description={description}
                  metadata={{
                    demo: true,
                    source: 'demo-page'
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Cartes de test */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🧪 Cartes de Test Stripe
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Paiement réussi</span>
                </div>
                <p className="font-mono text-sm text-green-800">4242 4242 4242 4242</p>
              </div>

              <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-red-900">❌ Carte refusée</span>
                </div>
                <p className="font-mono text-sm text-red-800">4000 0000 0000 0002</p>
              </div>

              <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-purple-900">🔒 3D Secure requis</span>
                </div>
                <p className="font-mono text-sm text-purple-800">4000 0027 6000 3184</p>
              </div>

              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-blue-900">💳 Mastercard</span>
                </div>
                <p className="font-mono text-sm text-blue-800">5555 5555 5555 4444</p>
              </div>

              <div className="text-xs text-gray-500 mt-4 space-y-1">
                <p><strong>Date expiration :</strong> N'importe quelle date future (ex: 12/28)</p>
                <p><strong>CVV :</strong> N'importe quel 3 chiffres (ex: 123)</p>
                <p><strong>Code postal :</strong> N'importe quel code valide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">🔗 Liens utiles</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/settings"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
            >
              <p className="font-semibold text-gray-900">⚙️ Paramètres</p>
              <p className="text-xs text-gray-600 mt-1">Configurer Stripe</p>
            </Link>

            <a
              href="https://dashboard.stripe.com/test/payments"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
            >
              <p className="font-semibold text-gray-900">📊 Dashboard Stripe</p>
              <p className="text-xs text-gray-600 mt-1">Voir les paiements</p>
            </a>

            <a
              href="https://stripe.com/docs/testing"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
            >
              <p className="font-semibold text-gray-900">📚 Documentation</p>
              <p className="text-xs text-gray-600 mt-1">Guide de test Stripe</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
