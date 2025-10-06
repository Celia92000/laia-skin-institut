'use client';

import { useState, useEffect } from 'react';
import { 
  Euro, Download, Calendar, TrendingUp, FileText, 
  Calculator, PieChart, BarChart3, DollarSign,
  ArrowUpRight, ArrowDownRight, Filter, FileDown, 
  Receipt, BookOpen, AlertCircle, CheckCircle, Clock,
  Package, Users, Briefcase, ChevronDown, ChevronUp,
  Printer, Mail, Search, X, RefreshCw, Eye
} from 'lucide-react';
import { generateInvoiceNumber, calculateInvoiceTotals, formatInvoiceHTML, generateCSVExport, downloadFile } from '@/lib/invoice-generator';

interface AdminComptabiliteTabProps {
  reservations: any[];
  fetchReservations: () => void;
}

export default function AdminComptabiliteTab({ reservations, fetchReservations }: AdminComptabiliteTabProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    factures: true,
    export: true
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
    vatDue: 0,
    monthlyGrowth: 0,
    yearlyGrowth: 0
  });

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    calculateStats();
  }, [reservations, orders, period]);

  // Charger les commandes
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      }
    };
    fetchOrders();
  }, []);

  const calculateStats = () => {
    const now = new Date();
    let filteredData = reservations;
    let filteredOrders = orders;

    // Filtrer les réservations par période
    switch (period) {
      case 'day':
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date.toDateString() === now.toDateString();
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date >= weekStart;
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= weekStart;
        });
        break;
      case 'month':
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        });
        break;
      case 'quarter':
        const quarterStart = new Date(now);
        quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3);
        quarterStart.setDate(1);
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date >= quarterStart;
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= quarterStart;
        });
        break;
      case 'year':
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date.getFullYear() === now.getFullYear();
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date.getFullYear() === now.getFullYear();
        });
        break;
    }
    
    const paidReservations = filteredData.filter(r => r.paymentStatus === 'paid');
    const pendingReservations = filteredData.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled');

    // Commandes payées et en attente
    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'paid');
    const pendingOrders = filteredOrders.filter(o => o.paymentStatus !== 'paid' && o.status !== 'cancelled');

    // Calculer les revenus des commandes
    const ordersRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrdersRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrdersRevenue = pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculer les clients uniques (réservations + commandes)
    const reservationEmails = new Set(filteredData.map(r => r.userEmail));
    const orderEmails = new Set(filteredOrders.map(o => o.customerEmail));
    const uniqueClients = new Set([...reservationEmails, ...orderEmails]).size;
    const recurringClients = reservations.filter(r => {
      const clientReservations = reservations.filter(res => res.userEmail === r.userEmail);
      return clientReservations.length > 1;
    });

    // Calculer la croissance
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthRevenue = reservations
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === lastMonth.getMonth() && 
               date.getFullYear() === lastMonth.getFullYear() &&
               r.paymentStatus === 'paid';
      })
      .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0);
    
    const currentMonthRevenue = paidReservations
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0);
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    
    // Calcul correct de la TVA : TTC - (TTC / 1.20) = TVA
    const calculateTVA = (ttc: number) => ttc - (ttc / 1.20);

    // Revenus combinés (réservations + commandes)
    const reservationsRevenue = filteredData.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0);
    const totalRevenueAmount = reservationsRevenue + ordersRevenue;
    const totalPaidAmount = paidReservations.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0) + paidOrdersRevenue;
    const totalPendingAmount = pendingReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0) + pendingOrdersRevenue;

    setStats({
      totalRevenue: totalRevenueAmount,
      paidAmount: totalPaidAmount,
      pendingAmount: totalPendingAmount,
      taxAmount: paidReservations.reduce((sum, r) => sum + calculateTVA(r.paymentAmount || r.totalPrice || 0), 0) + paidOrders.reduce((sum, o) => sum + calculateTVA(o.totalAmount || 0), 0),
      servicesCount: filteredData.length + filteredOrders.length,
      averageTicket: (filteredData.length + filteredOrders.length) > 0 ?
        totalRevenueAmount / (filteredData.length + filteredOrders.length) : 0,
      clientsCount: uniqueClients,
      recurringRate: uniqueClients > 0 ? (recurringClients.length / uniqueClients) * 100 : 0,
      vatCollected: paidReservations.reduce((sum, r) => sum + calculateTVA(r.paymentAmount || r.totalPrice || 0), 0) + paidOrders.reduce((sum, o) => sum + calculateTVA(o.totalAmount || 0), 0),
      vatDue: filteredData.reduce((sum, r) => sum + calculateTVA(r.totalPrice || 0), 0) + filteredOrders.reduce((sum, o) => sum + calculateTVA(o.totalAmount || 0), 0),
      monthlyGrowth,
      yearlyGrowth: 0
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
      'Réductions',
      'Montant HT',
      'TVA 20%',
      'Montant TTC',
      'Statut paiement',
      'Mode de paiement',
      'Date de paiement'
    ];

    // Exporter uniquement les réservations filtrées
    const rows = filteredReservations.map(r => {
      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      return {
        'Date': new Date(r.date).toLocaleDateString('fr-FR'),
        'N° Facture': r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id),
        'Client': r.userName || 'Client',
        'Email': r.userEmail || '',
        'Téléphone': r.phone || '',
        'Services': Array.isArray(r.services) ? r.services.join(', ') : r.services || '',
        'Réductions': r.appliedDiscounts ? JSON.stringify(r.appliedDiscounts) : '',
        'Montant HT': montantHT.toFixed(2),
        'TVA 20%': montantTVA.toFixed(2),
        'Montant TTC': montantTTC.toFixed(2),
        'Statut paiement': r.paymentStatus === 'paid' ? 'Payé' : 'En attente',
        'Mode de paiement': r.paymentMethod || '',
        'Date de paiement': r.paymentStatus === 'paid' ? new Date(r.paymentDate || r.createdAt).toLocaleDateString('fr-FR') : ''
      };
    });
    
    const csv = generateCSVExport(rows, headers);
    downloadFile(csv, `comptabilite_laia_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
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
      .sort((a, b) => {
        // Trier par date de paiement (la plus récente en premier), puis par date de réservation
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : new Date(a.date).getTime();
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      })
      .map(r => {
        const ttc = r.paymentAmount || r.totalPrice || 0;
        const ht = ttc / 1.20;
        const tva = ttc - ht;

        cumulHT += ht;
        cumulTVA += tva;
        cumulTTC += ttc;

        return {
          'Date': new Date(r.date).toLocaleDateString('fr-FR'),
          'N° Pièce': r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id),
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
    downloadFile(csv, `livre_recettes_laia_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportDeclarationTVA = () => {
    const vatReport = {
      periode: period,
      montantHT: (stats.paidAmount / 1.20).toFixed(2),
      tvaCollectee: stats.vatCollected.toFixed(2),
      montantTTC: stats.paidAmount.toFixed(2),
      nombreOperations: reservations.filter(r => r.paymentStatus === 'paid').length
    };
    
    const content = `DÉCLARATION TVA - LAIA SKIN INSTITUT
========================================
Période: ${period === 'month' ? 'Mensuelle' : period === 'quarter' ? 'Trimestrielle' : 'Annuelle'}
Date: ${new Date().toLocaleDateString('fr-FR')}

CHIFFRE D'AFFAIRES
------------------
Montant HT: ${vatReport.montantHT}€
TVA Collectée (20%): ${vatReport.tvaCollectee}€
Montant TTC: ${vatReport.montantTTC}€
Nombre d'opérations: ${vatReport.nombreOperations}

TVA À REVERSER
--------------
Montant: ${vatReport.tvaCollectee}€

Régime: TVA sur les encaissements
SIRET: 123 456 789 00000
N° TVA Intracommunautaire: FR12 345678900`;
    
    downloadFile(content, `declaration_tva_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };

  const generateBilanSimple = () => {
    const dateDebut = new Date();
    const dateFin = new Date();

    // Déterminer les dates selon la période
    switch (period) {
      case 'day':
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setHours(23, 59, 59, 999);
        break;
      case 'week':
        dateDebut.setDate(dateDebut.getDate() - dateDebut.getDay());
        dateDebut.setHours(0, 0, 0, 0);
        break;
      case 'month':
        dateDebut.setDate(1);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setMonth(dateFin.getMonth() + 1, 0);
        dateFin.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarterStart = Math.floor(dateDebut.getMonth() / 3) * 3;
        dateDebut.setMonth(quarterStart, 1);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setMonth(quarterStart + 3, 0);
        dateFin.setHours(23, 59, 59, 999);
        break;
      case 'year':
        dateDebut.setMonth(0, 1);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setMonth(11, 31);
        dateFin.setHours(23, 59, 59, 999);
        break;
    }

    const periodeName = {
      day: 'Journée',
      week: 'Semaine',
      month: 'Mois',
      quarter: 'Trimestre',
      year: 'Année'
    }[period];

    const content = `╔═══════════════════════════════════════════════════════════════╗
║             BILAN COMPTABLE SIMPLIFIÉ                         ║
║             LAIA SKIN INSTITUT                                ║
╚═══════════════════════════════════════════════════════════════╝

Période: ${periodeName}
Du ${dateDebut.toLocaleDateString('fr-FR')} au ${dateFin.toLocaleDateString('fr-FR')}
Date d'édition: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

═══════════════════════════════════════════════════════════════

📊 CHIFFRE D'AFFAIRES
───────────────────────────────────────────────────────────────
Chiffre d'affaires total TTC    ${stats.totalRevenue.toFixed(2).padStart(15)} €
  - Montant HT                   ${(stats.totalRevenue / 1.20).toFixed(2).padStart(15)} €
  - TVA 20%                      ${stats.taxAmount.toFixed(2).padStart(15)} €

Encaissements (payés)            ${stats.paidAmount.toFixed(2).padStart(15)} €
En attente de paiement           ${stats.pendingAmount.toFixed(2).padStart(15)} €

═══════════════════════════════════════════════════════════════

💰 TRÉSORERIE
───────────────────────────────────────────────────────────────
Montant encaissé TTC             ${stats.paidAmount.toFixed(2).padStart(15)} €
  - dont TVA collectée           ${stats.vatCollected.toFixed(2).padStart(15)} €
TVA à reverser à l'État          ${stats.vatCollected.toFixed(2).padStart(15)} €

═══════════════════════════════════════════════════════════════

📈 ACTIVITÉ
───────────────────────────────────────────────────────────────
Nombre de prestations            ${stats.servicesCount.toString().padStart(15)}
Nombre de clients                ${stats.clientsCount.toString().padStart(15)}
Panier moyen                     ${stats.averageTicket.toFixed(2).padStart(15)} €
Taux de fidélisation             ${stats.recurringRate.toFixed(1).padStart(15)} %
Croissance vs mois précédent     ${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1).padStart(14)} %

═══════════════════════════════════════════════════════════════

💡 RÉSUMÉ
───────────────────────────────────────────────────────────────
Chiffre d'affaires encaissé      ${stats.paidAmount.toFixed(2).padStart(15)} €
- TVA à reverser                 ${stats.vatCollected.toFixed(2).padStart(15)} €
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= Résultat net (HT)              ${((stats.paidAmount / 1.20)).toFixed(2).padStart(15)} €

═══════════════════════════════════════════════════════════════

ℹ️  INFORMATIONS LÉGALES
───────────────────────────────────────────────────────────────
Régime TVA: TVA sur les encaissements
Taux de TVA applicable: 20%
SIRET: 123 456 789 00000
N° TVA Intracommunautaire: FR12 345678900

═══════════════════════════════════════════════════════════════

Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
LAIA SKIN INSTITUT - Institut de beauté
Pour toute question: contact@laia-skin-institut.com`;

    downloadFile(content, `bilan_simplifie_${period}_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain;charset=utf-8;');
  };

  const generateInvoice = (reservation: any) => {
    // Utiliser paymentAmount si disponible (montant réellement payé avec réductions)
    const montantTTC = reservation.paymentAmount || reservation.totalPrice || 0;
    const montantHT = montantTTC / 1.20;
    const montantTVA = montantTTC - montantHT;

    const invoice = {
      invoiceNumber: reservation.invoiceNumber || generateInvoiceNumber(new Date(reservation.date), reservation.id),
      date: new Date(reservation.date),
      client: {
        name: reservation.userName || 'Client',
        email: reservation.userEmail || '',
        phone: reservation.phone,
        address: ''
      },
      services: Array.isArray(reservation.services)
        ? reservation.services.map((s: string) => ({
            name: s,
            quantity: 1,
            unitPrice: montantHT / reservation.services.length,
            vatRate: 20
          }))
        : [{
            name: reservation.services || 'Prestation',
            quantity: 1,
            unitPrice: montantHT,
            vatRate: 20
          }],
      totalHT: montantHT,
      totalVAT: montantTVA,
      totalTTC: montantTTC,
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

    // Ajouter des boutons d'action dans la facture
    const htmlWithActions = html.replace(
      '</body>',
      `
      <div style="position: fixed; top: 20px; right: 20px; display: flex; gap: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <button onclick="window.print()" style="padding: 10px 20px; background: #d4b5a0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          🖨️ Imprimer
        </button>
        <button onclick="downloadInvoice()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          📥 Télécharger
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          ✕ Fermer
        </button>
      </div>
      <script>
        function downloadInvoice() {
          const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'facture_${currentInvoice.invoiceNumber}.html';
          a.click();
          URL.revokeObjectURL(url);
        }
      </script>
      <style>
        @media print {
          button, div[style*="position: fixed"] { display: none !important; }
        }
      </style>
      </body>`
    );

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlWithActions);
      printWindow.document.close();
    }
  };

  const filteredReservations = reservations
    .filter(r => {
      const matchesSearch = searchTerm === '' ||
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'paid' && r.paymentStatus === 'paid') ||
        (filterStatus === 'pending' && r.paymentStatus !== 'paid');

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Trier par date de paiement (plus récent en premier), puis par date de mise à jour
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : new Date(a.updatedAt || a.date).getTime();
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : new Date(b.updatedAt || b.date).getTime();
      return dateB - dateA;
    });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Période et Actions Rapides */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analyse Financière
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchReservations}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={exportLivreRecettes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Livre Recettes
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
              onClick={() => setPeriod(p.value)}
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

      {/* Statistiques Principales */}
      <div>
        <div 
          className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('stats')}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Vue d'Ensemble
          </h3>
          {expandedSections.stats ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSections.stats && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* CA Total */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Euro className="w-5 h-5 text-green-600" />
                  {stats.monthlyGrowth > 0 && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{stats.monthlyGrowth.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">HT</span>
                    <span className="font-medium">{(stats.totalRevenue / 1.20).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA</span>
                    <span className="font-medium">{(stats.totalRevenue * 0.20 / 1.20).toFixed(2)}€</span>
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
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${stats.totalRevenue > 0 ? (stats.paidAmount / stats.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalRevenue > 0 ? Math.round((stats.paidAmount / stats.totalRevenue) * 100) : 0}% du CA
                  </p>
                </div>
              </div>

              {/* En attente */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-xs text-orange-600 font-bold">
                    {reservations.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled').length}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingAmount.toFixed(2)}€</p>
                <div className="mt-2 text-xs">
                  <button className="text-orange-600 hover:text-orange-700 underline">
                    Voir les impayés →
                  </button>
                </div>
              </div>

              {/* TVA à reverser */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <Receipt className="w-5 h-5 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">20%</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">TVA Collectée</p>
                <p className="text-2xl font-bold text-red-600">{stats.vatCollected.toFixed(2)}€</p>
                <div className="mt-2">
                  <button
                    onClick={exportDeclarationTVA}
                    className="text-xs text-red-600 hover:text-red-700 underline"
                  >
                    Préparer déclaration →
                  </button>
                </div>
              </div>
            </div>

            {/* Métriques secondaires */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                  <span className="text-xs text-gray-600">Clients</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.clientsCount}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Panier moy.</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.averageTicket.toFixed(0)}€</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Récurrence</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.recurringRate.toFixed(0)}%</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Taux encais.</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {stats.totalRevenue > 0 ? Math.round((stats.paidAmount / stats.totalRevenue) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gestion des Factures */}
      <div>
        <div 
          className="bg-white rounded-t-xl shadow-sm p-4 flex items-center justify-between"
        >
          <div 
            className="flex-1 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('factures')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Factures et Paiements
            </h3>
            {expandedSections.factures ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
        
        {expandedSections.factures && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
            {/* Barre de recherche et actions */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par n° facture, client, email..."
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
              
              {/* Boutons d'export */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Export PDF de toutes les factures du mois
                    const paidReservations = filteredReservations.filter(r => r.paymentStatus === 'paid');
                    if (paidReservations.length === 0) {
                      alert('Aucune facture à exporter');
                      return;
                    }
                    
                    // Ouvrir une nouvelle fenêtre avec toutes les factures
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write('<html><head><title>Factures du mois</title></head><body>');
                      printWindow.document.write('<h1>Chargement des factures...</h1>');
                      
                      // Charger chaque facture
                      paidReservations.forEach((reservation, index) => {
                        if (index > 0) printWindow.document.write('<div style="page-break-after: always;"></div>');
                        fetch(`/api/invoice/${reservation.id}`)
                          .then(res => res.text())
                          .then(html => {
                            printWindow.document.write(html);
                            if (index === paidReservations.length - 1) {
                              printWindow.document.write('</body></html>');
                              setTimeout(() => printWindow.print(), 1000);
                            }
                          });
                      });
                    }
                  }}
                  className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] flex items-center gap-2"
                  title="Imprimer toutes les factures"
                >
                  <FileText className="w-4 h-4" />
                  Imprimer
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  title="Exporter en Excel"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </div>

            {/* Table simplifiée */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Facture</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Services</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReservations.slice(0, 10).map(reservation => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-semibold text-[#d4b5a0]">
                            {reservation.invoiceNumber || (reservation.paymentStatus === 'paid' ? `FAC-${new Date(reservation.date).getFullYear()}${String(new Date(reservation.date).getMonth() + 1).padStart(2, '0')}-AUTO` : '-')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(reservation.date).toLocaleDateString('fr-FR')}
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
                      <td className="px-4 py-3 text-sm font-bold">
                        {reservation.totalPrice?.toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">
                        {reservation.paymentStatus === 'paid' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ Payée
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
                            onClick={() => {
                              generateInvoice(reservation);
                              setTimeout(printInvoice, 100);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section Commandes Produits/Formations */}
            <div className="mt-8 border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Commandes Produits & Formations
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Commande</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Articles</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.filter(o => {
                      const matchesSearch = searchTerm === '' ||
                        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

                      const matchesStatus = filterStatus === 'all' ||
                        (filterStatus === 'paid' && o.paymentStatus === 'paid') ||
                        (filterStatus === 'pending' && o.paymentStatus !== 'paid');

                      return matchesSearch && matchesStatus;
                    }).slice(0, 10).map(order => {
                      let items = [];
                      try {
                        items = JSON.parse(order.items || '[]');
                      } catch (e) {
                        console.error('Erreur parsing items:', e);
                      }

                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className="font-mono font-semibold text-purple-600">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.orderType === 'product'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {order.orderType === 'product' ? 'Produit' : 'Formation'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {order.totalAmount?.toFixed(2)}€
                          </td>
                          <td className="px-4 py-3">
                            {order.paymentStatus === 'paid' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Payé
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                En attente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune commande enregistrée
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents et Export */}
      <div>
        <div 
          className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('export')}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Documents Comptables
          </h3>
          {expandedSections.export ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSections.export && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={exportLivreRecettes}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <BookOpen className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Livre de Recettes</p>
              </button>
              
              <button
                onClick={exportDeclarationTVA}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <Receipt className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Déclaration TVA</p>
              </button>
              
              <button
                onClick={exportToExcel}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <FileDown className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Export Détaillé</p>
              </button>
              
              <button
                onClick={generateBilanSimple}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <BarChart3 className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Bilan Simplifié</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informations légales */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Rappels légaux</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>TVA 20% sur toutes les prestations</li>
              <li>Conservation des documents : 10 ans</li>
              <li>Déclaration TVA mensuelle ou trimestrielle selon CA</li>
              <li>Facture obligatoire pour tout montant supérieur à 25€</li>
            </ul>
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