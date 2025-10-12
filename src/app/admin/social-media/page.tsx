"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SocialMediaHub from '@/components/admin/SocialMediaHub';
import { FaArrowLeft } from 'react-icons/fa';

export default function SocialMediaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Bouton retour */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/admin"
          className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full shadow-2xl text-white hover:bg-white/20 transition-all hover:scale-105 border-2 border-white/20"
        >
          <FaArrowLeft className="text-lg" />
          <span className="font-bold">Retour</span>
        </Link>
      </div>

      {/* Contenu principal */}
      <SocialMediaHub />
    </div>
  );
}
