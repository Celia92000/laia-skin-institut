"use client";

import { useState } from "react";
import { 
  Calendar, Clock, User, Euro, ChevronDown, ChevronUp, 
  AlertCircle, Phone, Mail, MessageSquare, Eye, X, 
  Filter, ArrowRight, Bell, Sparkles
} from "lucide-react";

interface Reservation {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  phone?: string;
  services: string[];
  packages: {[key: string]: string};
  date: string | Date;
  time: string;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string | Date;
  paymentStatus?: string;
  source?: string;
}

interface NewReservationsPanelProps {
  reservations: Reservation[];
  onReservationClick?: (reservation: Reservation) => void;
  services: any[];
}

export default function NewReservationsPanel({ 
  reservations, 
  onReservationClick,
  services 
}: NewReservationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [showAll, setShowAll] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Filtrer les nouvelles réservations (créées dans les dernières 48h et en statut pending)
  const newReservations = reservations
    .filter(r => {
      const createdDate = new Date(r.createdAt);
      const hoursSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation <= 48 && r.status === 'pending';
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayedReservations = showAll ? newReservations : newReservations.slice(0, 10);
  const hasMore = newReservations.length > 10;

  const getServiceNames = (reservation: Reservation) => {
    const serviceNames: string[] = [];
    
    if (Array.isArray(reservation.services)) {
      reservation.services.forEach(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          const packageType = reservation.packages?.[serviceId];
          let name = service.name;
          if (packageType === 'forfait') name += ' (Forfait)';
          else if (packageType === 'abonnement') name += ' (Abo)';
          serviceNames.push(name);
        }
      });
    }
    
    return serviceNames.join(', ') || 'Service inconnu';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getTimeAgo = (date: Date | string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours === 0) return "À l'instant";
    if (hours === 1) return "Il y a 1 heure";
    if (hours < 24) return `Il y a ${hours} heures`;
    if (hours < 48) return "Hier";
    return "Il y a 2 jours";
  };

  if (newReservations.length === 0) {
    return null;
  }

  return (
    <>
      {/* Panneau principal */}
      <div className="bg-gradient-to-r from-[#fdfbf7] to-[#f8f6f0] rounded-xl border border-[#d4b5a0]/30 shadow-xl">
        {/* Header avec compteur et contrôles */}
        <div className="p-4 border-b border-[#d4b5a0]/20 bg-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                {newReservations.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4b5a0] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                    {newReservations.length}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#2c3e50] font-medium">
                  Nouvelles Réservations
                </h3>
                <p className="text-sm text-[#2c3e50]/70">
                  {newReservations.length} {newReservations.length > 1 ? 'demandes' : 'demande'} en attente de validation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Switch vue compacte/détaillée */}
              <div className="flex bg-white rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-1 text-sm transition-colors ${
                    viewMode === 'compact' 
                      ? 'bg-blue-500 text-white rounded-l-lg' 
                      : 'text-gray-600 hover:bg-gray-50 rounded-l-lg'
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-1 text-sm transition-colors ${
                    viewMode === 'detailed' 
                      ? 'bg-blue-500 text-white rounded-r-lg' 
                      : 'text-gray-600 hover:bg-gray-50 rounded-r-lg'
                  }`}
                >
                  Détaillé
                </button>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des réservations */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {displayedReservations.map((reservation, index) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedReservation(reservation)}
              >
                {viewMode === 'compact' ? (
                  /* Vue compacte */
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {reservation.userName?.charAt(0).toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#2c3e50]">
                            {reservation.userName || 'Client'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(reservation.createdAt)}
                          </span>
                          {index === 0 && (
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(reservation.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reservation.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="w-3 h-3" />
                            {reservation.totalPrice}€
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reservation.notes && (
                        <div className="bg-yellow-100 p-1 rounded">
                          <MessageSquare className="w-3 h-3 text-yellow-600" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReservation(reservation);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Voir
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Vue détaillée */
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#2c3e50]">
                            {reservation.userName || 'Client'}
                          </h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {getTimeAgo(reservation.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          {reservation.userEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {reservation.userEmail}
                            </span>
                          )}
                          {reservation.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {reservation.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {reservation.totalPrice}€
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Date :</span>
                          <span className="font-medium">
                            {new Date(reservation.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Heure :</span>
                          <span className="font-medium">{reservation.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Services :</span>
                          <span className="font-medium text-right max-w-[200px]">
                            {getServiceNames(reservation)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-800">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {reservation.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReservation(reservation);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Voir les détails
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bouton voir plus */}
            {hasMore && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
              >
                <ArrowRight className="w-4 h-4" />
                Voir les {newReservations.length - 4} autres réservations
              </button>
            )}

            {showAll && hasMore && (
              <button
                onClick={() => setShowAll(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Voir moins
              </button>
            )}
          </div>
        )}

        {/* Mini vue quand c'est fermé */}
        {!isExpanded && (
          <div className="px-4 py-2 flex items-center gap-3 overflow-x-auto">
            {newReservations.slice(0, 5).map((reservation, index) => (
              <div
                key={reservation.id}
                onClick={() => setSelectedReservation(reservation)}
                className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors whitespace-nowrap"
              >
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs text-blue-600 font-bold">
                    {reservation.userName?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {reservation.userName?.split(' ')[0] || 'Client'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(reservation.date)} {reservation.time}
                </span>
              </div>
            ))}
            {newReservations.length > 5 && (
              <span className="text-sm text-gray-500 px-2">
                +{newReservations.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#2c3e50]">
                Détails de la réservation
              </h2>
              <button 
                onClick={() => setSelectedReservation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-[#2c3e50] mb-2">Client</h3>
                <div className="space-y-1">
                  <p className="text-sm"><strong>Nom :</strong> {selectedReservation.userName || 'Non spécifié'}</p>
                  <p className="text-sm"><strong>Email :</strong> {selectedReservation.userEmail || 'Non spécifié'}</p>
                  <p className="text-sm"><strong>Téléphone :</strong> {selectedReservation.phone || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-[#2c3e50] mb-2">Rendez-vous</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <strong>Date :</strong> {new Date(selectedReservation.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm"><strong>Heure :</strong> {selectedReservation.time}</p>
                  <p className="text-sm"><strong>Services :</strong> {getServiceNames(selectedReservation)}</p>
                  <p className="text-sm"><strong>Prix total :</strong> {selectedReservation.totalPrice}€</p>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-[#2c3e50] mb-2">Notes</h3>
                  <p className="text-sm">{selectedReservation.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-[#d4b5a0]/20">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Confirmer directement la réservation
                      if (onReservationClick) {
                        // On passe un flag pour indiquer qu'on veut juste confirmer
                        const confirmReservation = { ...selectedReservation, actionType: 'confirm' };
                        onReservationClick(confirmReservation as any);
                        setSelectedReservation(null);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white font-medium rounded-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accepter
                  </button>
                  <button
                    onClick={() => {
                      // Ouvrir le modal de modification
                      if (onReservationClick) {
                        onReservationClick(selectedReservation);
                        setSelectedReservation(null);
                      }
                    }}
                    className="px-4 py-2.5 border-2 border-[#d4b5a0] text-[#d4b5a0] font-medium rounded-lg hover:bg-[#d4b5a0]/10 transition-all"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      // Annuler la réservation
                      if (onReservationClick) {
                        const cancelReservation = { ...selectedReservation, actionType: 'cancel' };
                        onReservationClick(cancelReservation as any);
                        setSelectedReservation(null);
                      }
                    }}
                    className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}