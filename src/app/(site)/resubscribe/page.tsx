'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, X } from 'lucide-react';

function ResubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Erreur lors de la réinscription');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f5f1eb] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">
            Réinscription confirmée !
          </h1>
          <p className="text-gray-600 mb-6">
            Vous êtes de nouveau inscrit(e) à notre newsletter.
            <br />Vous recevrez nos prochains emails.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Merci de votre confiance ! 💜
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f5f1eb] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-[#d4b5a0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#d4b5a0]" />
        </div>

        <h1 className="text-2xl font-bold text-[#2c3e50] text-center mb-2">
          Se réinscrire à la newsletter
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Ravis de vous revoir ! Inscrivez-vous à nouveau pour recevoir nos actualités et offres exclusives.
        </p>

        <form onSubmit={handleResubscribe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom (optionnel)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full px-6 py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Réinscription...' : 'Me réinscrire'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            <a href="/" className="text-gray-500 hover:underline">
              Retour à l'accueil
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f5f1eb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]" />
      </div>
    }>
      <ResubscribeContent />
    </Suspense>
  );
}
