'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar, Euro, TrendingUp, TrendingDown, Download, 
  CalendarDays, Clock, Filter, BarChart3, PieChart,
  Target, Activity, DollarSign, AlertCircle, Star
} from 'lucide-react';

interface Reservation {
  id: string;
  date: Date | string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentDate?: Date | string | null;
  paymentAmount?: number | null;
  services: string[];
  userName?: string;
}

interface RevenueManagementProps {
  reservations: Reservation[];
  services?: Record<string, string>;
}

export default function RevenueManagement({ reservations, services = {} }: RevenueManagementProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Fonction pour déterminer les dates selon le mode
  const getDateRange = (mode: typeof viewMode, date: string, range: typeof customRange) => {
    const now = new Date();
    const selectedDateObj = new Date(date);
    let startDate: Date;
    let endDate: Date;
    let periodLabel = '';
    let comparisonStart: Date | null = null;
    let comparisonEnd: Date | null = null;
    let comparisonLabel = '';

    switch (mode) {
      case 'day':
        startDate = new Date(selectedDateObj);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDateObj);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = selectedDateObj.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
        
        comparisonStart = new Date(selectedDateObj);
        comparisonStart.setDate(comparisonStart.getDate() - 1);
        comparisonStart.setHours(0, 0, 0, 0);
        comparisonEnd = new Date(comparisonStart);
        comparisonEnd.setHours(23, 59, 59, 999);
        comparisonLabel = 'Jour précédent';
        break;

      case 'week':
        startDate = new Date(selectedDateObj);
        startDate.setDate(selectedDateObj.getDate() - selectedDateObj.getDay() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = `Semaine du ${startDate.toLocaleDateString('fr-FR')}`;
        
        comparisonStart = new Date(startDate);
        comparisonStart.setDate(comparisonStart.getDate() - 7);
        comparisonEnd = new Date(comparisonStart);
        comparisonEnd.setDate(comparisonStart.getDate() + 6);
        comparisonEnd.setHours(23, 59, 59, 999);
        comparisonLabel = 'Semaine précédente';
        break;

      case 'month':
        startDate = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1);
        endDate = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() + 1, 0, 23, 59, 59, 999);
        periodLabel = selectedDateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        
        comparisonStart = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() - 1, 1);
        comparisonEnd = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 0, 23, 59, 59, 999);
        comparisonLabel = 'Mois précédent';
        break;

      case 'year':
        startDate = new Date(selectedDateObj.getFullYear(), 0, 1);
        endDate = new Date(selectedDateObj.getFullYear(), 11, 31, 23, 59, 59, 999);
        periodLabel = `Année ${selectedDateObj.getFullYear()}`;
        
        comparisonStart = new Date(selectedDateObj.getFullYear() - 1, 0, 1);
        comparisonEnd = new Date(selectedDateObj.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        comparisonLabel = 'Année précédente';
        break;

      case 'custom':
        startDate = new Date(range.start);
        endDate = new Date(range.end);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = `Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
        break;
    }

    return { startDate, endDate, periodLabel, comparisonStart, comparisonEnd, comparisonLabel };
  };

  // Données pour l'analyse
  const analysisData = useMemo(() => {
    const { startDate, endDate, periodLabel, comparisonStart, comparisonEnd, comparisonLabel } = 
      getDateRange(viewMode, selectedDate, customRange);
    
    // Filtrer les réservations payées dans la période
    const filteredReservations = reservations.filter(r => {
      const rDate = new Date(r.date);
      return rDate >= startDate && rDate <= endDate &&
             r.status !== 'cancelled' &&
             r.paymentStatus === 'paid';
    });

    // Réservations de comparaison
    const comparisonReservations = comparisonStart && comparisonEnd ? 
      reservations.filter(r => {
        const rDate = new Date(r.date);
        return rDate >= comparisonStart && rDate <= comparisonEnd &&
               r.status !== 'cancelled' &&
               r.paymentStatus === 'paid';
      }) : [];

    // Calculs
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const comparisonRevenue = comparisonReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const averageTicket = filteredReservations.length > 0 ? totalRevenue / filteredReservations.length : 0;
    const growth = comparisonRevenue > 0 
      ? ((totalRevenue - comparisonRevenue) / comparisonRevenue * 100)
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

  // Données pour l'estimation
  const estimationData = useMemo(() => {
    const now = new Date();
    const { startDate, endDate, periodLabel } = getDateRange(viewMode, selectedDate, customRange);

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

    // CA en attente de paiement (passé non payé + futur confirmé non payé)
    const pendingPaymentPast = pastReservations
      .filter(r => r.paymentStatus !== 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const pendingPaymentFuture = futureReservations
      .filter(r => r.status === 'confirmed' && r.paymentStatus !== 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const pendingPayment = pendingPaymentPast + pendingPaymentFuture;

    // CA prévisionnel = CA réalisé + CA en attente
    const projectedRevenue = realizedRevenue + pendingPayment;

    // CA potentiel (réservations futures en attente)
    const potentialRevenue = futureReservations
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.totalPrice, 0);

    // CA total estimé
    const totalEstimated = projectedRevenue + potentialRevenue;

    // Calculs de moyenne et projection
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.min(
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      daysInPeriod
    );
    const averagePerDay = daysPassed > 0 ? realizedRevenue / daysPassed : 0;
    const projectedTotal = averagePerDay * daysInPeriod;
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
  }, [reservations, viewMode, selectedDate, customRange]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Services', 'Prix', 'Statut paiement'];
    const rows = analysisData.reservations
      .filter(r => {
        const { startDate, endDate } = getDateRange(viewMode, selectedDate, customRange);
        const rDate = new Date(r.date);
        return rDate >= startDate && rDate <= endDate && r.status !== 'cancelled';
      })
      .map(r => [
        new Date(r.date).toLocaleDateString('fr-FR'),
        r.userName || 'Client',
        r.services.map(s => services[s] || s).join(', '),
        `${r.totalPrice}€`,
        r.paymentStatus === 'paid' ? 'Payé' : 'Non payé'
      ]);

    const csvContent = [
      `Chiffre d'affaires - ${analysisData.periodLabel}`,
      `CA Réalisé: ${analysisData.totalRevenue}€`,
      `CA Prévisionnel: ${estimationData.projectedRevenue}€`,
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
      {/* CATÉGORIE 1: VUE D'ENSEMBLE FINANCIÈRE */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#d4a574]">
        <h2 className="text-xl font-bold text-[#2c3e50] mb-4">📊 Vue d'ensemble - {analysisData.periodLabel}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passé */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">PASSÉ</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">{Math.round(analysisData.totalRevenue)}€</p>
              <p className="text-xs text-gray-600 mt-1">CA Réalisé (payé)</p>
              <p className="text-xs text-gray-500 mt-2">{analysisData.numberOfReservations} prestations</p>
            </div>
          </div>

          {/* Présent */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">EN COURS</p>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-orange-600">{Math.round(estimationData.pendingPayment)}€</p>
              <p className="text-xs text-gray-600 mt-1">À encaisser</p>
              <p className="text-xs text-gray-500 mt-2">Prestations non payées</p>
            </div>
          </div>

          {/* Futur */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">PRÉVISIONNEL</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">{Math.round(estimationData.projectedRevenue)}€</p>
              <p className="text-xs text-gray-600 mt-1">CA Total prévu</p>
              <p className="text-xs text-gray-500 mt-2">{estimationData.futureCount} RDV à venir</p>
            </div>
          </div>
        </div>
      </div>

      {/* CATÉGORIE 2: ANALYSE DE PERFORMANCE */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">📈 Performance & Évolution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Évolution */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Évolution</p>
            <p className={`text-2xl font-bold ${analysisData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analysisData.growth >= 0 ? '+' : ''}{analysisData.growth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">vs {analysisData.comparisonLabel}</p>
          </div>

          {/* Panier moyen */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Panier moyen</p>
            <p className="text-2xl font-bold text-[#2c3e50]">{Math.round(analysisData.averageTicket)}€</p>
            <p className="text-xs text-gray-500">par client</p>
          </div>

          {/* Taux de réalisation */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Taux réalisation</p>
            <p className="text-2xl font-bold text-[#2c3e50]">{estimationData.realizationRate.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">de l'objectif</p>
          </div>

          {/* Moyenne journalière */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Moyenne/jour</p>
            <p className="text-2xl font-bold text-[#2c3e50]">{Math.round(estimationData.averagePerDay)}€</p>
            <p className="text-xs text-gray-500">sur la période</p>
          </div>
        </div>
      </div>

      {/* Sélecteur de période simplifié */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2c3e50]">Période d'analyse</h3>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {/* Boutons de période */}
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

        <p className="text-sm text-gray-600 mt-4">
          {analysisData.periodLabel}
        </p>
      </div>

      {/* CATÉGORIE 3: DÉTAILS PAR SERVICE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Répartition par service */}
        {Object.keys(analysisData.serviceBreakdown).length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Répartition par service</h4>
            <div className="space-y-2">
              {Object.entries(analysisData.serviceBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([service, amount]) => {
                  const percentage = (amount / analysisData.totalRevenue * 100).toFixed(1);
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
                        <span className="text-sm font-semibold">{Math.round(amount)}€</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Top clients */}
        {analysisData.topClients.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Top 5 Clients</h4>
            <div className="space-y-2">
              {analysisData.topClients.map(([client, amount], index) => (
                <div key={client} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <span className="text-sm font-medium">{client}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#d4b5a0]">{Math.round(amount)}€</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}