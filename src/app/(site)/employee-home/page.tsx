'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, Clock, Users, Settings, TrendingUp, 
  Shield, LogOut, ChevronRight, Briefcase, User
} from 'lucide-react';

export default function EmployeeHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Si ce n'est pas un employé, rediriger
      if (parsedUser.role !== 'EMPLOYEE') {
        if (parsedUser.role === 'ADMIN' || parsedUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-white">
      {/* Header spécial employé */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">LAIA SKIN INSTITUT</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Espace Employé
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <User className="inline w-4 h-4 mr-1" />
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message de bienvenue */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-4">
            Bonjour {user.name} 👋
          </h2>
          <p className="text-lg text-gray-600">
            Bienvenue dans votre espace employé LAIA SKIN INSTITUT
          </p>
        </div>

        {/* Carte principale d'accès à l'admin */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-semibold">Tableau de Bord Employé</h3>
                  <p className="text-white/80">Accédez à votre interface de travail</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Accédez au tableau de bord pour gérer les réservations, consulter le planning et voir les statistiques.
              </p>
              <button
                onClick={() => router.push('/admin')}
                className="w-full py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
              >
                Accéder au Tableau de Bord
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Cartes d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Vos accès */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Vos Accès</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Gestion des réservations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Planning du jour
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Informations clients
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Statistiques de base
              </li>
            </ul>
          </div>

          {/* Restrictions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Restrictions</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">×</span> Gestion des utilisateurs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">×</span> Services et tarifs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">×</span> Export de données
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">×</span> Paramètres avancés
              </li>
            </ul>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Actions Rapides</h3>
            </div>
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Voir le site public
              </Link>
              <Link
                href="/services"
                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Consulter les services
              </Link>
              <Link
                href="/contact"
                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Page contact
              </Link>
            </div>
          </div>
        </div>

        {/* Note d'information */}
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Note :</strong> En tant qu'employé, vous avez accès au tableau de bord avec des fonctionnalités adaptées à votre rôle. 
                  Pour toute question ou besoin d'accès supplémentaire, contactez votre administrateur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}