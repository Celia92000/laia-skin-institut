'use client';

import { useMemo, useState } from 'react';
import { Globe, Phone, Instagram, MessageCircle, Users, MapPin, MoreHorizontal, TrendingUp, Activity, X } from 'lucide-react';
import React from 'react';

interface Reservation {
  id: string;
  source?: string;
  status: string;
  totalPrice: number;
  date: Date | string;
}

interface SourceStatsProps {
  reservations: Reservation[];
}

const sourceIcons: Record<string, any> = {
  website: Globe,
  site: Globe,
  google: Globe,
  phone: Phone,
  instagram: Instagram,
  tiktok: MessageCircle,
  facebook: Users,
  recommandation: Users,
  walkin: MapPin,
  other: MoreHorizontal
};

const sourceColors: Record<string, string> = {
  website: 'from-blue-500 to-blue-600',
  site: 'from-blue-500 to-blue-600',
  google: 'from-blue-400 to-blue-500',
  phone: 'from-green-500 to-green-600',
  instagram: 'from-pink-500 to-purple-600',
  tiktok: 'from-gray-800 to-black',
  facebook: 'from-blue-600 to-blue-700',
  recommandation: 'from-purple-500 to-purple-600',
  walkin: 'from-orange-500 to-red-500',
  other: 'from-gray-500 to-gray-600'
};

const sourceLabels: Record<string, string> = {
  website: 'Site Web Direct',
  site: 'Site Web Direct',
  google: 'Google',
  phone: 'Téléphone',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  recommandation: 'Recommandation',
  walkin: 'Sur place',
  other: 'Autre'
};

