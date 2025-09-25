'use client';

import { useEffect } from 'react';
import WhatsAppIntuitive from '@/components/WhatsAppIntuitive';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WhatsAppPage() {
  const router = useRouter();

  // Vérification simple du token uniquement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

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