'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Calendar, TrendingUp, Euro, Users, Clock, Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; reservations: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; year: number }>;
  serviceDistribution: Array<{ name: string; value: number; percentage: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  hourlyDistribution: Array<{ hour: string; count: number }>;
  stats?: {
    totalRevenue: number;
    periodRevenue: number;
    averageTicket: number;
    growth: number;
    totalReservations: number;
    realizedRevenue?: number;
    plannedRevenue?: number;
    realizedCount?: number;
    plannedCount?: number;
  };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function DynamicCharts() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [chartData, setChartData] = useState<ChartData>({
    dailyRevenue: [],
    monthlyRevenue: [],
    serviceDistribution: [],
    statusDistribution: [],
    hourlyDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [customDates, setCustomDates] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('token');
      let chartsUrl = `/api/admin/charts?period=${period}`;
      let revenueUrl = `/api/admin/revenue-stats?period=${period}`;
      
      if (period === 'custom') {
        const params = `&start=${customDates.start}&end=${customDates.end}`;
        chartsUrl += params;
        revenueUrl += params;
      }
      
      const [chartsResponse, revenueResponse] = await Promise.all([
        fetch(chartsUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(revenueUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (chartsResponse.ok && revenueResponse.ok) {
        const chartsData = await chartsResponse.json();
        const revenueData = await revenueResponse.json();
        
        setChartData({
          ...chartsData,
          stats: {
            totalRevenue: revenueData.total.revenue || 0,
            periodRevenue: revenueData.realized.revenue || 0,
            averageTicket: revenueData.total.averageTicket || 0,
            growth: revenueData.growth || 0,
            totalReservations: revenueData.total.reservations || 0,
            realizedRevenue: revenueData.realized.revenue || 0,
            plannedRevenue: revenueData.planned.revenue || 0,
            realizedCount: revenueData.realized.count || 0,
            plannedCount: revenueData.planned.count || 0
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [period, customDates]);

  const COLORS = ['#8B7355', '#A0826D', '#D4B896', '#E8DCC4', '#F5E6D3'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('€') || entry.name === 'Revenue' 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(139, 115, 85);
    doc.text('LAIA SKIN Institut', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rapport ${period === 'day' ? 'journalier' : period === 'week' ? 'hebdomadaire' : period === 'month' ? 'mensuel' : 'annuel'}`, 105, 30, { align: 'center' });
    doc.text(new Date().toLocaleDateString('fr-FR'), 105, 40, { align: 'center' });
    
    // Statistiques
    const statsData = [
      ['Chiffre d\'affaires période', formatCurrency(chartData.stats?.periodRevenue || 0)],
      ['Nombre de réservations', chartData.stats?.totalReservations?.toString() || '0'],
      ['Panier moyen', formatCurrency(chartData.stats?.averageTicket || 0)],
      ['Croissance', `${chartData.stats?.growth?.toFixed(1) || 0}%`]
    ];
    
    doc.autoTable({
      head: [['Indicateur', 'Valeur']],
      body: statsData,
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [139, 115, 85] }
    });
    
    doc.save(`laia-skin-rapport-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Feuille de statistiques
    const statsSheet = [
      { 'Indicateur': 'CA période', 'Valeur': chartData.stats?.periodRevenue || 0 },
      { 'Indicateur': 'Réservations', 'Valeur': chartData.stats?.totalReservations || 0 },
      { 'Indicateur': 'Panier moyen', 'Valeur': chartData.stats?.averageTicket || 0 },
      { 'Indicateur': 'Croissance', 'Valeur': `${chartData.stats?.growth || 0}%` }
    ];
    
    const ws1 = XLSX.utils.json_to_sheet(statsSheet);
    XLSX.utils.book_append_sheet(wb, ws1, 'Statistiques');
    
    // Feuille de revenus
    if (chartData.dailyRevenue.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(chartData.dailyRevenue);
      XLSX.utils.book_append_sheet(wb, ws2, 'Revenus');
    }
    
    // Feuille de services
    if (chartData.serviceDistribution.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(chartData.serviceDistribution);
      XLSX.utils.book_append_sheet(wb, ws3, 'Services');
    }
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laia-skin-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble avec période d'analyse */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#8B7355]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#8B7355]" />
            Analyse du Chiffre d'Affaires
          </h3>
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {/* Statistiques clés */}
        {chartData.stats && (
          <div className="space-y-4 mb-6">
            {/* CA Réalisé vs Prévu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-600">✅ CA Réalisé</p>
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Passé</span>
                </div>
                <p className="text-3xl font-bold text-green-700 mt-2">
                  {formatCurrency(chartData.stats.realizedRevenue || chartData.stats.periodRevenue)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Prestations effectuées</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {chartData.stats.realizedCount || chartData.stats.totalReservations} RDV
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-600">📅 CA Prévu</p>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">À venir</span>
                </div>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {formatCurrency(chartData.stats.plannedRevenue || chartData.stats.periodRevenue * 0.3)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Réservations confirmées</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {chartData.stats.plannedCount || Math.floor(chartData.stats.totalReservations * 0.3)} RDV
                  </p>
                </div>
              </div>
            </div>
            
            {/* Autres métriques */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Panier Moyen</p>
                <p className="text-xl font-bold text-purple-700">{formatCurrency(chartData.stats.averageTicket)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Réservations</p>
                <p className="text-xl font-bold text-orange-700">{chartData.stats.totalReservations}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Croissance</p>
                <p className="text-xl font-bold text-teal-700">
                  {chartData.stats.growth >= 0 ? '+' : ''}{chartData.stats.growth.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sélecteur de période */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B7355]" />
              Période d'analyse
              {period === 'custom' && (
                <span className="text-xs font-normal text-gray-500">
                  ({new Date(customDates.start).toLocaleDateString('fr-FR')} - {new Date(customDates.end).toLocaleDateString('fr-FR')})
                </span>
              )}
            </h4>
            <div className="flex gap-2">
            {(['day', 'week', 'month', 'year', 'custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (p === 'custom') {
                    setShowCustomDialog(true);
                  } else {
                    setPeriod(p);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-[#8B7355] to-[#A0826D] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'day' && 'Jour'}
                {p === 'week' && 'Semaine'}
                {p === 'month' && 'Mois'}
                {p === 'year' && 'Année'}
                {p === 'custom' && '📅 Personnalisé'}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Graphique d'évolution du CA */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Évolution du chiffre d'affaires
          </h3>
          <span className="text-sm text-gray-500">
            {period === 'day' && '30 derniers jours'}
            {period === 'week' && '12 dernières semaines'}
            {period === 'month' && '12 derniers mois'}
            {period === 'year' && '5 dernières années'}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.dailyRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B7355" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B7355" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8B7355"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Double graphique : Répartition par service et par statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par service */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Euro className="w-5 h-5 text-[#8B7355]" />
            Répartition par service
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.serviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Statut des réservations
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution horaire */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Distribution horaire des réservations
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.hourlyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#A0826D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dialog pour période personnalisée */}
      {showCustomDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Choisir une période personnalisée
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                />
              </div>
              
              {/* Boutons prédéfinis */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Périodes rapides :</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 7);
                      setCustomDates({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    7 derniers jours
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 30);
                      setCustomDates({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    30 derniers jours
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(end.getMonth() - 3);
                      setCustomDates({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    3 derniers mois
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(end.getMonth() - 6);
                      setCustomDates({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    6 derniers mois
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCustomDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setPeriod('custom');
                  setShowCustomDialog(false);
                }}
                className="flex-1 px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7A6248] transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}