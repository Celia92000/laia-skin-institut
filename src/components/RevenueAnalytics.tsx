'use client';

import { useState, useMemo } from 'react';
import {
  Calendar, Euro, TrendingUp, TrendingDown, Download,
  CalendarDays, Clock, Filter, BarChart3, PieChart
} from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface Reservation {
  id: string;
  date: Date | string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentDate?: Date | string | null;
  services: string[];
  userName?: string;
}

interface RevenueAnalyticsProps {
  reservations: Reservation[];
  services?: Record<string, string>;
  onStatClick?: (type: string) => void;
}

export default function RevenueAnalytics({ reservations, services = {}, onStatClick }: RevenueAnalyticsProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [customRange, setCustomRange] = useState({
    start: formatDateLocal(new Date()),
    end: formatDateLocal(new Date())
  });

  // Calculer les revenus selon la période sélectionnée
  const revenueData = useMemo(() => {
    let filteredReservations: Reservation[] = [];
    let periodLabel = '';
    let comparisonReservations: Reservation[] = [];
    let comparisonLabel = '';

    const today = new Date();
    const selectedDateObj = new Date(selectedDate);

    // Filtrer selon le mode
    switch (viewMode) {
      case 'day':
        // Jour sélectionné
        filteredReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate.toDateString() === selectedDateObj.toDateString() &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        periodLabel = selectedDateObj.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });

        // Jour précédent pour comparaison
        const prevDay = new Date(selectedDateObj);
        prevDay.setDate(prevDay.getDate() - 1);
        comparisonReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate.toDateString() === prevDay.toDateString() &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        comparisonLabel = 'Jour précédent';
        break;

      case 'week':
        // Semaine contenant la date sélectionnée
        const weekStart = new Date(selectedDateObj);
        weekStart.setDate(selectedDateObj.getDate() - selectedDateObj.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        filteredReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= weekStart && rDate <= weekEnd &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        periodLabel = `Semaine du ${weekStart.toLocaleDateString('fr-FR')} au ${weekEnd.toLocaleDateString('fr-FR')}`;

        // Semaine précédente pour comparaison
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
        comparisonReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= prevWeekStart && rDate <= prevWeekEnd &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        comparisonLabel = 'Semaine précédente';
        break;

      case 'month':
        // Mois sélectionné
        const monthStart = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1);
        const monthEnd = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() + 1, 0);

        filteredReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= monthStart && rDate <= monthEnd &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        periodLabel = selectedDateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        // Mois précédent pour comparaison
        const prevMonthStart = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() - 1, 1);
        const prevMonthEnd = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 0);
        comparisonReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= prevMonthStart && rDate <= prevMonthEnd &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        comparisonLabel = 'Mois précédent';
        break;

      case 'year':
        // Année sélectionnée
        const year = selectedDateObj.getFullYear();
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        filteredReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= yearStart && rDate <= yearEnd &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        periodLabel = `Année ${year}`;

        // Année précédente pour comparaison
        const prevYearStart = new Date(year - 1, 0, 1);
        const prevYearEnd = new Date(year - 1, 11, 31);
        comparisonReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= prevYearStart && rDate <= prevYearEnd &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        comparisonLabel = 'Année précédente';
        break;

      case 'custom':
        // Période personnalisée
        const startDate = new Date(customRange.start);
        const endDate = new Date(customRange.end);

        filteredReservations = reservations.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= startDate && rDate <= endDate &&
                 r.status !== 'cancelled' &&
                 r.paymentStatus === 'paid';
        });
        periodLabel = `Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
        
        // Pas de comparaison pour période personnalisée
        comparisonReservations = [];
        comparisonLabel = '';
        break;
    }

    // Calculer les totaux (utiliser totalPrice pour les montants)
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const comparisonRevenue = comparisonReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const averageTicket = filteredReservations.length > 0 ? totalRevenue / filteredReservations.length : 0;

    // Calcul de croissance
    const growth = comparisonRevenue > 0 
      ? ((totalRevenue - comparisonRevenue) / comparisonRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? 100 : 0;

    // Répartition par service
    const serviceBreakdown: Record<string, number> = {};
    filteredReservations.forEach(r => {
      r.services.forEach(service => {
        const serviceName = services[service] || service;
        serviceBreakdown[serviceName] = (serviceBreakdown[serviceName] || 0) + (r.totalPrice / r.services.length);
      });
    });

    // Top clients
    const clientSpending: Record<string, number> = {};
    filteredReservations.forEach(r => {
      if (r.userName) {
        clientSpending[r.userName] = (clientSpending[r.userName] || 0) + r.totalPrice;
      }
    });
    const topClients = Object.entries(clientSpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalRevenue,
      comparisonRevenue,
      growth,
      averageTicket,
      numberOfReservations: filteredReservations.length,
      periodLabel,
      comparisonLabel,
      serviceBreakdown,
      topClients,
      reservations: filteredReservations
    };
  }, [reservations, viewMode, selectedDate, customRange, services]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Services', 'Prix', 'Statut paiement'];
    const rows = revenueData.reservations.map(r => [
      new Date(r.date).toLocaleDateString('fr-FR'),
      r.userName || 'Client',
      r.services.map(s => services[s] || s).join(', '),
      `${r.totalPrice}€`,
      r.paymentStatus === 'paid' ? 'Payé' : 'Non payé'
    ]);

    const csvContent = [
      `Chiffre d'affaires - ${revenueData.periodLabel}`,
      `Total: ${revenueData.totalRevenue}€`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ca_${viewMode}_${selectedDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#d4b5a0]" />
          Analyse du Chiffre d'Affaires
        </h3>

        {/* Boutons de mode */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'day' as const, label: 'Jour', icon: Calendar },
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

        {/* Sélecteur de date */}
        <div className="flex gap-4 items-end">
          {viewMode !== 'custom' ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {viewMode === 'day' && 'Sélectionner un jour'}
                {viewMode === 'week' && 'Sélectionner une semaine'}
                {viewMode === 'month' && 'Sélectionner un mois'}
                {viewMode === 'year' && 'Sélectionner une année'}
              </label>
              <input
                type={viewMode === 'year' ? 'number' : viewMode === 'month' ? 'month' : 'date'}
                value={viewMode === 'year' ? selectedDate.split('-')[0] : viewMode === 'month' ? selectedDate.substring(0, 7) : selectedDate}
                onChange={(e) => {
                  if (viewMode === 'year') {
                    setSelectedDate(`${e.target.value}-01-01`);
                  } else if (viewMode === 'month') {
                    setSelectedDate(`${e.target.value}-01`);
                  } else {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
              />
            </div>
          ) : (
            <>
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
            </>
          )}
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Résultats - Encadrés cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CA Total */}
        <button 
          onClick={() => onStatClick?.('revenue')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Chiffre d'affaires</span>
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{revenueData.totalRevenue.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">{revenueData.periodLabel}</p>
          <p className="text-xs text-green-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir les détails →</p>
          
          {revenueData.comparisonRevenue > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-gray-600 mb-1">{revenueData.comparisonLabel}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{revenueData.comparisonRevenue.toFixed(2)}€</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  Number(revenueData.growth) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Number(revenueData.growth) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {revenueData.growth}%
                </span>
              </div>
            </div>
          )}
        </button>

        {/* Nombre de prestations */}
        <button 
          onClick={() => onStatClick?.('services')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Prestations</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{revenueData.numberOfReservations}</p>
          <p className="text-xs text-gray-500 mt-2">Soins réalisés</p>
          <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Voir tous les services →</p>
        </button>

        {/* Panier moyen */}
        <button 
          onClick={() => onStatClick?.('average')}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Panier moyen</span>
            <PieChart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{revenueData.averageTicket.toFixed(2)}€</p>
          <p className="text-xs text-gray-500 mt-2">Par prestation</p>
          <p className="text-xs text-purple-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Voir analyse détaillée →</p>
        </button>
      </div>

      {/* Répartition par service */}
      {Object.keys(revenueData.serviceBreakdown).length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Répartition par service</h4>
          <div className="space-y-2">
            {Object.entries(revenueData.serviceBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([service, amount]) => {
                const percentage = (amount / revenueData.totalRevenue * 100).toFixed(1);
                return (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium w-40 truncate">{service}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-sm font-semibold">{amount.toFixed(0)}€</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Top clients */}
      {revenueData.topClients.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Top 5 Clients</h4>
          <div className="space-y-2">
            {revenueData.topClients.map(([client, amount], index) => (
              <div key={client} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="text-sm font-medium">{client}</span>
                </div>
                <span className="text-sm font-semibold text-[#d4b5a0]">{amount.toFixed(0)}€</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}