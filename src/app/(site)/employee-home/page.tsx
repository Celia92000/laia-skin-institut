'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeHome() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger immédiatement vers l'admin
    router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers l'espace employé...</p>
      </div>
    </div>
  );
}