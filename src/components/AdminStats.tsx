'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Euro, Award, Star, Heart, ThumbsUp, MessageCircle, BarChart3, PieChart, Activity, Gift, UserPlus, Target, Sparkles } from 'lucide-react';

interface Stats {
  reservations: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    conversionRate: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    averagePerClient: number;
    averagePerService: number;
    byMonth: Array<{ month: string; revenue: number; year: number }>;
    byDay: Array<{ date: string; revenue: number }>;
    byService: Array<{ service: string; revenue: number; percentage: number }>;
  };
  satisfaction: {
    average: number;
    total: number;
    distribution: {
      '5': number;
      '4': number;
      '3': number;
      '2': number;
      '1': number;
    };
    recentFeedback: Array<{
      clientName: string;
      rating: number;
      comment: string;
      date: Date;
      service: string;
    }>;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
    vip: number;
    inactive: number;
    satisfactionRate: number;
  };
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
    satisfaction: number;
  }>;
  dailyStats: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  recurringClients: number;
  marketingPerformance: {
    emailOpenRate: number;
    emailClickRate: number;
    whatsappReadRate: number;
    whatsappResponseRate: number;
    campaignConversion: number;
  };
  loyalty: {
    totalActiveMembers: number;
    newMembersThisMonth: number;
    totalPointsDistributed: number;
    totalRewardsRedeemed: number;
    averagePointsPerClient: number;
    redemptionRate: number;
    clientsNearReward: {
      services: number; // Clients à 4 services (proches des 20€)
      packages: number; // Clients à 7-8 séances (proches des 40€)
    };
    rewardsThisMonth: {
      services: { count: number; value: number };
      packages: { count: number; value: number };
      birthday: { count: number; value: number };
      referral: { count: number; value: number };
    };
    topLoyalClients: Array<{
      name: string;
      services: number;
      packages: number;
      totalSpent: number;
      totalSaved: number;
    }>;
    referralProgram: {
      totalReferrals: number;
      successfulReferrals: number;
      conversionRate: number;
      totalRewardsGiven: number;
    };
  };
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Récupération des données réelles depuis l'API
      const response = await fetch('/api/admin/statistics');
      if (response.ok) {
        const data = await response.json();
        // Formater les données pour correspondre au type Stats
        const formattedStats: Stats = {
            reservations: data.reservations || {
              total: 0,
              today: 0,
              thisWeek: 0,
              thisMonth: 0,
              pending: 0,
              confirmed: 0,
              cancelled: 0,
              conversionRate: 0
            },
            revenue: {
              total: data.revenue?.total || 0,
              thisMonth: data.revenue?.thisMonth || 0,
              lastMonth: data.revenue?.lastMonth || 0,
              thisYear: data.revenue?.thisYear || 0,
              lastYear: data.revenue?.lastYear || 0,
              today: data.revenue?.today || 0,
              yesterday: data.revenue?.yesterday || 0,
              thisWeek: data.revenue?.thisWeek || 0,
              lastWeek: data.revenue?.lastWeek || 0,
              averagePerClient: data.revenue?.averageCartValue || 0,
              averagePerService: 0,
              byMonth: [],
              byDay: [],
              byService: []
            },
            satisfaction: {
              average: data.services?.averageRating || 0,
              total: 0,
              distribution: {
                '5': 0,
                '4': 0,
                '3': 0,
                '2': 0,
                '1': 0
              },
              recentFeedback: []
            },
            clients: data.clients || {
              total: 0,
              new: 0,
              returning: 0,
              vip: 0,
              inactive: 0,
              satisfactionRate: 0
            },
            topServices: data.services?.popularServices?.map((s: any) => ({
              name: s.name,
              count: s.count,
              revenue: 0,
              satisfaction: 0
            })) || [],
            dailyStats: [],
            recurringClients: data.clients?.returning || 0,
            marketingPerformance: data.marketingPerformance || {
              emailOpenRate: 0,
              emailClickRate: 0,
              whatsappReadRate: 0,
              whatsappResponseRate: 0,
              campaignConversion: 0
            },
            loyalty: data.loyalty || {
              totalActiveMembers: 0,
              newMembersThisMonth: 0,
              totalPointsDistributed: 0,
              totalRewardsRedeemed: 0,
              averagePointsPerClient: 0,
              redemptionRate: 0,
              clientsNearReward: {
                services: 0,
                packages: 0
              },
              rewardsThisMonth: {
                services: { count: 0, value: 0 },
                packages: { count: 0, value: 0 },
                birthday: { count: 0, value: 0 },
                referral: { count: 0, value: 0 }
              },
              topLoyalClients: [],
              referralProgram: {
                totalReferrals: 0,
                successfulReferrals: 0,
                conversionRate: 0,
                totalRewardsGiven: 0
              }
            }
          };
          setStats(formattedStats);
        } else {
          console.error('Erreur API: ', response.status, response.statusText);
          // En cas d'erreur API, ne pas afficher de données fictives
          setStats(null);
        }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Chargement...</div>
            </div>
            <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Statistiques temporairement indisponibles</h3>
              <p className="text-yellow-700">
                Impossible de charger les statistiques. Vérifiez votre connexion à la base de données.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthGrowth = stats.revenue.lastMonth > 0
    ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Titre avec indicateur de satisfaction globale */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
            <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold">{stats.satisfaction.average}/5</span>
            </div>
            <p className="text-sm text-gray-600">Satisfaction globale</p>
          </div>
        </div>
      </div>

      {/* Cartes principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Réservations du mois</h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.reservations.thisMonth}</div>
            <p className="text-xs text-gray-500">
              {stats.reservations.today} aujourd'hui
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Chiffre d'affaires (mois)</h3>
            <Euro className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.revenue.thisMonth.toFixed(2)} €</div>
            <p className="text-xs text-gray-500 flex items-center">
              {Number(monthGrowth) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">Croissance</span>
                </>
              ) : Number(monthGrowth) < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">Baisse</span>
                </>
              ) : (
                <span>Stable</span>
              )}
              <span className="ml-1">vs mois dernier</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Taux de conversion</h3>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.reservations.conversionRate}%</div>
            <p className="text-xs text-gray-500">
              {stats.reservations.confirmed} confirmées sur {stats.reservations.total}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Clients fidèles</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.recurringClients}</div>
            <p className="text-xs text-gray-500">
              Clients avec 2+ réservations
            </p>
          </div>
        </div>
      </div>

      {/* Top services */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Services les plus populaires</h3>
        </div>
        <div>
          <div className="space-y-4">
            {stats.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.count} réservations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{service.revenue.toFixed(2)} €</p>
                  <p className="text-sm text-gray-500">CA généré</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analyses de revenus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par période */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">Évolution des revenus</h3>
          </div>
          <div className="space-y-4">
            {/* Aujourd'hui vs Hier */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-xl font-bold">{stats.revenue.today.toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Hier</p>
                <p className="text-lg font-semibold">
                  {stats.revenue.yesterday.toFixed(0)}€
                  {stats.revenue.today > stats.revenue.yesterday ? (
                    <span className="text-green-600 text-sm ml-2">▲ +{((stats.revenue.today - stats.revenue.yesterday) / stats.revenue.yesterday * 100).toFixed(0)}%</span>
                  ) : (
                    <span className="text-red-600 text-sm ml-2">▼ {((stats.revenue.today - stats.revenue.yesterday) / stats.revenue.yesterday * 100).toFixed(0)}%</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Cette semaine vs Semaine dernière */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cette semaine</p>
                <p className="text-xl font-bold">{stats.revenue.thisWeek.toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Semaine dernière</p>
                <p className="text-lg font-semibold">
                  {stats.revenue.lastWeek.toFixed(0)}€
                  {stats.revenue.thisWeek > stats.revenue.lastWeek ? (
                    <span className="text-green-600 text-sm ml-2">▲ +{((stats.revenue.thisWeek - stats.revenue.lastWeek) / stats.revenue.lastWeek * 100).toFixed(0)}%</span>
                  ) : (
                    <span className="text-red-600 text-sm ml-2">▼ {((stats.revenue.thisWeek - stats.revenue.lastWeek) / stats.revenue.lastWeek * 100).toFixed(0)}%</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Ce mois vs Mois dernier */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-xl font-bold">{stats.revenue.thisMonth.toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Mois dernier</p>
                <p className="text-lg font-semibold">
                  {stats.revenue.lastMonth.toFixed(0)}€
                  {Number(monthGrowth) > 0 ? (
                    <span className="text-green-600 text-sm ml-2">▲ +{monthGrowth}%</span>
                  ) : Number(monthGrowth) < 0 ? (
                    <span className="text-red-600 text-sm ml-2">▼ {monthGrowth}%</span>
                  ) : (
                    <span className="text-gray-600 text-sm ml-2">= 0%</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Cette année vs Année dernière */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cette année</p>
                <p className="text-xl font-bold">{stats.revenue.thisYear.toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Année dernière</p>
                <p className="text-lg font-semibold">
                  {stats.revenue.lastYear.toFixed(0)}€
                  <span className="text-green-600 text-sm ml-2">
                    ▲ +{((stats.revenue.thisYear - stats.revenue.lastYear) / stats.revenue.lastYear * 100).toFixed(0)}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenus par service */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">Revenus par service</h3>
          </div>
          <div className="space-y-3">
            {stats.revenue.byService.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className="text-sm font-medium w-32">{item.service}</span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.revenue.toFixed(0)}€</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique mensuel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Revenus mensuels 2024</h3>
        </div>
        <div className="h-64 relative">
          {stats.revenue.byMonth.map((month, index) => {
            const maxRevenue = Math.max(...stats.revenue.byMonth.map(m => m.revenue));
            const height = (month.revenue / maxRevenue) * 100;
            
            return (
              <div 
                key={index}
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: `${(index / 12) * 100}%`, width: `${100/12}%` }}
              >
                <div className="relative w-full px-1">
                  <div 
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t mx-auto hover:from-blue-700 hover:to-blue-500 transition-colors cursor-pointer relative group"
                    style={{ height: `${height * 2}px`, width: '80%' }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {month.revenue.toFixed(0)}€
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{month.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphique des 7 derniers jours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Revenus des 7 derniers jours</h3>
        </div>
        <div>
          <div className="space-y-2">
            {stats.revenue.byDay.map((day) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
              const maxRevenue = Math.max(...stats.revenue.byDay.map(d => d.revenue));
              const barWidth = maxRevenue > 0 ? (day.revenue / maxRevenue * 100) : 0;
              
              return (
                <div key={day.date} className="flex items-center space-x-4">
                  <div className="w-24 text-sm">{dayName}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className="bg-rose-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${barWidth}%` }}
                        >
                          {day.revenue > 0 && (
                            <span className="text-xs text-white font-medium">
                              {day.revenue.toFixed(0)}€
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 w-20 text-right">
                        {day.revenue.toFixed(0)}€
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statuts des réservations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">État des réservations</h3>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.reservations.pending}</div>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.reservations.confirmed}</div>
              <p className="text-sm text-gray-500">Confirmées</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.reservations.cancelled}</div>
              <p className="text-sm text-gray-500">Annulées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}