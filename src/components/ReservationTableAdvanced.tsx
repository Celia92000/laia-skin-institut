'use client';

import { useState, useMemo } from 'react';
import {
  Calendar, Clock, User, Euro, Filter, Download, ChevronUp, ChevronDown,
  Search, Phone, Instagram, Globe, MessageCircle, Users, MapPin, MoreHorizontal,
  FileText, Eye
} from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface Reservation {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  phone?: string;
  userPhone?: string;
  services: string[];
  packages: {[key: string]: string};
  date: Date | string;
  time: string;
  totalPrice: number;
  status: string;
  source?: string;
  notes?: string;
  paymentStatus?: string;
  paymentDate?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  paymentNotes?: string;
  createdAt: Date | string;
  cancelReason?: string;
}

interface ReservationTableProps {
  reservations: Reservation[];
  services: Record<string, string>;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const sourceIcons: Record<string, any> = {
  website: Globe,
  site: Globe,
  phone: Phone,
  instagram: Instagram,
  tiktok: MessageCircle,
  facebook: Users,
  walkin: MapPin,
  other: MoreHorizontal
};

const sourceLabels: Record<string, string> = {
  website: 'Site Web',
  site: 'Site Web',
  phone: 'Téléphone',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  walkin: 'Sur place',
  other: 'Autre'
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-700'
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'No show'
};

export default function ReservationTableAdvanced({ 
  reservations, 
  services,
  onEdit,
  onStatusChange 
}: ReservationTableProps) {
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage et tri
  const filteredAndSortedReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.services.some(s => (services[s] || s).toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filtre par source
    if (filterSource !== 'all') {
      filtered = filtered.filter(r => r.source === filterSource);
    }

    // Filtre par date
    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(dateRange.end));
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof Reservation];
      let bVal: any = b[sortField as keyof Reservation];

      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else if (sortField === 'totalPrice') {
        aVal = a.totalPrice;
        bVal = b.totalPrice;
      } else if (sortField === 'userName') {
        aVal = (a.userName || '').toLowerCase();
        bVal = (b.userName || '').toLowerCase();
      } else if (sortField === 'status') {
        aVal = a.status || 'pending';
        bVal = b.status || 'pending';
      } else if (sortField === 'paymentStatus') {
        aVal = a.paymentStatus || 'pending';
        bVal = b.paymentStatus || 'pending';
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [reservations, searchQuery, filterStatus, filterSource, dateRange, sortField, sortDirection, services]);

  // Statistiques
  const stats = useMemo(() => {
    const bySource = reservations.reduce((acc, r) => {
      const source = r.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = reservations.reduce((acc, r) => {
      const status = r.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.totalPrice, 0);

    return { bySource, byStatus, totalRevenue };
  }, [reservations]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Heure', 'Client', 'Email', 'Téléphone', 'Services', 'Prix', 'Statut', 'Source', 'Paiement'];
    const rows = filteredAndSortedReservations.map(r => [
      new Date(r.date).toLocaleDateString('fr-FR'),
      r.time,
      r.userName,
      r.userEmail,
      r.userPhone || '',
      r.services.map(s => services[s] || s).join(', '),
      `${r.totalPrice}€`,
      statusLabels[r.status || 'pending'],
      sourceLabels[r.source || 'site'] || r.source || 'site',
      r.paymentStatus === 'paid' ? 'Payé' : 'Non payé'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservations_${formatDateLocal(new Date())}.csv`;
    link.click();
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Total réservations</p>
          <p className="text-2xl font-bold text-blue-600">{reservations.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Confirmées</p>
          <p className="text-2xl font-bold text-green-600">{stats.byStatus.confirmed || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">CA Total</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue}€</p>
        </div>
      </div>

      {/* Sources de réservation */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sources des réservations</h3>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(stats.bySource).map(([source, count]) => {
            const Icon = sourceIcons[source] || Globe;
            return (
              <div key={source} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{sourceLabels[source] || source}</span>
                <span className="text-sm text-gray-500">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex gap-3 flex-1 flex-wrap">
            {/* Recherche */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher client, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bouton Filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showFilters ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Filtres
            </button>

            {/* Export */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Filtre par statut */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Filtre par source */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes</option>
                <option value="website">Site Web</option>
                <option value="phone">Téléphone</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="walkin">Sur place</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Filtre par date début */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Du</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filtre par date fin */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Au</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Heure</th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('userName')}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Client
                    {sortField === 'userName' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Services</th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('totalPrice')}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Prix
                    {sortField === 'totalPrice' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Statut
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('paymentStatus')}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Paiement
                    {sortField === 'paymentStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredAndSortedReservations.map((reservation) => {
                  const SourceIcon = sourceIcons[reservation.source || ''] || Globe;
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {new Date(reservation.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{reservation.time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reservation.userName || 'Client'}</p>
                          <p className="text-xs text-gray-500">{reservation.userEmail || ''}</p>
                          {reservation.userPhone && (
                            <p className="text-xs text-gray-500">{reservation.userPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm">
                            {reservation.services && reservation.services.length > 0 
                              ? reservation.services.map((s: string) => services[s] || s).join(', ')
                              : 'Aucun service'
                            }
                          </div>
                          {/* Affichage des remarques si présentes */}
                          {reservation.notes && (
                            <div className="bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              <p className="text-xs text-amber-700">
                                <span className="font-medium">Note :</span> {reservation.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold">{reservation.totalPrice}€</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>
                          {statusLabels[reservation.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <SourceIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{sourceLabels[reservation.source || ''] || reservation.source || 'Site'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (reservation.paymentStatus || 'pending') === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {(reservation.paymentStatus || 'pending') === 'paid' ? '✓ Payé' : 'Non payé'}
                          </span>
                          {reservation.invoiceNumber && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="font-medium">📄</span>
                              {reservation.invoiceNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {/* Bouton Facture pour les réservations payées */}
                          {reservation.paymentStatus === 'paid' && reservation.invoiceNumber && (
                            <button
                              onClick={() => {
                                // Ouvrir la facture dans un nouvel onglet
                                const invoiceUrl = `/api/invoice/${reservation.id}`;
                                window.open(invoiceUrl, '_blank');
                              }}
                              className="px-2 py-1 bg-[#d4b5a0] text-white text-xs rounded hover:bg-[#c9a084] flex items-center gap-1"
                              title={`Voir facture ${reservation.invoiceNumber}`}
                            >
                              <FileText className="w-3 h-3" />
                              Facture
                            </button>
                          )}
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onStatusChange?.(reservation.id, 'confirmed')}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => onStatusChange?.(reservation.id, 'cancelled')}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(reservation)}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              Modifier
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé */}
      <div className="text-sm text-gray-500 text-center">
        {filteredAndSortedReservations.length} réservation(s) sur {reservations.length}
      </div>
    </div>
  );
}