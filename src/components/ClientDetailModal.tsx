'use client';

import { useState } from 'react';
import {
  X, User, Phone, Mail, Calendar, Gift, Star, TrendingUp, CreditCard,
  CheckCircle, Clock, XCircle, AlertCircle, Cake, Heart, FileText, Users,
  ChevronRight, Euro, Package, Award, Camera, MessageCircle
} from 'lucide-react';
import ClientEvolutionPhotos from './ClientEvolutionPhotos';
import ClientCommunications from './ClientCommunications';
import { formatDateLocal } from '@/lib/date-utils';

interface ClientDetailModalProps {
  client: any;
  reservations: any[];
  loyaltyProfile: any;
  onClose: () => void;
  onEdit: (clientId: string, data: any) => void;
}

export default function ClientDetailModal({ 
  client, 
  reservations, 
  loyaltyProfile, 
  onClose, 
  onEdit 
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'reservations' | 'loyalty' | 'stats' | 'photos' | 'communications'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(client);

  // Filtrer les réservations du client
  const clientReservations = reservations.filter(r => 
    r.userEmail === client.email || r.userId === client.id
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculer les statistiques
  const stats = {
    totalReservations: clientReservations.length,
    completedReservations: clientReservations.filter(r => r.status === 'completed').length,
    cancelledReservations: clientReservations.filter(r => r.status === 'cancelled').length,
    noShowReservations: clientReservations.filter(r => r.status === 'no_show').length,
    totalSpent: clientReservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0),
    averageSpent: clientReservations.length > 0 
      ? (clientReservations
          .filter(r => r.paymentStatus === 'paid')
          .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0) / 
          clientReservations.filter(r => r.paymentStatus === 'paid').length) || 0
      : 0,
    lastVisit: clientReservations
      .filter(r => r.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date,
    nextReservation: clientReservations
      .filter(r => r.status === 'confirmed' && new Date(r.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  };

  // Calculer le niveau de fidélité
  const loyaltyLevel = () => {
    const total = (loyaltyProfile?.individualServicesCount || 0) + (loyaltyProfile?.packagesCount || 0) * 3;
    if (total >= 20) return { name: 'VIP', color: 'bg-purple-100 text-purple-800', icon: '⭐' };
    if (total >= 10) return { name: 'Premium', color: 'bg-blue-100 text-blue-800', icon: '💎' };
    if (total >= 5) return { name: 'Fidèle', color: 'bg-green-100 text-green-800', icon: '❤️' };
    return { name: 'Nouveau', color: 'bg-gray-100 text-gray-600', icon: '👋' };
  };

  const level = loyaltyLevel();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">En attente</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Confirmé</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Terminé</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Annulé</span>;
      case 'no_show':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Absent</span>;
      default:
        return null;
    }
  };

  const saveChanges = () => {
    onEdit(client.id, editedData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{client.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {client.phone}
                  </span>
                )}
                {client.birthDate && (
                  <span className="flex items-center gap-1">
                    <Cake className="w-4 h-4" /> 
                    {new Date(client.birthDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
              {level.icon} {level.name}
            </span>
            {loyaltyProfile?.individualServicesCount === 5 && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium animate-pulse">
                -20€ disponible (6ème soin)
              </span>
            )}
            {loyaltyProfile?.packagesCount === 3 && (
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium animate-pulse">
                -40€ disponible (4ème forfait)
              </span>
            )}
            {loyaltyProfile?.totalReferrals > 0 && (
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                {loyaltyProfile.totalReferrals} parrainage{loyaltyProfile.totalReferrals > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'info', label: 'Fiche beauté', icon: User },
              { id: 'communications', label: 'Communications', icon: MessageCircle },
              { id: 'photos', label: 'Photos', icon: Camera },
              { id: 'reservations', label: 'Réservations', icon: Calendar },
              { id: 'loyalty', label: 'Fidélité', icon: Gift },
              { id: 'stats', label: 'Statistiques', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-[#d4b5a0] border-b-2 border-[#d4b5a0]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Réservations Tab */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-4">
                Historique des réservations ({clientReservations.length})
              </h3>

              {stats.nextReservation && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">Prochain rendez-vous</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2c3e50]">
                        {new Date(stats.nextReservation.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-[#2c3e50]/60">
                        à {stats.nextReservation.time} - {stats.nextReservation.services?.join(', ')}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{stats.nextReservation.totalPrice}€</span>
                  </div>
                </div>
              )}

              {clientReservations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune réservation pour ce client</p>
              ) : (
                <div className="space-y-3">
                  {clientReservations.map(reservation => (
                    <div key={reservation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(reservation.status)}
                            {reservation.paymentStatus === 'paid' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Payé
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-[#2c3e50]">
                            {new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}
                          </p>
                          <p className="text-sm text-[#2c3e50]/60">
                            {typeof reservation.services === 'string' 
                              ? JSON.parse(reservation.services).join(', ')
                              : reservation.services?.join(', ')}
                          </p>
                          {/* Affichage des forfaits et abonnements */}
                          {reservation.packages && (() => {
                            const packages = typeof reservation.packages === 'string' 
                              ? JSON.parse(reservation.packages) 
                              : reservation.packages;
                            const forfaits = Object.entries(packages).filter(([_, type]) => type === 'forfait');
                            const abonnements = Object.entries(packages).filter(([_, type]) => type === 'abonnement');
                            
                            return (
                              <div className="mt-2 space-y-1">
                                {forfaits.length > 0 && forfaits.map(([serviceId, _]) => {
                                  // Compter les séances utilisées pour ce forfait
                                  const sessionsUsed = clientReservations.filter(r => {
                                    const rPackages = typeof r.packages === 'string' ? JSON.parse(r.packages) : r.packages;
                                    return rPackages?.[serviceId] === 'forfait' && 
                                           r.status === 'completed' &&
                                           new Date(r.date) <= new Date(reservation.date);
                                  }).length;
                                  
                                  return (
                                    <div key={serviceId} className="inline-flex items-center gap-2 px-2 py-1 bg-purple-50 rounded-lg">
                                      <Package className="w-3 h-3 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-700">
                                        Forfait 4 séances - Séance {Math.min(sessionsUsed, 4)}/4
                                      </span>
                                      <div className="flex gap-0.5">
                                        {[1,2,3,4].map(i => (
                                          <div key={i} className={`w-2 h-2 rounded-full ${
                                            i <= sessionsUsed ? 'bg-purple-600' : 'bg-purple-200'
                                          }`} />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                                {/* Formule Liberté temporairement désactivée */}
                                {false && abonnements.length > 0 && (
                                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg">
                                    <CreditCard className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-medium text-blue-700">
                                      Formule Liberté
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#d4b5a0]">{reservation.totalPrice}€</p>
                          {reservation.paymentAmount && reservation.paymentAmount !== reservation.totalPrice && (
                            <p className="text-sm text-gray-600">Payé: {reservation.paymentAmount}€</p>
                          )}
                        </div>
                      </div>
                      {reservation.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">Note: {reservation.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="h-[500px]">
              <ClientCommunications
                clientId={client.id}
                clientEmail={client.email}
                clientPhone={client.phone}
                clientName={client.name}
              />
            </div>
          )}

          {/* Fidélité Tab */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-4">Programme de fidélité</h3>

              {/* Cartes visuelles */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Carte soins */}
                <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Soins individuels</h4>
                    <Gift className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold ${
                          num <= (loyaltyProfile?.individualServicesCount % 6 || 0)
                            ? 'bg-white text-[#d4b5a0]'
                            : 'bg-white/30 text-white'
                        }`}
                      >
                        {num <= (loyaltyProfile?.individualServicesCount % 6 || 0) ? '✓' : num}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Total: {loyaltyProfile?.individualServicesCount || 0} soins</p>
                    <p className="font-bold">
                      {loyaltyProfile?.individualServicesCount === 5 
                        ? '🎉 -20€ sur votre prochain soin !'
                        : `${6 - (loyaltyProfile?.individualServicesCount % 6 || 0)} soins avant -20€`}
                    </p>
                  </div>
                </div>

                {/* Carte forfaits */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Forfaits (4 séances chacun)</h4>
                    <Star className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1, 2, 3].map(num => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center text-lg font-bold ${
                          num <= (loyaltyProfile?.packagesCount % 3 || 0)
                            ? 'bg-white text-purple-600'
                            : 'bg-white/30 text-white'
                        }`}
                      >
                        {num <= (loyaltyProfile?.packagesCount % 3 || 0) ? '✓' : num}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Total: {loyaltyProfile?.packagesCount || 0} forfait{(loyaltyProfile?.packagesCount || 0) > 1 ? 's' : ''} complété{(loyaltyProfile?.packagesCount || 0) > 1 ? 's' : ''}</p>
                    {(() => {
                      const packagesCount = loyaltyProfile?.packagesCount || 0;
                      const seancesRealisees = packagesCount * 4;
                      const positionCycle = packagesCount % 3;
                      
                      if (packagesCount === 0) {
                        return (
                          <>
                            <p className="text-white/90">0/8 séances pour la réduction</p>
                            <p className="font-bold text-yellow-300">
                              → 9 séances avant -40€
                            </p>
                          </>
                        );
                      } else if (packagesCount === 1) {
                        return (
                          <>
                            <p className="text-white/90">4/8 séances réalisées</p>
                            <p className="font-bold text-yellow-300">
                              → 5 séances avant -40€
                            </p>
                          </>
                        );
                      } else if (packagesCount === 2) {
                        return (
                          <>
                            <p className="text-white font-bold">✅ 8/8 séances réalisées!</p>
                            <p className="font-bold text-yellow-300 animate-pulse">
                              🎉 Prochaine séance (9ème) = -40€ !
                            </p>
                          </>
                        );
                      } else if (packagesCount >= 3) {
                        const forfaitsDansCycle = positionCycle;
                        const seancesDansCycle = forfaitsDansCycle * 4;
                        
                        if (forfaitsDansCycle === 0) {
                          return (
                            <>
                              <p className="text-white/90">Nouveau cycle: 0/8</p>
                              <p className="font-bold text-yellow-300">
                                → 9 séances avant -40€
                              </p>
                            </>
                          );
                        } else if (forfaitsDansCycle === 1) {
                          return (
                            <>
                              <p className="text-white/90">Nouveau cycle: 4/8</p>
                              <p className="font-bold text-yellow-300">
                                → 5 séances avant -40€
                              </p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <p className="text-white font-bold">✅ 8/8 séances!</p>
                              <p className="font-bold text-yellow-300 animate-pulse">
                                🎉 Prochaine séance = -40€ !
                              </p>
                            </>
                          );
                        }
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Parrainage */}
              {loyaltyProfile?.referralCode && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#2c3e50]">Programme de parrainage</h4>
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Code de parrainage</p>
                      <p className="font-mono font-bold text-lg text-[#2c3e50]">{loyaltyProfile.referralCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Parrainages effectués</p>
                      <p className="text-2xl font-bold text-green-600">{loyaltyProfile.totalReferrals || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gains disponibles</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(loyaltyProfile.totalReferrals || 0) * 20}€
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique fidélité */}
              <div>
                <h4 className="font-semibold text-[#2c3e50] mb-3">Progression détaillée</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total dépensé</p>
                      <p className="text-xl font-bold text-[#2c3e50]">{loyaltyProfile?.totalSpent || 0}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dernière visite</p>
                      <p className="text-sm font-medium text-[#2c3e50]">
                        {loyaltyProfile?.lastVisit 
                          ? new Date(loyaltyProfile.lastVisit).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-4">Statistiques client</h3>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Total RDV</p>
                  <p className="text-2xl font-bold text-[#2c3e50]">{stats.totalReservations}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1">Complétés</p>
                  <p className="text-2xl font-bold text-[#2c3e50]">{stats.completedReservations}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-orange-600 mb-1">Absences</p>
                  <p className="text-2xl font-bold text-[#2c3e50]">{stats.noShowReservations}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-red-600 mb-1">Annulés</p>
                  <p className="text-2xl font-bold text-[#2c3e50]">{stats.cancelledReservations}</p>
                </div>
              </div>

              {/* Financier */}
              <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6">
                <h4 className="font-semibold text-[#2c3e50] mb-4">Performance financière</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total dépensé</p>
                    <p className="text-3xl font-bold text-[#d4b5a0]">{stats.totalSpent.toFixed(0)}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Panier moyen</p>
                    <p className="text-3xl font-bold text-[#2c3e50]">{stats.averageSpent.toFixed(0)}€</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-[#2c3e50] mb-3">Activité récente</h4>
                <div className="space-y-2">
                  {clientReservations.slice(0, 5).map((reservation, index) => (
                    <div key={reservation.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <div className={`w-2 h-2 rounded-full ${
                        reservation.status === 'completed' ? 'bg-green-500' :
                        reservation.status === 'cancelled' ? 'bg-red-500' :
                        reservation.status === 'no_show' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-[#2c3e50]">
                          {new Date(reservation.date).toLocaleDateString('fr-FR')} - {reservation.services?.join(', ')}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#d4b5a0]">{reservation.totalPrice}€</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Informations Tab - Version Esthétique */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#2c3e50]">Fiche beauté & bien-être</h3>
                <button
                  onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
                  className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors"
                >
                  {isEditing ? '💾 Sauvegarder' : '✏️ Modifier'}
                </button>
              </div>

              {/* Section Contact */}
              <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-[#d4b5a0] mb-4 uppercase tracking-wider">Coordonnées</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2c3e50]/70 mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] disabled:bg-white/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#2c3e50]/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] disabled:bg-white/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#2c3e50]/70 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={editedData.phone || ''}
                      onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] disabled:bg-white/50"
                      placeholder="06 XX XX XX XX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#2c3e50]/70 mb-1">Date de naissance</label>
                    <input
                      type="date"
                      value={editedData.birthDate ? formatDateLocal(new Date(editedData.birthDate)) : ''}
                      onChange={(e) => setEditedData({...editedData, birthDate: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] disabled:bg-white/50"
                    />
                  </div>
                </div>
              </div>

              {/* Section Diagnostic Peau */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-rose-600 mb-4 uppercase tracking-wider">💆‍♀️ Diagnostic Peau</h4>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Type de peau</label>
                  <select
                    value={editedData.skinType || ''}
                    onChange={(e) => setEditedData({...editedData, skinType: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-400 disabled:bg-white/50"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="normale">Normale</option>
                    <option value="seche">Sèche</option>
                    <option value="grasse">Grasse</option>
                    <option value="mixte">Mixte</option>
                    <option value="sensible">Sensible</option>
                    <option value="mature">Mature</option>
                    <option value="acneique">Acnéique</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Préoccupations beauté</label>
                  <textarea
                    value={editedData.beautyGoals || ''}
                    onChange={(e) => setEditedData({...editedData, beautyGoals: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-400 disabled:bg-white/50"
                    rows={2}
                    placeholder="Ex: Anti-âge, éclat du teint, hydratation, acné..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Routine de soins actuelle</label>
                  <textarea
                    value={editedData.currentRoutine || ''}
                    onChange={(e) => setEditedData({...editedData, currentRoutine: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-400 disabled:bg-white/50"
                    rows={2}
                    placeholder="Produits utilisés, fréquence des soins..."
                  />
                </div>
              </div>

              {/* Section Sensibilités & Allergies */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-amber-600 mb-4 uppercase tracking-wider">⚠️ Sensibilités & Contre-indications</h4>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Allergies connues</label>
                  <textarea
                    value={editedData.allergies || ''}
                    onChange={(e) => setEditedData({...editedData, allergies: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 disabled:bg-white/50"
                    rows={2}
                    placeholder="Produits cosmétiques, actifs, parfums..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Traitements en cours</label>
                  <textarea
                    value={editedData.medicalNotes || ''}
                    onChange={(e) => setEditedData({...editedData, medicalNotes: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 disabled:bg-white/50"
                    rows={2}
                    placeholder="Médicaments, traitements dermatologiques, grossesse..."
                  />
                </div>
              </div>

              {/* Section Préférences */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wider">✨ Préférences & Habitudes</h4>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Soins préférés</label>
                  <textarea
                    value={editedData.favoriteServices || ''}
                    onChange={(e) => setEditedData({...editedData, favoriteServices: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 disabled:bg-white/50"
                    rows={2}
                    placeholder="Types de soins appréciés, techniques préférées..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Notes personnelles</label>
                  <textarea
                    value={editedData.preferences || ''}
                    onChange={(e) => setEditedData({...editedData, preferences: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 disabled:bg-white/50"
                    rows={2}
                    placeholder="Horaires préférés, ambiance souhaitée, remarques..."
                  />
                </div>
              </div>

              {/* Section Historique Beauté */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-teal-600 mb-4 uppercase tracking-wider">📝 Historique & Évolution</h4>
                
                <div>
                  <label className="block text-xs font-medium text-[#2c3e50]/70 mb-2">Évolution & Résultats</label>
                  <textarea
                    value={editedData.progressNotes || ''}
                    onChange={(e) => setEditedData({...editedData, progressNotes: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 disabled:bg-white/50"
                    rows={3}
                    placeholder="Améliorations constatées, réactions aux soins, objectifs atteints..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <ClientEvolutionPhotos
              clientId={client.id}
              evolutions={client.evolutions || []}
              onAddEvolution={async (data) => {
                // Appeler l'API pour ajouter une évolution
                const response = await fetch('/api/client-evolutions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    userId: client.id,
                    ...data
                  })
                });
                
                if (response.ok) {
                  // Recharger les données
                  window.location.reload();
                }
              }}
              onDeleteEvolution={async (id) => {
                // Appeler l'API pour supprimer une évolution
                const response = await fetch(`/api/client-evolutions/${id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                
                if (response.ok) {
                  // Recharger les données
                  window.location.reload();
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}