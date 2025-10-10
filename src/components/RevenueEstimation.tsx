'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, Calendar, Euro, BarChart3,
  CalendarDays, Clock, Filter, PieChart,
  Target, Activity, DollarSign, AlertCircle
} from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface Reservation {
  id: string;
  date: Date | string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentAmount?: number | null;
  services: string[];
  userName?: string;
}

interface RevenueEstimationProps {
  reservations: Reservation[];
}

export default function RevenueEstimation({ reservations }: RevenueEstimationProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [customRange, setCustomRange] = useState({
    start: formatDateLocal(new Date()),
    end: formatDateLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  });

  const estimationData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel = '';

    // Déterminer la période selon le mode
    switch (viewMode) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = `Semaine du ${startDate.toLocaleDateString('fr-FR')}`;
        break;

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        periodLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        break;

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        periodLabel = `Année ${now.getFullYear()}`;
        break;

      case 'custom':
        startDate = new Date(customRange.start);
        endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = `Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
        break;
    }

    // Séparer les réservations passées et futures
    const pastReservations = reservations.filter(r => {
      const rDate = new Date(r.date);
      return rDate >= startDate && rDate <= endDate && rDate <= now &&
             r.status !== 'cancelled';
    });

    const futureReservations = reservations.filter(r => {
      const rDate = new Date(r.date);
      return rDate >= startDate && rDate <= endDate && rDate > now &&
             r.status !== 'cancelled';
    });

    // CA réalisé (réservations passées payées)
    const realizedRevenue = pastReservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0);

    // CA en attente de paiement (réservations passées non payées + futures confirmées non payées)
    const pendingPaymentPast = pastReservations
      .filter(r => r.paymentStatus !== 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const pendingPaymentFuture = futureReservations
      .filter(r => r.status === 'confirmed' && r.paymentStatus !== 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const pendingPayment = pendingPaymentPast + pendingPaymentFuture;

    // CA prévisionnel = CA réalisé + CA en attente (passé et futur)
    const projectedRevenue = realizedRevenue + pendingPayment;

    // CA potentiel (réservations futures en attente)
    const potentialRevenue = futureReservations
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.totalPrice, 0);

    // CA total estimé (incluant le potentiel)
    const totalEstimated = projectedRevenue + potentialRevenue;

    // Calculs de moyenne
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.min(
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      daysInPeriod
    );
    const averagePerDay = daysPassed > 0 ? realizedRevenue / daysPassed : 0;
    const projectedTotal = averagePerDay * daysInPeriod;

    // Taux de réalisation
    const realizationRate = projectedTotal > 0 ? (realizedRevenue / projectedTotal * 100) : 0;

    return {
      periodLabel,
      realizedRevenue,
      pendingPayment,
      projectedRevenue,
      potentialRevenue,
      totalEstimated,
      averagePerDay,
      projectedTotal,
      realizationRate,
      pastCount: pastReservations.length,
      futureCount: futureReservations.length,
      daysInPeriod,
      daysPassed,
      daysRemaining: daysInPeriod - daysPassed
    };
  }, [reservations, viewMode, customRange]);

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#d4b5a0]" />
          Estimation du Chiffre d'Affaires
        </h3>

        {/* Boutons de période */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'week' as const, label: 'Semaine', icon: CalendarDays },
            { value: 'month' as const, label: 'Mois', icon: Calendar },
            { value: 'year' as const, label: 'Année', icon: Calendar },
            { value: 'custom' as const, label: 'Personnalisé', icon: Filter }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setViewMode(value)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === value
                  ? 'bg-[#d4b5a0] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Sélecteur de dates personnalisées */}
        {viewMode === 'custom' && (
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">{estimationData.periodLabel}</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CA Réalisé */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">CA Réalisé</span>
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {estimationData.realizedRevenue.toFixed(0)}€
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {estimationData.pastCount} prestations effectuées
          </p>
        </div>

        {/* En attente de paiement */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">À encaisser</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {estimationData.pendingPayment.toFixed(0)}€
          </p>
          <p className="text-xs text-gray-500 mt-2">
            RDV effectués et futurs non payés
          </p>
        </div>

        {/* CA Prévisionnel */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">CA Prévisionnel</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {estimationData.projectedRevenue.toFixed(0)}€
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Réalisé + À encaisser
          </p>
        </div>

        {/* Total Estimé */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Estimé</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {estimationData.totalEstimated.toFixed(0)}€
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Prévu + Opportunités
          </p>
        </div>
      </div>

      {/* Analyse détaillée */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Analyse de la période</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progression */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progression de la période</span>
              <span className="text-sm font-medium">
                {estimationData.daysPassed} / {estimationData.daysInPeriod} jours
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] transition-all"
                style={{ width: `${(estimationData.daysPassed / estimationData.daysInPeriod * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {estimationData.daysRemaining > 0 
                ? `${estimationData.daysRemaining} jours restants`
                : 'Période terminée'}
            </p>
          </div>

          {/* Moyenne journalière */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Moyenne journalière</span>
              <span className="text-sm font-medium text-[#d4b5a0]">
                {estimationData.averagePerDay.toFixed(0)}€/jour
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Projection fin de période : 
                <span className="font-semibold text-gray-900 ml-1">
                  {estimationData.projectedTotal.toFixed(0)}€
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Opportunités */}
        {estimationData.potentialRevenue > 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Opportunités à confirmer
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {estimationData.potentialRevenue.toFixed(0)}€ de réservations en attente de confirmation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Taux de réalisation */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Taux de réalisation</span>
            <span className={`text-lg font-bold ${
              estimationData.realizationRate >= 100 ? 'text-green-600' :
              estimationData.realizationRate >= 75 ? 'text-blue-600' :
              estimationData.realizationRate >= 50 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {estimationData.realizationRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all flex items-center justify-center text-white text-xs font-medium ${
                estimationData.realizationRate >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                estimationData.realizationRate >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                estimationData.realizationRate >= 50 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min(100, estimationData.realizationRate)}%` }}
            >
              {estimationData.realizationRate >= 20 && `${estimationData.realizationRate.toFixed(0)}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}