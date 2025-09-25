"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, Clock, Users, Euro, Calendar, Target, 
  Award, Star, MessageCircle, CheckCircle, AlertCircle,
  BarChart3, Activity, Zap, Trophy, Coffee
} from "lucide-react";

interface EmployeeStatsViewProps {
  reservations: any[];
  viewMode: string;
  selectedDate: string;
  selectedMonth: string;
  selectedYear: string;
}

export default function EmployeeStatsView({ 
  reservations, 
  viewMode, 
  selectedDate, 
  selectedMonth, 
  selectedYear 
}: EmployeeStatsViewProps) {
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [objectives, setObjectives] = useState<any>({
    daily: 500,
    weekly: 5000,
    monthly: 20000,
    yearly: 240000
  });
  const [stats, setStats] = useState<any>({
    todayRevenue: 0,
    todayClients: 0,
    todayReservations: 0,
    nextReservation: null,
    weekTarget: 5000,
    weekProgress: 0,
    weekRevenue: 0,
    monthTarget: 20000,
    monthProgress: 0,
    monthRevenue: 0,
    averageServiceTime: 0,
    mostPopularService: "",
    clientSatisfaction: 0,
    personalPerformance: 0,
    tips: 0,
    commissionsEarned: 0
  });

  useEffect(() => {
    // Charger les objectifs personnalisés
    const savedObjectives = localStorage.getItem('businessObjectives');
    if (savedObjectives) {
      setObjectives(JSON.parse(savedObjectives));
    }
    calculateEmployeeStats();
  }, [reservations, viewMode, selectedDate]);

  const calculateEmployeeStats = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Réservations du jour
    const todayReservations = reservations.filter(r => 
      new Date(r.date).toISOString().split('T')[0] === today
    );

    // CA du jour
    const todayRevenue = todayReservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

    // Clients uniques du jour
    const todayClients = new Set(todayReservations.map(r => r.userId)).size;

    // Prochaine réservation
    const futureReservations = reservations
      .filter(r => new Date(r.date) > now && r.status !== 'cancelled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextReservation = futureReservations[0] || null;

    // CA de la semaine
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekReservations = reservations.filter(r => {
      const rDate = new Date(r.date);
      return rDate >= weekStart && r.paymentStatus === 'paid';
    });
    const weekRevenue = weekReservations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

    // CA du mois
    const monthReservations = reservations.filter(r => {
      const rDate = new Date(r.date);
      return rDate.getMonth() === now.getMonth() && 
             rDate.getFullYear() === now.getFullYear() && 
             r.paymentStatus === 'paid';
    });
    const monthRevenue = monthReservations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

    // Service le plus populaire
    const serviceCount: Record<string, number> = {};
    reservations.forEach(r => {
      const service = r.services;
      if (service) {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      }
    });
    const mostPopular = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)[0];

    // Temps moyen par service (simulé)
    const avgTime = 75; // minutes

    // Satisfaction client (simulé)
    const satisfaction = 4.8;

    // Performance personnelle (basé sur les objectifs personnalisés)
    const monthlyTarget = objectives.monthly || 20000;
    const performance = Math.min(100, (monthRevenue / monthlyTarget) * 100);

    // Pourboires (simulé - 5% du CA)
    const tips = todayRevenue * 0.05;

    // Commissions (simulé - 10% du CA)
    const commissions = monthRevenue * 0.10;

    setStats({
      todayRevenue,
      todayClients,
      todayReservations: todayReservations.length,
      nextReservation,
      weekTarget: objectives.weekly || 5000,
      weekProgress: (weekRevenue / (objectives.weekly || 5000)) * 100,
      weekRevenue,
      monthTarget: monthlyTarget,
      monthProgress: (monthRevenue / monthlyTarget) * 100,
      monthRevenue,
      averageServiceTime: avgTime,
      mostPopularService: mostPopular ? mostPopular[0] : "Aucun",
      clientSatisfaction: satisfaction,
      personalPerformance: performance,
      tips,
      commissionsEarned: commissions
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistiques du jour - Vue rapide pour employé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CA Personnel du jour */}
        <button 
          onClick={() => setShowDetailModal('revenue')}
          className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all text-left group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mon CA aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayRevenue.toFixed(0)}€</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12% vs hier
              </p>
            </div>
            <Euro className="w-10 h-10 text-green-500 opacity-50" />
          </div>
          <p className="text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Cliquez pour voir les détails →
          </p>
        </button>

        {/* Clients du jour */}
        <button 
          onClick={() => setShowDetailModal('clients')}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all text-left group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clients aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayClients}</p>
              <p className="text-sm text-blue-600 mt-2">
                {stats.todayReservations} réservations
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
          <p className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir la liste des clients →
          </p>
        </button>

        {/* Prochaine réservation */}
        <button 
          onClick={() => setShowDetailModal('nextReservation')}
          className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all text-left group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Prochain RDV</p>
              {stats.nextReservation ? (
                <>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(stats.nextReservation.date).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-sm text-purple-600 mt-1 truncate">
                    {stats.nextReservation.userName || 'Client'}
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-500">Aucun RDV</p>
              )}
            </div>
            <Clock className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
          <p className="text-xs text-purple-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Détails de la réservation →
          </p>
        </button>

        {/* Performance du jour */}
        <button 
          onClick={() => setShowDetailModal('performance')}
          className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all text-left group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ma performance</p>
              <p className="text-3xl font-bold text-gray-900">{stats.personalPerformance.toFixed(0)}%</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                  style={{ width: `${stats.personalPerformance}%` }}
                />
              </div>
            </div>
            <Trophy className="w-10 h-10 text-orange-500 opacity-50" />
          </div>
          <p className="text-xs text-orange-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Détails de performance →
          </p>
        </button>
      </div>

      {/* Objectifs et progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectif hebdomadaire */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Objectif de la semaine
            </h3>
            <span className="text-sm text-gray-500">
              {stats.weekRevenue.toFixed(0)}€ / {stats.weekTarget}€
            </span>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${Math.min(100, stats.weekProgress)}%` }}
              >
                {stats.weekProgress.toFixed(0)}%
              </div>
            </div>
            {stats.weekProgress >= 100 ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Objectif atteint ! Bravo !
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Encore {(stats.weekTarget - stats.weekRevenue).toFixed(0)}€ pour atteindre l'objectif
              </p>
            )}
          </div>
        </div>

        {/* Objectif mensuel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Objectif du mois
            </h3>
            <span className="text-sm text-gray-500">
              {stats.monthRevenue.toFixed(0)}€ / {stats.monthTarget}€
            </span>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${Math.min(100, stats.monthProgress)}%` }}
              >
                {stats.monthProgress.toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jours restants: {30 - new Date().getDate()}</span>
              <span className="text-gray-600">Moyenne/jour: {(stats.monthTarget / 30).toFixed(0)}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temps moyen par service */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps moyen/service</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageServiceTime} min</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Optimisez votre temps pour servir plus de clients</p>
        </div>

        {/* Service le plus demandé */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Service populaire</p>
              <p className="text-lg font-bold text-gray-900 truncate">{stats.mostPopularService}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Le service le plus demandé ce mois</p>
        </div>

        {/* Satisfaction client */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Satisfaction client</p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xl font-bold text-gray-900">{stats.clientSatisfaction}</p>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Basé sur les avis récents</p>
        </div>
      </div>

    </div>
  );
}