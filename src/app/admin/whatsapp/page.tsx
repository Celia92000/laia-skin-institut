'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WhatsAppPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers le tableau de bord admin avec l'onglet WhatsApp sélectionné
    router.push('/admin?tab=whatsapp');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers WhatsApp Business...</p>
      </div>
    </div>
  );
}