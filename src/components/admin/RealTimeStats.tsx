'use client';

import React, { useState, useEffect } from 'react';
import { Euro, Users, Calendar, TrendingUp, Clock, CheckCircle, Package, GraduationCap, Scissors } from 'lucide-react';

interface Stats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  todayReservations: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingPayments: number;
  monthlyRevenue: number;
  monthlyReservations: number;
  todayRevenue: number;
  servicesRevenue?: number;
  productRevenue?: number;
  formationRevenue?: number;
  paidServicesRevenue?: number;
  paidProductRevenue?: number;
  paidFormationRevenue?: number;
  totalOrders?: number;
  totalProductOrders?: number;
  totalFormationOrders?: number;
}

export default function RealTimeStats() {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    completedReservations: 0,
    todayReservations: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    monthlyReservations: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('Pas de token trouvé');
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('/api/admin/real-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Erreur API stats:', response.status, response.statusText);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Timeout lors de la récupération des stats');
        } else {
          console.error('Erreur lors de la récupération des stats:', error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ligne 1: Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">CA Total</span>
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {stats.totalReservations} réservations
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">CA du mois</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(stats.monthlyRevenue)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {stats.monthlyReservations} réservations
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">CA du jour</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(stats.todayRevenue)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {stats.todayReservations} réservations
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">En attente</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-700">
            {formatCurrency(stats.pendingPayments)}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            À encaisser
          </p>
        </div>
      </div>

      {/* Ligne 2: Détails des réservations */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Total</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-700">
            {stats.totalReservations}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">En attente</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-bold text-orange-600">
            {stats.pendingReservations}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Confirmées</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-600">
            {stats.confirmedReservations}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Terminées</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-xl font-bold text-green-600">
            {stats.completedReservations}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Payées</span>
            <Euro className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(stats.paidRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Aujourd'hui</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-600">
            {stats.todayReservations}
          </p>
        </div>
      </div>

      {/* Ligne 3: Répartition CA par type */}
      {(stats.servicesRevenue || stats.productRevenue || stats.formationRevenue) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-pink-600" />
                CA Prestations
              </span>
            </div>
            <p className="text-2xl font-bold text-pink-700">
              {formatCurrency(stats.paidServicesRevenue || 0)}
            </p>
            <p className="text-xs text-pink-600 mt-1">
              {stats.totalReservations} réservations · {formatCurrency(stats.servicesRevenue || 0)} total
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                CA Produits
              </span>
            </div>
            <p className="text-2xl font-bold text-indigo-700">
              {formatCurrency(stats.paidProductRevenue || 0)}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              {stats.totalProductOrders || 0} commandes · {formatCurrency(stats.productRevenue || 0)} total
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-600" />
                CA Formations
              </span>
            </div>
            <p className="text-2xl font-bold text-violet-700">
              {formatCurrency(stats.paidFormationRevenue || 0)}
            </p>
            <p className="text-xs text-violet-600 mt-1">
              {stats.totalFormationOrders || 0} commandes · {formatCurrency(stats.formationRevenue || 0)} total
            </p>
          </div>
        </div>
      )}
    </div>
  );
}