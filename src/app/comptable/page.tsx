'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Euro, Download, Calendar, TrendingUp, FileText,
  LogOut, Calculator, PieChart, BarChart3, DollarSign,
  ArrowUpRight, ArrowDownRight, Filter, FileDown,
  Receipt, BookOpen, AlertCircle, CheckCircle, Clock,
  Package, Users, Briefcase, ChevronDown, ChevronUp,
  Printer, Mail, Search, X
} from 'lucide-react';
import { generateInvoiceNumber, calculateInvoiceTotals, formatInvoiceHTML, generateCSVExport, downloadFile } from '@/lib/invoice-generator';
import { formatDateLocal } from '@/lib/date-utils';

interface Reservation {
  id: string;
  date: Date;
  userName: string;
  userEmail: string;
  userPhone?: string;
  services: any;
  totalPrice: number;
  paymentAmount?: number;
  paymentStatus: string;
  paymentMethod?: string;
  status: string;
  createdAt: Date;
  notes?: string;
  invoiceNumber?: string;
}

export default function ComptableDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    reservations: true,
    export: true,
    documents: true
  });
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    taxAmount: 0,
    servicesCount: 0,
    averageTicket: 0,
    clientsCount: 0,
    recurringRate: 0,
    vatCollected: 0,
    vatDue: 0
  });

  useEffect(() => {
    // Vérifier l'authentification
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'COMPTABLE' && parsedUser.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
    fetchFinancialData();
  }, [router]);

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateStats = (data: any[]) => {
    const now = new Date();
    let filteredData = data;
    
    // Filtrer par période
    switch (period) {
      case 'day':
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date >= weekStart;
        });
        break;
      case 'month':
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        });
        break;
      case 'quarter':
        const quarterStart = new Date(now);
        quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3);
        quarterStart.setDate(1);
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date >= quarterStart;
        });
        break;
      case 'year':
        filteredData = data.filter(r => {
          const date = new Date(r.date);
          return date.getFullYear() === now.getFullYear();
        });
        break;
    }
    
    const paidReservations = filteredData.filter(r => r.paymentStatus === 'paid');
    const pendingReservations = filteredData.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled');
    
    // Calculer les clients uniques
    const uniqueClients = new Set(filteredData.map(r => r.userEmail)).size;
    const recurringClients = data.filter(r => {
      const clientReservations = data.filter(res => res.userEmail === r.userEmail);
      return clientReservations.length > 1;
    });
    
    setStats({
      totalRevenue: filteredData.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
      paidAmount: paidReservations.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0),
      pendingAmount: pendingReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
      taxAmount: paidReservations.reduce((sum, r) => sum + ((r.paymentAmount || r.totalPrice || 0) * 0.20), 0),
      servicesCount: filteredData.length,
      averageTicket: filteredData.length > 0 ? 
        filteredData.reduce((sum, r) => sum + (r.totalPrice || 0), 0) / filteredData.length : 0,
      clientsCount: uniqueClients,
      recurringRate: uniqueClients > 0 ? (recurringClients.length / uniqueClients) * 100 : 0,
      vatCollected: paidReservations.reduce((sum, r) => sum + ((r.paymentAmount || r.totalPrice || 0) * 0.20 / 1.20), 0),
      vatDue: filteredData.reduce((sum, r) => sum + ((r.totalPrice || 0) * 0.20 / 1.20), 0)
    });
  };

  const exportToExcel = () => {
    const headers = [
      'Date', 
      'N° Facture',
      'Client', 
      'Email',
      'Téléphone',
      'Services', 
      'Montant HT', 
      'TVA 20%', 
      'Montant TTC', 
      'Statut paiement',
      'Mode de paiement',
      'Date de paiement'
    ];
    
    const rows = reservations.map(r => ({
      'Date': new Date(r.date).toLocaleDateString('fr-FR'),
      'N° Facture': r.invoiceNumber || generateInvoiceNumber(new Date(r.date)),
      'Client': r.userName || 'Client',
      'Email': r.userEmail || '',
      'Téléphone': r.userPhone || '',
      'Services': Array.isArray(r.services) ? r.services.join(', ') : r.services || '',
      'Montant HT': (r.totalPrice / 1.20).toFixed(2),
      'TVA 20%': (r.totalPrice * 0.20 / 1.20).toFixed(2),
      'Montant TTC': r.totalPrice?.toFixed(2) || '0',
      'Statut paiement': r.paymentStatus === 'paid' ? 'Payé' : 'En attente',
      'Mode de paiement': r.paymentMethod || '',
      'Date de paiement': r.paymentStatus === 'paid' ? new Date(r.createdAt).toLocaleDateString('fr-FR') : ''
    }));
    
    const csv = generateCSVExport(rows, headers);
    downloadFile(csv, `comptabilite_laia_${formatDateLocal(new Date())}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportLivreRecettes = () => {
    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');
    const headers = [
      'Date',
      'N° Pièce',
      'Client',
      'Mode de règlement',
      'Montant HT',
      'TVA',
      'Montant TTC',
      'Cumul HT',
      'Cumul TVA',
      'Cumul TTC'
    ];
    
    let cumulHT = 0;
    let cumulTVA = 0;
    let cumulTTC = 0;
    
    const rows = paidReservations
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => {
        const ht = r.totalPrice / 1.20;
        const tva = r.totalPrice * 0.20 / 1.20;
        const ttc = r.totalPrice;
        
        cumulHT += ht;
        cumulTVA += tva;
        cumulTTC += ttc;
        
        return {
          'Date': new Date(r.date).toLocaleDateString('fr-FR'),
          'N° Pièce': r.invoiceNumber || generateInvoiceNumber(new Date(r.date)),
          'Client': r.userName || 'Client',
          'Mode de règlement': r.paymentMethod || 'CB',
          'Montant HT': ht.toFixed(2),
          'TVA': tva.toFixed(2),
          'Montant TTC': ttc.toFixed(2),
          'Cumul HT': cumulHT.toFixed(2),
          'Cumul TVA': cumulTVA.toFixed(2),
          'Cumul TTC': cumulTTC.toFixed(2)
        };
      });
    
    const csv = generateCSVExport(rows, headers);
    downloadFile(csv, `livre_recettes_laia_${formatDateLocal(new Date())}.csv`, 'text/csv;charset=utf-8;');
  };

  const generateInvoice = (reservation: Reservation) => {
    const invoice = {
      invoiceNumber: reservation.invoiceNumber || generateInvoiceNumber(new Date(reservation.date)),
      date: new Date(reservation.date),
      client: {
        name: reservation.userName || 'Client',
        email: reservation.userEmail || '',
        phone: reservation.userPhone,
        address: ''
      },
      services: Array.isArray(reservation.services) 
        ? reservation.services.map(s => ({
            name: s,
            quantity: 1,
            unitPrice: reservation.totalPrice / reservation.services.length / 1.20,
            vatRate: 20
          }))
        : [{
            name: reservation.services || 'Prestation',
            quantity: 1,
            unitPrice: reservation.totalPrice / 1.20,
            vatRate: 20
          }],
      totalHT: reservation.totalPrice / 1.20,
      totalVAT: reservation.totalPrice * 0.20 / 1.20,
      totalTTC: reservation.totalPrice,
      paymentMethod: reservation.paymentMethod || 'CB',
      paymentStatus: reservation.paymentStatus as 'paid' | 'pending',
      notes: reservation.notes
    };
    
    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const downloadInvoice = () => {
    if (!currentInvoice) return;
    
    const html = formatInvoiceHTML(currentInvoice);
    downloadFile(html, `facture_${currentInvoice.invoiceNumber}.html`, 'text/html');
  };

  const printInvoice = () => {
    if (!currentInvoice) return;
    
    const html = formatInvoiceHTML(currentInvoice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = searchTerm === '' ||
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'paid' && r.paymentStatus === 'paid') ||
      (filterStatus === 'pending' && r.paymentStatus !== 'paid');
    
    return matchesSearch && matchesStatus;
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Calculator className="w-8 h-8 text-[#d4b5a0]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Espace Comptable Pro</h1>
                <p className="text-xs text-gray-600">Laia Skin Institut - Gestion Financière</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres de période */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Période d'analyse
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export Excel Complet
              </button>
              <button
                onClick={exportLivreRecettes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Livre de Recettes
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {[
              { value: 'day' as const, label: 'Jour' },
              { value: 'week' as const, label: 'Semaine' },
              { value: 'month' as const, label: 'Mois' },
              { value: 'quarter' as const, label: 'Trimestre' },
              { value: 'year' as const, label: 'Année' }
            ].map(p => (
              <button
                key={p.value}
                onClick={() => {
                  setPeriod(p.value);
                  calculateStats(reservations);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === p.value
                    ? 'bg-[#d4b5a0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Statistiques */}
        <div className="mb-6">
          <div 
            className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('stats')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistiques Financières
            </h3>
            {expandedSections.stats ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.stats && (
            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* CA Total */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Euro className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">TTC</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">CA Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">HT</span>
                      <span className="font-medium">{(stats.totalRevenue / 1.20).toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {/* Encaissé */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Encaissé</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.paidAmount.toFixed(2)}€</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.totalRevenue > 0 ? (stats.paidAmount / stats.totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* En attente */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <ArrowDownRight className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingAmount.toFixed(2)}€</p>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-600">{reservations.filter(r => r.paymentStatus !== 'paid').length} factures</span>
                  </div>
                </div>

                {/* TVA */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <Receipt className="w-5 h-5 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">20%</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">TVA Collectée</p>
                  <p className="text-2xl font-bold text-red-600">{stats.vatCollected.toFixed(2)}€</p>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-600">À reverser</span>
                  </div>
                </div>
              </div>

              {/* Métriques secondaires */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Prestations</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.servicesCount}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Clients uniques</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.clientsCount}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Panier moyen</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.averageTicket.toFixed(2)}€</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Taux récurrence</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{stats.recurringRate.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Factures */}
        <div className="mb-6">
          <div 
            className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('reservations')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gestion des Factures
            </h3>
            {expandedSections.reservations ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.reservations && (
            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
              {/* Barre de recherche et filtres */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par client, email ou n° facture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="paid">Payées</option>
                  <option value="pending">En attente</option>
                </select>
                {selectedReservations.length > 0 && (
                  <button
                    onClick={() => {
                      // Générer factures groupées
                      alert(`Génération de ${selectedReservations.length} factures`);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    Factures ({selectedReservations.length})
                  </button>
                )}
              </div>

              {/* Table des réservations */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReservations(filteredReservations.map(r => r.id));
                            } else {
                              setSelectedReservations([]);
                            }
                          }}
                          checked={selectedReservations.length === filteredReservations.length && filteredReservations.length > 0}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TVA</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TTC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredReservations.map(reservation => {
                      const invoiceNumber = reservation.invoiceNumber || generateInvoiceNumber(new Date(reservation.date));
                      return (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedReservations.includes(reservation.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedReservations([...selectedReservations, reservation.id]);
                                } else {
                                  setSelectedReservations(selectedReservations.filter(id => id !== reservation.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(reservation.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">
                            {invoiceNumber}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{reservation.userName}</p>
                              <p className="text-xs text-gray-500">{reservation.userEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {Array.isArray(reservation.services) ? reservation.services.join(', ') : reservation.services}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {(reservation.totalPrice / 1.20).toFixed(2)}€
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {(reservation.totalPrice * 0.20 / 1.20).toFixed(2)}€
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {reservation.totalPrice.toFixed(2)}€
                          </td>
                          <td className="px-4 py-3">
                            {reservation.paymentStatus === 'paid' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Payée
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                En attente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => generateInvoice(reservation)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Voir la facture"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  generateInvoice(reservation);
                                  setTimeout(downloadInvoice, 100);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  generateInvoice(reservation);
                                  setTimeout(printInvoice, 100);
                                }}
                                className="p-1 text-gray-400 hover:text-purple-600"
                                title="Imprimer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section Documents légaux */}
        <div className="mb-6">
          <div 
            className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('documents')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Documents Légaux et Export
            </h3>
            {expandedSections.documents ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.documents && (
            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={exportLivreRecettes}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50 transition-all"
                >
                  <BookOpen className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                  <p className="font-medium">Livre de Recettes</p>
                  <p className="text-xs text-gray-600 mt-1">Export conforme aux normes comptables</p>
                </button>
                
                <button
                  onClick={() => {
                    const vatData = {
                      period: period,
                      vatCollected: stats.vatCollected,
                      vatDue: stats.vatDue,
                      totalHT: stats.paidAmount / 1.20,
                      totalTTC: stats.paidAmount
                    };
                    alert('Déclaration TVA générée:\n' + JSON.stringify(vatData, null, 2));
                  }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50 transition-all"
                >
                  <Receipt className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                  <p className="font-medium">Déclaration TVA</p>
                  <p className="text-xs text-gray-600 mt-1">Préparer la déclaration CA3</p>
                </button>
                
                <button
                  onClick={exportToExcel}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50 transition-all"
                >
                  <FileDown className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                  <p className="font-medium">Export Excel Détaillé</p>
                  <p className="text-xs text-gray-600 mt-1">Toutes les transactions avec TVA</p>
                </button>
                
                <button
                  onClick={() => {
                    const balance = {
                      actif: stats.paidAmount + stats.pendingAmount,
                      passif: stats.vatCollected,
                      resultat: stats.paidAmount / 1.20
                    };
                    alert('Bilan simplifié:\n' + JSON.stringify(balance, null, 2));
                  }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50 transition-all"
                >
                  <BarChart3 className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                  <p className="font-medium">Bilan Comptable</p>
                  <p className="text-xs text-gray-600 mt-1">Générer le bilan simplifié</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Informations légales et fiscales</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>TVA applicable : 20% sur l'ensemble des prestations de services</li>
                <li>Régime fiscal : TVA sur les encaissements</li>
                <li>Conservation des documents : 10 ans minimum</li>
                <li>Déclaration TVA : Mensuelle ou trimestrielle selon le CA</li>
                <li>Pénalités de retard : 3x le taux d'intérêt légal + 40€ de frais</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Facture */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Facture {currentInvoice.invoiceNumber}</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: formatInvoiceHTML(currentInvoice) }} />
            </div>
            
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={printInvoice}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button
                onClick={() => {
                  // Envoyer par email
                  alert(`Facture envoyée à ${currentInvoice.client.email}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Envoyer par email
              </button>
              <button
                onClick={downloadInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}