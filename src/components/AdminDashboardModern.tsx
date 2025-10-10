'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, Users, Euro, TrendingUp, Clock, CheckCircle,
  XCircle, AlertCircle, Gift, Heart, Star, Activity,
  MessageSquare, Mail, Phone, Settings, ChevronRight,
  ArrowUpRight, ArrowDownRight, BarChart3, PieChart,
  Sparkles, Bell, Search, Filter, Download, Upload,
  Shield, Zap, Target, Award, Coffee, Sun, Moon, Plus
} from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface DashboardStats {
  todayReservations: number;
  pendingReservations: number;
  completedReservations: number;
  todayRevenue: number;
  monthRevenue: number;
  newClients: number;
  activeClients: number;
  loyaltyRewards: number;
  upcomingBirthdays: number;
  averageRating: number;
}

export default function AdminDashboardModern() {
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayReservations: 14,
    pendingReservations: 5,
    completedReservations: 9,
    todayRevenue: 328,
    monthRevenue: 12450,
    newClients: 12,
    activeClients: 234,
    loyaltyRewards: 8,
    upcomingBirthdays: 3,
    averageRating: 4.8
  });

  const [darkMode, setDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: 'reservation', message: 'Nouvelle réservation de Sophie Martin', time: 'Il y a 5 min', icon: CalendarDays, color: 'blue' },
    { id: 2, type: 'payment', message: 'Paiement reçu: 75€', time: 'Il y a 15 min', icon: Euro, color: 'green' },
    { id: 3, type: 'loyalty', message: 'Marie Dubois a atteint 6 séances', time: 'Il y a 1h', icon: Gift, color: 'purple' },
    { id: 4, type: 'review', message: 'Nouvel avis 5 étoiles', time: 'Il y a 2h', icon: Star, color: 'yellow' }
  ];

  const quickActions = [
    { label: 'Nouvelle réservation', icon: CalendarDays, color: 'from-blue-500 to-blue-600', action: () => router.push('/admin/reservations/nouvelle') },
    { label: 'Envoyer SMS/WhatsApp', icon: MessageSquare, color: 'from-green-500 to-green-600', action: () => router.push('/admin?tab=whatsapp') },
    { label: 'Gérer les paiements', icon: Euro, color: 'from-purple-500 to-purple-600', action: () => router.push('/admin/paiements') },
    { label: 'Voir statistiques', icon: BarChart3, color: 'from-pink-500 to-pink-600', action: () => router.push('/admin/analytics') }
  ];

  const todaySchedule = [
    { time: '09:00', client: 'Sophie Martin', service: 'Hydro\'Naissance', status: 'confirmed', duration: '1h30' },
    { time: '10:30', client: 'Emma Rousseau', service: 'BB Glow', status: 'pending', duration: '1h30' },
    { time: '14:00', client: 'Julie Bernard', service: 'LED Thérapie', status: 'confirmed', duration: '45min' },
    { time: '15:00', client: 'Marie Dubois', service: 'Renaissance', status: 'confirmed', duration: '1h30' },
    { time: '16:30', client: 'Claire Moreau', service: 'Hydro\'Cleaning', status: 'pending', duration: '1h30' }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      {/* Header moderne */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dashboard LAIA SKIN
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className={`pl-10 pr-4 py-2 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]`}
                />
              </div>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-all`}
              >
                <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  4
                </span>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-all`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2.5 rounded-xl bg-[#d4b5a0]/10 hover:bg-[#d4b5a0]/20 transition-all relative group"
                title="Paramètres du compte"
              >
                <Settings className="w-5 h-5 text-[#d4b5a0]" />
                <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Paramètres
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className={`absolute right-6 top-20 w-96 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-2xl border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } z-50 overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b ${
                  darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                } cursor-pointer transition-colors`}
                onClick={() => {
                  // Action basée sur le type de notification
                  if (notif.message.includes('réservation')) {
                    router.push('/admin/reservations');
                  } else if (notif.message.includes('client')) {
                    router.push('/admin/clients');
                  } else {
                    router.push('/admin');
                  }
                  setShowNotifications(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${notif.color}-100 flex items-center justify-center`}>
                    <notif.icon className={`w-5 h-5 text-${notif.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {notif.message}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {notif.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <button
              onClick={() => {
                router.push('/admin/notifications');
                setShowNotifications(false);
              }}
              className="text-[#d4b5a0] text-sm font-medium hover:text-[#c9a084]"
            >
              Voir tout →
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="px-6 py-6">
        {/* Period selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period === 'day' ? 'Aujourd\'hui' : period === 'week' ? 'Cette semaine' : 'Ce mois'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition-all`}
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            
            {/* Menu déroulant d'export */}
            {showExportMenu && (
              <div className={`absolute right-0 top-12 w-48 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-2xl border ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } z-50 overflow-hidden`}>
                <div className="py-2">
                  {[
                    { label: 'Tout exporter', type: 'all', icon: Download },
                    { label: 'Réservations', type: 'reservations', icon: CalendarDays },
                    { label: 'Clients', type: 'clients', icon: Users },
                    { label: 'Services', type: 'services', icon: Sparkles },
                    { label: 'Finances', type: 'finances', icon: Euro }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={async () => {
                        setShowExportMenu(false);
                        const response = await fetch(`/api/admin/export-data?type=${item.type}`);
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${item.type}-${formatDateLocal(new Date())}.csv`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }
                      }}
                      className={`w-full px-4 py-2 flex items-center gap-3 ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors text-left`}
                    >
                      <item.icon className="w-4 h-4 text-[#d4b5a0]" />
                      <span className={`text-sm ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats cards with gradient backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Euro className="w-8 h-8" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  +12% ↑
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.todayRevenue}€</p>
              <p className="text-sm opacity-90">Revenus du jour</p>
              <button
                onClick={() => router.push('/admin/finances')}
                className="mt-4 text-xs flex items-center gap-1 hover:gap-2 transition-all"
              >
                Voir détails <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Reservations card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <CalendarDays className="w-8 h-8" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {stats.pendingReservations} en attente
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.todayReservations}</p>
              <p className="text-sm opacity-90">Réservations aujourd\'hui</p>
              <button
                onClick={() => router.push('/admin/planning')}
                className="mt-4 text-xs flex items-center gap-1 hover:gap-2 transition-all"
              >
                Voir planning <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Clients card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  +{stats.newClients} nouveaux
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.activeClients}</p>
              <p className="text-sm opacity-90">Clients actifs</p>
              <button
                onClick={() => router.push('/admin/clients')}
                className="mt-4 text-xs flex items-center gap-1 hover:gap-2 transition-all"
              >
                Voir clients <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Loyalty card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {stats.upcomingBirthdays} anniv.
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.loyaltyRewards}</p>
              <p className="text-sm opacity-90">Récompenses à donner</p>
              <button
                onClick={() => router.push('/admin/fidelite')}
                className="mt-4 text-xs flex items-center gap-1 hover:gap-2 transition-all"
              >
                Gérer fidélité <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={`rounded-2xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-xl p-6 mb-6`}>
          <h2 className={`text-lg font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          } mb-4`}>Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10 text-white">
                  <action.icon className="w-6 h-6 mb-2" />
                  <p className="text-sm font-medium">{action.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today\'s schedule */}
          <div className={`rounded-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Planning du jour</h2>
              <button
                onClick={() => router.push('/admin/reservations/nouvelle')}
                className="text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {todaySchedule.map((appointment, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  } hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => router.push(`/admin/reservations/${appointment.client.replace(' ', '-').toLowerCase()}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <p className={`text-sm font-bold ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{appointment.time}</p>
                      </div>
                      <div>
                        <p className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{appointment.client}</p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{appointment.service} • {appointment.duration}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance metrics */}
          <div className={`rounded-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Performance</h2>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Taux d\'occupation
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    78%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{width: '78%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Satisfaction client
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.averageRating}/5 ⭐
                  </span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600" style={{width: '96%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Objectif mensuel
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.monthRevenue}€ / 15000€
                  </span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600" style={{width: '83%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}