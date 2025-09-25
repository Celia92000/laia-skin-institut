'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Users, Euro, Package } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportData {
  reservations?: any[];
  clients?: any[];
  services?: any[];
  revenue?: any[];
}

export default function DataExport() {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'reservations' | 'clients' | 'revenue' | 'all'>('reservations');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const data: ExportData = {};
      
      if (exportType === 'reservations' || exportType === 'all') {
        const res = await fetch('/api/admin/reservations', { headers });
        if (res.ok) data.reservations = await res.json();
      }
      
      if (exportType === 'clients' || exportType === 'all') {
        const res = await fetch('/api/admin/clients', { headers });
        if (res.ok) data.clients = await res.json();
      }
      
      if (exportType === 'revenue' || exportType === 'all') {
        const res = await fetch('/api/admin/real-stats', { headers });
        if (res.ok) data.revenue = [await res.json()];
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return {};
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const data = await fetchData();
    const doc = new jsPDF();
    
    // En-tête du document
    doc.setFontSize(20);
    doc.setTextColor(139, 115, 85);
    doc.text('LAIA SKIN Institut', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
    
    let yPosition = 40;

    // Export des réservations
    if (data.reservations && data.reservations.length > 0) {
      doc.setFontSize(14);
      doc.text('Réservations', 14, yPosition);
      yPosition += 10;
      
      const reservationData = data.reservations.map(r => [
        new Date(r.date).toLocaleDateString('fr-FR'),
        r.time,
        r.userName || 'N/A',
        r.serviceName || 'Service',
        `${r.totalPrice || 0}€`,
        r.status === 'completed' ? 'Terminé' : r.status === 'confirmed' ? 'Confirmé' : 'En attente'
      ]);
      
      doc.autoTable({
        head: [['Date', 'Heure', 'Client', 'Service', 'Montant', 'Statut']],
        body: reservationData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85] },
        styles: { fontSize: 9 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Export des clients
    if (data.clients && data.clients.length > 0 && yPosition < 250) {
      doc.setFontSize(14);
      doc.text('Clients', 14, yPosition);
      yPosition += 10;
      
      const clientData = data.clients.slice(0, 10).map(c => [
        c.name || 'N/A',
        c.email,
        c.phone || 'N/A',
        c._count?.reservations || 0,
        new Date(c.createdAt).toLocaleDateString('fr-FR')
      ]);
      
      doc.autoTable({
        head: [['Nom', 'Email', 'Téléphone', 'Réservations', 'Inscrit le']],
        body: clientData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85] },
        styles: { fontSize: 9 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Statistiques de revenus
    if (data.revenue && data.revenue[0] && yPosition < 250) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Statistiques financières', 14, 20);
      
      const stats = data.revenue[0];
      const statsData = [
        ['Chiffre d\'affaires total', `${stats.totalRevenue?.toFixed(2) || 0}€`],
        ['CA du mois', `${stats.monthlyRevenue?.toFixed(2) || 0}€`],
        ['CA du jour', `${stats.todayRevenue?.toFixed(2) || 0}€`],
        ['Montants payés', `${stats.paidRevenue?.toFixed(2) || 0}€`],
        ['En attente de paiement', `${stats.pendingPayments?.toFixed(2) || 0}€`],
        ['Total réservations', stats.totalReservations || 0],
        ['Réservations confirmées', stats.confirmedReservations || 0],
        ['Réservations terminées', stats.completedReservations || 0]
      ];
      
      doc.autoTable({
        head: [['Indicateur', 'Valeur']],
        body: statsData,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [139, 115, 85] },
        styles: { fontSize: 10 }
      });
    }

    // Pied de page
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
      doc.text('© LAIA SKIN Institut - Document confidentiel', 105, 295, { align: 'center' });
    }
    
    doc.save(`laia-skin-rapport-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = async () => {
    const data = await fetchData();
    const wb = XLSX.utils.book_new();
    
    // Feuille des réservations
    if (data.reservations && data.reservations.length > 0) {
      const reservationSheet = data.reservations.map(r => ({
        'Date': new Date(r.date).toLocaleDateString('fr-FR'),
        'Heure': r.time,
        'Client': r.userName || 'N/A',
        'Email': r.userEmail || 'N/A',
        'Téléphone': r.phone || 'N/A',
        'Service': r.serviceName || 'Service',
        'Montant (€)': r.totalPrice || 0,
        'Statut': r.status === 'completed' ? 'Terminé' : r.status === 'confirmed' ? 'Confirmé' : 'En attente',
        'Statut paiement': r.paymentStatus || 'Non payé',
        'Méthode paiement': r.paymentMethod || 'N/A',
        'Notes': r.notes || ''
      }));
      
      const ws = XLSX.utils.json_to_sheet(reservationSheet);
      XLSX.utils.book_append_sheet(wb, ws, 'Réservations');
    }
    
    // Feuille des clients
    if (data.clients && data.clients.length > 0) {
      const clientSheet = data.clients.map(c => ({
        'Nom': c.name || 'N/A',
        'Email': c.email,
        'Téléphone': c.phone || 'N/A',
        'Rôle': c.role || 'CLIENT',
        'Nombre de réservations': c._count?.reservations || 0,
        'Inscrit le': new Date(c.createdAt).toLocaleDateString('fr-FR'),
        'Dernière connexion': c.lastLogin ? new Date(c.lastLogin).toLocaleDateString('fr-FR') : 'N/A'
      }));
      
      const ws = XLSX.utils.json_to_sheet(clientSheet);
      XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    }
    
    // Feuille des statistiques
    if (data.revenue && data.revenue[0]) {
      const stats = data.revenue[0];
      const statsSheet = [
        { 'Indicateur': 'Chiffre d\'affaires total', 'Valeur': stats.totalRevenue?.toFixed(2) || 0, 'Unité': '€' },
        { 'Indicateur': 'CA du mois', 'Valeur': stats.monthlyRevenue?.toFixed(2) || 0, 'Unité': '€' },
        { 'Indicateur': 'CA du jour', 'Valeur': stats.todayRevenue?.toFixed(2) || 0, 'Unité': '€' },
        { 'Indicateur': 'Montants payés', 'Valeur': stats.paidRevenue?.toFixed(2) || 0, 'Unité': '€' },
        { 'Indicateur': 'En attente de paiement', 'Valeur': stats.pendingPayments?.toFixed(2) || 0, 'Unité': '€' },
        { 'Indicateur': 'Total réservations', 'Valeur': stats.totalReservations || 0, 'Unité': 'réservations' },
        { 'Indicateur': 'Réservations en attente', 'Valeur': stats.pendingReservations || 0, 'Unité': 'réservations' },
        { 'Indicateur': 'Réservations confirmées', 'Valeur': stats.confirmedReservations || 0, 'Unité': 'réservations' },
        { 'Indicateur': 'Réservations terminées', 'Valeur': stats.completedReservations || 0, 'Unité': 'réservations' }
      ];
      
      const ws = XLSX.utils.json_to_sheet(statsSheet);
      XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');
    }
    
    // Générer le fichier Excel
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `laia-skin-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-[#8B7355]" />
        Export des données
      </h3>

      <div className="space-y-4">
        {/* Sélection du type de données */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de données à exporter
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => setExportType('reservations')}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                exportType === 'reservations'
                  ? 'border-[#8B7355] bg-[#8B7355]/10 text-[#8B7355]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Réservations</span>
            </button>
            
            <button
              onClick={() => setExportType('clients')}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                exportType === 'clients'
                  ? 'border-[#8B7355] bg-[#8B7355]/10 text-[#8B7355]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">Clients</span>
            </button>
            
            <button
              onClick={() => setExportType('revenue')}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                exportType === 'revenue'
                  ? 'border-[#8B7355] bg-[#8B7355]/10 text-[#8B7355]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Euro className="w-5 h-5" />
              <span className="text-xs font-medium">Finances</span>
            </button>
            
            <button
              onClick={() => setExportType('all')}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                exportType === 'all'
                  ? 'border-[#8B7355] bg-[#8B7355]/10 text-[#8B7355]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-xs font-medium">Tout</span>
            </button>
          </div>
        </div>

        {/* Sélection de la période */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
            />
          </div>
        </div>

        {/* Boutons d'export */}
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {loading ? 'Chargement...' : 'Exporter en PDF'}
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {loading ? 'Chargement...' : 'Exporter en Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}