'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WhatsAppIntuitive from '@/components/WhatsAppIntuitive';
import { ArrowLeft } from 'lucide-react';

export default function WhatsAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const userInfo = await response.json();
        
        // Vérifier que c'est un admin ou employé
        if (userInfo.role !== 'admin' && userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE') {
          router.push('/espace-client');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur de vérification:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bouton retour */}
      <div className="bg-white border-b px-4 py-3">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>
      </div>
      
      {/* Interface WhatsApp moderne */}
      <WhatsAppIntuitive />
    </div>
  );
}