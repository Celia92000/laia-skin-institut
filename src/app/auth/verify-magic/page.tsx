"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyMagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Lien invalide ou expiré');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-magic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          // Stocker le token et les infos utilisateur
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user.role);

          // Cookie pour la sécurité
          document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Strict`;

          setStatus('success');
          setMessage('Connexion réussie ! Redirection...');

          // Redirection selon le rôle
          setTimeout(() => {
            const roleRedirects: {[key: string]: string} = {
              'ADMIN': '/admin',
              'admin': '/admin',
              'COMPTABLE': '/admin/finances',
              'EMPLOYEE': '/admin/planning',
              'STAGIAIRE': '/admin/planning',
              'CLIENT': '/espace-client',
              'client': '/espace-client'
            };

            const redirectPath = roleRedirects[data.user.role] || '/espace-client';
            router.push(redirectPath);
          }, 1500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Lien invalide ou expiré');
        }
      } catch (error) {
        console.error('Erreur vérification:', error);
        setStatus('error');
        setMessage('Erreur lors de la vérification du lien');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#8B7355] mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-serif font-bold text-[#2c3e50] mb-2">
              Vérification en cours...
            </h1>
            <p className="text-[#2c3e50]/70">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-green-600 mb-2">
              Connexion réussie ! ✨
            </h1>
            <p className="text-[#2c3e50]/70">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-red-600 mb-2">
              Erreur de connexion
            </h1>
            <p className="text-[#2c3e50]/70 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-[#8B7355] to-[#A0826D] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyMagicLink() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VerifyMagicLinkContent />
    </Suspense>
  );
}
