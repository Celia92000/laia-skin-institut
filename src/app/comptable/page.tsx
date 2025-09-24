'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Euro, Download, Calendar, TrendingUp, FileText, 
  LogOut, Calculator, PieChart, BarChart3, DollarSign,
  ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';

export default function ComptableDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [reservations, setReservations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    taxAmount: 0,
    servicesCount: 0,
    averageTicket: 0
  });

  useEffect(() => {
    // Vérifier l'authentification
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'COMPTABLE' && parsedUser.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
    fetchFinancialData();
  }, [router]);

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateStats = (data: any[]) => {
    const now = new Date();
    let filteredData = data;
    
    // Filtrer par période
    switch (period) {
      case 'day':
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date >= weekStart;
        });
        break;
      case 'month':
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        });
        break;
      case 'year':
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date.getFullYear() === now.getFullYear();
        });
        break;
    }
    
    const paidReservations = filteredData.filter(r => r.paymentStatus === 'paid');
    const pendingReservations = filteredData.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled');
    
    setStats({
      totalRevenue: filteredData.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
      paidAmount: paidReservations.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0),
      pendingAmount: pendingReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
      taxAmount: paidReservations.reduce((sum, r) => sum + ((r.paymentAmount || r.totalPrice || 0) * 0.20), 0),
      servicesCount: filteredData.length,
      averageTicket: filteredData.length > 0 ? 
        filteredData.reduce((sum, r) => sum + (r.totalPrice || 0), 0) / filteredData.length : 0
    });
  };

  const exportToExcel = () => {
    // Créer le CSV
    const headers = ['Date', 'Client', 'Services', 'Montant HT', 'TVA 20%', 'Montant TTC', 'Statut paiement'];
    const rows = reservations.map(r => [
      new Date(r.date).toLocaleDateString('fr-FR'),
      r.userName || r.userEmail || 'Client',
      Array.isArray(r.services) ? r.services.join(', ') : r.services || '',
      (r.totalPrice / 1.20).toFixed(2),
      (r.totalPrice * 0.20 / 1.20).toFixed(2),
      r.totalPrice?.toFixed(2) || '0',
      r.paymentStatus === 'paid' ? 'Payé' : 'En attente'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comptabilite_laia_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Calculator className="w-8 h-8 text-[#d4b5a0]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Espace Comptable</h1>
                <p className="text-xs text-gray-600">Laia Skin Institut</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres de période */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Période d'analyse
            </h2>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter en Excel
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            {[
              { value: 'day' as const, label: 'Jour' },
              { value: 'week' as const, label: 'Semaine' },
              { value: 'month' as const, label: 'Mois' },
              { value: 'year' as const, label: 'Année' }
            ].map(p => (
              <button
                key={p.value}
                onClick={() => {
                  setPeriod(p.value);
                  calculateStats(reservations);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === p.value
                    ? 'bg-[#d4b5a0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* CA Total */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                TTC
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Chiffre d'affaires total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">HT</span>
                <span className="font-medium">{(stats.totalRevenue / 1.20).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-600">TVA 20%</span>
                <span className="font-medium">{(stats.totalRevenue * 0.20 / 1.20).toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Encaissé */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Montant encaissé</p>
            <p className="text-3xl font-bold text-blue-600">{stats.paidAmount.toFixed(2)}€</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Nombre de paiements</span>
                <span className="font-medium">
                  {reservations.filter(r => r.paymentStatus === 'paid').length}
                </span>
              </div>
            </div>
          </div>

          {/* En attente */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <ArrowDownRight className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">En attente de paiement</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingAmount.toFixed(2)}€</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Factures en attente</span>
                <span className="font-medium">
                  {reservations.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateurs complémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panier moyen */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Panier moyen
            </h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats.averageTicket.toFixed(2)}€
            </div>
            <p className="text-sm text-gray-600">
              Sur {stats.servicesCount} prestations
            </p>
          </div>

          {/* TVA à reverser */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              TVA collectée
            </h3>
            <div className="text-4xl font-bold text-red-600 mb-2">
              {(stats.paidAmount * 0.20 / 1.20).toFixed(2)}€
            </div>
            <p className="text-sm text-gray-600">
              Sur les encaissements réalisés
            </p>
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-800">
                <strong>À déclarer</strong> : TVA sur les prestations encaissées uniquement
              </p>
            </div>
          </div>
        </div>

        {/* Note informative */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note comptable :</strong> Les montants affichés sont TTC. La TVA applicable est de 20% sur l'ensemble des prestations.
            Seuls les montants effectivement encaissés sont soumis à déclaration de TVA.
          </p>
        </div>
      </div>
    </div>
  );
}