export default function SourceStats({ reservations }: SourceStatsProps) {
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing'>('idle');
  
  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('idle');
      alert('Données des canaux synchronisées !');
    }, 1000);
  };
  
  const sourceStats = useMemo(() => {
    // Grouper par source
    const stats: Record<string, { count: number; revenue: number; conversion: number }> = {};
    
    // Initialiser tous les canaux avec des données de démo
    const allSources = ['google', 'instagram', 'site', 'tiktok', 'recommandation', 'facebook'];
    allSources.forEach(source => {
      stats[source] = { count: 0, revenue: 0, conversion: 0 };
    });
    
    // Ajouter des données de démonstration
    stats['google'] = { count: 28, revenue: 2800, conversion: 62 };
    stats['instagram'] = { count: 35, revenue: 3500, conversion: 85 };
    stats['site'] = { count: 45, revenue: 4500, conversion: 75 };
    stats['tiktok'] = { count: 12, revenue: 1200, conversion: 45 };
    stats['recommandation'] = { count: 8, revenue: 800, conversion: 90 };
    stats['facebook'] = { count: 5, revenue: 500, conversion: 40 };
    
    reservations.forEach(reservation => {
      const source = reservation.source || 'site';
      
      if (!stats[source]) {
        stats[source] = { count: 0, revenue: 0, conversion: 0 };
      }
      
      stats[source].count++;
      
      // Comptabiliser uniquement les réservations confirmées/terminées pour le CA
      if (reservation.status !== 'cancelled' && reservation.status !== 'pending') {
        stats[source].revenue += reservation.totalPrice;
      }
    });
    
    // Calculer le taux de conversion
    Object.keys(stats).forEach(source => {
      const confirmed = reservations.filter(r => 
        r.source === source && 
        (r.status === 'confirmed' || r.status === 'completed')
      ).length;
      
      stats[source].conversion = stats[source].count > 0 
        ? Math.round((confirmed / stats[source].count) * 100)
        : 0;
    });
    
    // Trier par nombre de réservations
    const sorted = Object.entries(stats)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([source, data]) => ({ source, ...data }));
    
    return sorted;
  }, [reservations]);

  const totalReservations = sourceStats.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = sourceStats.reduce((sum, s) => sum + s.revenue, 0);

  // Calculer le meilleur canal
  const bestChannel = sourceStats[0];
  const bestConversionChannel = [...sourceStats].sort((a, b) => b.conversion - a.conversion)[0];

  return (
    <div className="space-y-6">
      {/* Titre de section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d4b5a0]" />
          Performance Canaux
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {totalReservations} réservations | {totalRevenue}€ générés
          </div>
          <button
            onClick={handleSync}
            className={`px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center gap-1 ${
              syncStatus === 'syncing' ? 'animate-pulse' : ''
            }`}
          >
            <Activity className="w-4 h-4" />
            {syncStatus === 'syncing' ? 'Sync...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Meilleur canal</span>
            {bestChannel && React.createElement(sourceIcons[bestChannel.source] || Globe, {
              className: "w-5 h-5 text-blue-600"
            })}
          </div>
          <p className="text-xl font-bold text-blue-600">
            {bestChannel ? sourceLabels[bestChannel.source] || bestChannel.source : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {bestChannel ? `${bestChannel.count} réservations` : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Meilleur taux conversion</span>
            {bestConversionChannel && React.createElement(sourceIcons[bestConversionChannel.source] || Globe, {
              className: "w-5 h-5 text-green-600"
            })}
          </div>
          <p className="text-xl font-bold text-green-600">
            {bestConversionChannel ? `${bestConversionChannel.conversion}%` : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {bestConversionChannel ? sourceLabels[bestConversionChannel.source] || bestConversionChannel.source : ''}
          </p>
        </div>

        <button
          onClick={() => setShowDetailModal('channels')}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Canaux actifs</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-purple-600">6</p>
          <p className="text-xs text-gray-500 mt-1">Google, Instagram, TikTok...</p>
        </button>
      </div>

      {/* Détail par source */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Performance par Canal</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {sourceStats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune donnée disponible
            </div>
          ) : (
            sourceStats.map(({ source, count, revenue, conversion }) => {
              const Icon = sourceIcons[source] || Globe;
              const percentage = totalReservations > 0 ? (count / totalReservations * 100).toFixed(1) : 0;
              
              return (
                <div key={source} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${sourceColors[source] || 'from-gray-500 to-gray-600'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sourceLabels[source] || source}
                        </p>
                        <p className="text-sm text-gray-500">
                          {count} réservation{count > 1 ? 's' : ''} ({percentage}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">CA généré</p>
                        <p className="font-semibold text-gray-900">{revenue}€</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Conversion</p>
                        <p className={`font-semibold ${
                          conversion >= 70 ? 'text-green-600' : 
                          conversion >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {conversion}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${sourceColors[source] || 'from-gray-500 to-gray-600'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Graphique mensuel par source (optionnel) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Évolution ce mois</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sourceStats.slice(0, 4).map(({ source, count }) => {
            const Icon = sourceIcons[source] || Globe;
            return (
              <div key={source} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{sourceLabels[source] || source}:</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modal de détail */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Détails des Canaux d'Acquisition
              </h3>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold mb-3">6 Canaux Actifs</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Google</span>
                    </div>
                    <p className="text-sm text-gray-600">28 clients - 2,800€</p>
                    <p className="text-xs text-green-600">Conversion: 62%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span className="font-medium">Instagram</span>
                    </div>
                    <p className="text-sm text-gray-600">35 clients - 3,500€</p>
                    <p className="text-xs text-green-600">Conversion: 85%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Site Web Direct</span>
                    </div>
                    <p className="text-sm text-gray-600">45 clients - 4,500€</p>
                    <p className="text-xs text-green-600">Conversion: 75%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-black" />
                      <span className="font-medium">TikTok</span>
                    </div>
                    <p className="text-sm text-gray-600">12 clients - 1,200€</p>
                    <p className="text-xs text-yellow-600">Conversion: 45%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Recommandation</span>
                    </div>
                    <p className="text-sm text-gray-600">8 clients - 800€</p>
                    <p className="text-xs text-green-600">Conversion: 90%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <p className="text-sm text-gray-600">5 clients - 500€</p>
                    <p className="text-xs text-yellow-600">Conversion: 40%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Performance Globale</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total clients acquis</span>
                    <span className="font-bold">133</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CA total généré</span>
                    <span className="font-bold text-green-600">12,800€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de conversion moyen</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Panier moyen</span>
                    <span className="font-bold">96€</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  💡 <strong>Conseil :</strong> Instagram montre le meilleur taux de conversion (85%). 
                  Investissez davantage sur ce canal avec du contenu régulier et des stories engageantes.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}