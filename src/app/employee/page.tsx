'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, Users, CheckCircle, XCircle, 
  Phone, Mail, User, LogOut, Filter, Search,
  TrendingUp, Award, Euro, CalendarDays, MessageCircle,
  AlertCircle, ChevronRight, RefreshCw, Check, X
} from 'lucide-react';

interface Reservation {
  id: string;
  date: string;
  time: string;
  services: any[];
  totalPrice: number;
  status: string;
  notes?: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    todayReservations: 0,
    weekReservations: 0,
    monthRevenue: 0,
    pendingCount: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email || (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    fetchReservations();
  }, [router]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservations: Reservation[]) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const todayReservations = reservations.filter(r => r.date === today).length;
    const weekReservations = reservations.filter(r => new Date(r.date) >= weekAgo).length;
    const monthRevenue = reservations
      .filter(r => new Date(r.date) >= monthAgo && r.status === 'confirmed')
      .reduce((acc, r) => acc + r.totalPrice, 0);
    const pendingCount = reservations.filter(r => r.status === 'pending').length;

    setStats({ todayReservations, weekReservations, monthRevenue, pendingCount });
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchReservations();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const todayReservations = reservations.filter(r => r.date === selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#d4b5a0] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Espace Employé</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentUser?.name}
              </span>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CalendarDays className="w-8 h-8 text-[#d4b5a0]" />
              <span className="text-2xl font-bold text-gray-900">{stats.todayReservations}</span>
            </div>
            <p className="text-sm text-gray-600">RDV aujourd'hui</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.weekReservations}</span>
            </div>
            <p className="text-sm text-gray-600">RDV cette semaine</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Euro className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.monthRevenue}€</span>
            </div>
            <p className="text-sm text-gray-600">CA du mois</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.pendingCount}</span>
            </div>
            <p className="text-sm text-gray-600">En attente</p>
          </div>
        </div>

        {/* Planning du jour */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Planning du jour</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            />
          </div>

          {todayReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune réservation pour cette date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayReservations.map((reservation) => (
                <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900">{reservation.time}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status === 'confirmed' ? 'Confirmé' :
                           reservation.status === 'pending' ? 'En attente' : 'Annulé'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{reservation.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {reservation.user.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {reservation.user.email}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-700 font-medium">Services:</p>
                        <p className="text-sm text-gray-600">
                          {reservation.services.map((s: any) => s.name).join(', ')}
                        </p>
                        <p className="text-sm font-semibold text-[#d4b5a0] mt-1">
                          Total: {reservation.totalPrice}€
                        </p>
                      </div>

                      {reservation.notes && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                          <strong>Notes:</strong> {reservation.notes}
                        </div>
                      )}
                    </div>

                    {reservation.status === 'pending' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Confirmer"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Annuler"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prochains RDV */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Prochaines réservations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Heure</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Services</th>
                  <th className="pb-3">Prix</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations
                  .filter(r => new Date(r.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 10)
                  .map((reservation) => (
                    <tr key={reservation.id} className="text-sm">
                      <td className="py-3">{new Date(reservation.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3">{reservation.time}</td>
                      <td className="py-3">{reservation.user.name}</td>
                      <td className="py-3">{reservation.services.map((s: any) => s.name).join(', ')}</td>
                      <td className="py-3 font-semibold">{reservation.totalPrice}€</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status === 'confirmed' ? 'Confirmé' :
                           reservation.status === 'pending' ? 'En attente' : 'Annulé'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}