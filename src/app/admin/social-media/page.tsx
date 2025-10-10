"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SocialMediaCalendar from '@/components/admin/SocialMediaCalendar';
import { FaCalendarAlt, FaArrowLeft, FaTachometerAlt } from 'react-icons/fa';

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-[#d4b5a0] transition-colors"
              >
                <FaArrowLeft />
                <span>Retour au dashboard</span>
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-[#d4b5a0] text-2xl" />
                <h1 className="text-2xl font-bold text-gray-800">Calendrier de Publication</h1>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Planifiez et organisez vos publications sur les réseaux sociaux
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <SocialMediaCalendar />
      </div>
    </div>
  );
}
