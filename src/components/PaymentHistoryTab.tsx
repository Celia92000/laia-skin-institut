'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, RefreshCw, Calendar, DollarSign, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

interface Payment {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  stripePaymentId?: string;
  description?: string;
  receiptUrl?: string;
  createdAt: string;
  reservationId?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function PaymentHistoryTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'pending' | 'failed' | 'refunded'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchPayments();
  }, [filter, dateRange]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filter !== 'all') params.append('status', filter);
      if (dateRange !== 'all') params.append('dateRange', dateRange);

      const response = await fetch(`/api/admin/payments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'failed':
      case 'refunded':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getTotalAmount = () => {
    return payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0)
      .toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Total encaissé</p>
              <p className="text-2xl font-bold text-green-700">{getTotalAmount()}€</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <DollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Paiements réussis</p>
              <p className="text-2xl font-bold text-blue-700">
                {payments.filter(p => p.status === 'succeeded').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <CheckCircle className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium mb-1">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium mb-1">Échoués</p>
              <p className="text-2xl font-bold text-red-700">
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <XCircle className="text-red-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtres :</span>
          </div>

          <div className="flex gap-2">
            {(['all', 'succeeded', 'pending', 'failed', 'refunded'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tous' :
                 status === 'succeeded' ? 'Réussis' :
                 status === 'pending' ? 'En attente' :
                 status === 'failed' ? 'Échoués' : 'Remboursés'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'today' ? "Aujourd'hui" :
                 range === 'week' ? '7 jours' :
                 range === 'month' ? '30 jours' : 'Tous'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchPayments}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Aucun paiement trouvé</p>
            <p className="text-sm text-gray-500 mt-1">Les paiements apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {payment.user?.firstName} {payment.user?.lastName}
                        </div>
                        <div className="text-gray-500 text-xs">{payment.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {payment.description || 'Paiement'}
                      </div>
                      {payment.stripePaymentId && (
                        <div className="text-xs text-gray-500 font-mono">
                          {payment.stripePaymentId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {payment.amount.toFixed(2)}€
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700 capitalize">
                          {payment.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status === 'succeeded' ? 'Réussi' :
                         payment.status === 'pending' ? 'En attente' :
                         payment.status === 'failed' ? 'Échoué' : 'Remboursé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Download size={14} />
                            Reçu
                          </a>
                        )}
                        {payment.reservationId && (
                          <a
                            href={`/admin/reservations/${payment.reservationId}`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Voir
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
