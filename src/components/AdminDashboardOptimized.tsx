"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, CheckCircle, XCircle, Users, Settings, Euro, 
  TrendingUp, FileText, Gift, Shield, Home, ChevronRight,
  Activity, Package, CreditCard, AlertCircle, Star, Phone,
  Globe, Instagram, Edit, Trash2, Plus, Download, Search,
  Filter, BarChart3, PieChart, DollarSign, UserCheck
} from "lucide-react";

interface TabGroup {
  name: string;
  icon: any;
  tabs: Tab[];
}

interface Tab {
  id: string;
  name: string;
  icon: any;
  badge?: number;
  color?: string;
}

export default function AdminDashboardOptimized() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Organisation intuitive des onglets en groupes
  const tabGroups: TabGroup[] = [
    {
      name: "Tableau de bord",
      icon: Home,
      tabs: [
        { id: "dashboard", name: "Vue d'ensemble", icon: BarChart3, color: "text-blue-600" },
        { id: "analytics", name: "Statistiques", icon: PieChart, color: "text-purple-600" }
      ]
    },
    {
      name: "Gestion des rendez-vous",
      icon: Calendar,
      tabs: [
        { id: "planning", name: "Planning", icon: Calendar, badge: 5, color: "text-green-600" },
        { id: "validation", name: "Validation présences", icon: UserCheck, badge: 3, color: "text-orange-600" },
        { id: "disponibilites", name: "Disponibilités", icon: Clock, color: "text-indigo-600" }
      ]
    },
    {
      name: "Gestion clients",
      icon: Users,
      tabs: [
        { id: "clients", name: "Liste clients", icon: Users, color: "text-cyan-600" },
        { id: "crm", name: "CRM & Notes", icon: FileText, color: "text-teal-600" },
        { id: "fidelite", name: "Programme fidélité", icon: Gift, badge: 2, color: "text-pink-600" }
      ]
    },
    {
      name: "Gestion financière",
      icon: Euro,
      tabs: [
        { id: "paiements", name: "Paiements", icon: CreditCard, badge: 7, color: "text-emerald-600" },
        { id: "comptabilite", name: "Comptabilité", icon: DollarSign, color: "text-green-700" }
      ]
    },
    {
      name: "Configuration",
      icon: Settings,
      tabs: [
        { id: "services", name: "Services & Tarifs", icon: Package, color: "text-amber-600" },
        { id: "parametres", name: "Paramètres", icon: Settings, color: "text-gray-600" }
      ]
    }
  ];

  // Stats pour le dashboard
  const stats = {
    todayRevenue: 420,
    weekRevenue: 2340,
    monthRevenue: 8760,
    newClients: 12,
    totalClients: 156,
    todayAppointments: 8,
    pendingValidation: 3,
    loyaltyPointsDistributed: 450
  };

  // Notifications importantes
  const notifications = [
    { type: 'warning', message: '3 réservations en attente de validation', icon: AlertCircle },
    { type: 'info', message: '7 paiements à enregistrer', icon: CreditCard },
    { type: 'success', message: '2 nouveaux clients cette semaine', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-bold text-[#2c3e50]">Admin Panel</h2>
                  <p className="text-xs text-gray-500">Laia Skin</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {tabGroups.map((group) => (
            <div key={group.name}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.name}
                </h3>
              )}
              <div className="space-y-1">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 border-l-4 border-[#d4b5a0]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#d4b5a0]' : tab.color || 'text-gray-500'}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className={`flex-1 text-left text-sm ${activeTab === tab.id ? 'font-semibold text-[#2c3e50]' : 'text-gray-600'}`}>
                          {tab.name}
                        </span>
                        {tab.badge && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">LA</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Laia Admin</p>
                <p className="text-xs text-gray-500">admin@laia.skin.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-2xl font-bold text-[#2c3e50]">
                {tabGroups.flatMap(g => g.tabs).find(t => t.id === activeTab)?.name || 'Dashboard'}
              </h1>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un client, une réservation..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all">
                Nouvelle réservation
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Notifications */}
              <div className="grid md:grid-cols-3 gap-4">
                {notifications.map((notif, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    notif.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                    notif.type === 'info' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <notif.icon className={`w-5 h-5 mt-0.5 ${
                        notif.type === 'warning' ? 'text-orange-600' :
                        notif.type === 'info' ? 'text-blue-600' :
                        'text-green-600'
                      }`} />
                      <p className="text-sm text-gray-700">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Euro className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayRevenue}€</p>
                  <p className="text-sm text-gray-500">Revenus du jour</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-500">{stats.todayAppointments}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingValidation}</p>
                  <p className="text-sm text-gray-500">À valider</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs text-purple-600 font-medium">+{stats.newClients}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                  <p className="text-sm text-gray-500">Clients total</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Gift className="w-6 h-6 text-pink-600" />
                    </div>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPointsDistributed}</p>
                  <p className="text-sm text-gray-500">Points fidélité</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-6 h-6 text-[#d4b5a0] mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nouvelle réservation</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Valider présences</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <CreditCard className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Enregistrer paiement</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Export comptable</p>
                  </button>
                </div>
              </div>

              {/* Today's Schedule Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Planning du jour</h3>
                  <button 
                    onClick={() => setActiveTab('planning')}
                    className="text-sm text-[#d4b5a0] hover:underline"
                  >
                    Voir tout →
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { time: '10:00', client: 'Sophie Martin', service: 'Hydro\'Cleaning', status: 'confirmed' },
                    { time: '11:30', client: 'Marie Dubois', service: 'Renaissance', status: 'pending' },
                    { time: '14:00', client: 'Julie Bernard', service: 'BB Glow', status: 'confirmed' },
                  ].map((appointment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{appointment.time}</span>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.client}</p>
                          <p className="text-sm text-gray-500">{appointment.service}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content will be rendered here based on activeTab */}
          {activeTab !== "dashboard" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500">Contenu de l'onglet {activeTab}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}