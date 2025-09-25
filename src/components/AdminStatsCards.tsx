"use client";

import { TrendingUp, TrendingDown, Users, Calendar, Euro, Star, Package, Heart } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: ReactNode;
  color: 'primary' | 'rose' | 'nude' | 'success' | 'warning';
}

const colorStyles = {
  primary: 'from-laia-primary/10 to-laia-primary-light/10 border-laia-primary/20 text-laia-primary',
  rose: 'from-laia-rose/10 to-laia-rose-light/10 border-laia-rose/20 text-laia-rose',
  nude: 'from-laia-nude/30 to-laia-beige/30 border-laia-nude/40 text-laia-gray-dark',
  success: 'from-green-50 to-emerald-50 border-green-200 text-green-600',
  warning: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-600',
};

function StatCard({ title, value, subtitle, trend, icon, color }: StatCardProps) {
  const styles = colorStyles[color];
  
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${styles} border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-laia-lg`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-laia-gray mb-1">{title}</p>
            <p className="text-3xl font-bold text-laia-dark">{value}</p>
            {subtitle && (
              <p className="text-xs text-laia-gray mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-3 space-x-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-laia-gray">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-white/50 ${styles}`}>
            {icon}
          </div>
        </div>
      </div>
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
    </div>
  );
}

export default function AdminStatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Rendez-vous aujourd'hui"
        value={stats?.todayReservations || 0}
        subtitle={`${stats?.tomorrowReservations || 0} demain`}
        trend={{ value: 12, isPositive: true }}
        icon={<Calendar className="h-6 w-6" />}
        color="primary"
      />
      
      <StatCard
        title="Revenus du mois"
        value={`${stats?.monthRevenue || 0}€`}
        subtitle={`${stats?.todayRevenue || 0}€ aujourd'hui`}
        trend={{ value: 8, isPositive: true }}
        icon={<Euro className="h-6 w-6" />}
        color="rose"
      />
      
      <StatCard
        title="Clients actifs"
        value={stats?.activeClients || 0}
        subtitle={`${stats?.newClientsMonth || 0} nouveaux ce mois`}
        trend={{ value: 15, isPositive: true }}
        icon={<Users className="h-6 w-6" />}
        color="nude"
      />
      
      <StatCard
        title="Note moyenne"
        value="4.9"
        subtitle={`${stats?.totalReviews || 0} avis au total`}
        trend={{ value: 5, isPositive: true }}
        icon={<Star className="h-6 w-6" />}
        color="success"
      />
    </div>
  );
}

// Export aussi les mini cards pour d'autres usages
export function MiniStatCard({ label, value, icon, color = 'primary' }: { 
  label: string; 
  value: string | number; 
  icon: ReactNode;
  color?: keyof typeof colorStyles;
}) {
  const styles = colorStyles[color];
  
  return (
    <div className={`flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r ${styles} border`}>
      <div className={`p-2 rounded-lg bg-white/50`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-laia-gray">{label}</p>
        <p className="text-lg font-bold text-laia-dark">{value}</p>
      </div>
    </div>
  );
}