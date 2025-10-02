"use client";

import { useState, useEffect } from "react";
import { 
  Clock, CheckCircle, XCircle, User, Calendar, 
  Euro, AlertTriangle, Check, X, Eye
} from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  time: string;
  userName?: string;
  userEmail: string;
  services: any[];
  status: string;
  totalPrice: number;
  createdAt?: string;
}

export default function PendingReservations() {
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchPendingReservations();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchPendingReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrer seulement les réservations en attente
        const pending = data.filter((r: Reservation) => r.status === 'pending');
        setPendingReservations(pending);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateReservation = async (reservationId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'confirmed'
        })
      });

      if (response.ok) {
        setPendingReservations(pendingReservations.filter(r => r.id !== reservationId));
        setShowDetail(false);
        alert('Réservation validée avec succès ! Elle apparaît maintenant dans le calendrier.');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const rejectReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser cette réservation ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });

      if (response.ok) {
        setPendingReservations(pendingReservations.filter(r => r.id !== reservationId));
        setShowDetail(false);
        alert('Réservation refusée.');
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#2c3e50]">
          Réservations en attente de validation
        </h3>
        {pendingReservations.length > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {pendingReservations.length} en attente
          </span>
        )}
      </div>

      {pendingReservations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Aucune réservation en attente</p>
          <p className="text-sm text-gray-500 mt-2">
            Toutes les réservations ont été traitées
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReservations.map(reservation => (
            <div 
              key={reservation.id} 
              className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-[#2c3e50]">
                      {reservation.userName || 'Client'} - {reservation.userEmail}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-[#2c3e50]/70 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(reservation.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{reservation.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#d4b5a0]">
                      {reservation.totalPrice}€
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowDetail(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => validateReservation(reservation.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Valider"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectReservation(reservation.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Refuser"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détail */}
      {showDetail && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2c3e50]">
                Détails de la demande de réservation
              </h3>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedReservation(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informations client */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <h4 className="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#d4b5a0]" />
                  Informations client
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Nom:</span>
                    <span className="font-medium">{selectedReservation.userName || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Email:</span>
                    <span className="font-medium">{selectedReservation.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Date et heure */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <h4 className="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#d4b5a0]" />
                  Date et heure demandées
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedReservation.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2c3e50]/70">Heure:</span>
                    <span className="font-medium">{selectedReservation.time}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <h4 className="font-semibold text-[#2c3e50] mb-3">Services demandés</h4>
                <div className="space-y-2">
                  {selectedReservation.services && selectedReservation.services.length > 0 ? (
                    selectedReservation.services.map((service: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>
                          {typeof service === 'string'
                            ? service
                            : service.name || 'Service inconnu'
                          }
                        </span>
                        {typeof service === 'object' && service.price && (
                          <span className="font-medium">{service.price}€</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#2c3e50]/70">Aucun service spécifié</p>
                  )}
                </div>
              </div>

              {/* Prix total */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#2c3e50]">Prix total:</span>
                  <span className="text-xl font-bold text-[#d4b5a0]">{selectedReservation.totalPrice}€</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#d4b5a0]/20">
                <button
                  onClick={() => rejectReservation(selectedReservation.id)}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Refuser
                </button>
                <button
                  onClick={() => validateReservation(selectedReservation.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Valider la réservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}