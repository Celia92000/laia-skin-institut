"use client";

import { Calendar, Gift, Star, Heart, TrendingUp, Award, Clock, ChevronRight, Sparkles } from 'lucide-react';

interface ClientDashboardProps {
  userData: {
    name: string;
    totalSpent: number;
    nextAppointment?: any;
    lastVisit?: string;
  };
  reservations: any[];
  stats?: {
    totalVisits: number;
    favoriteService?: string;
    memberSince?: string;
  };
}

export default function ClientDashboard({ userData, reservations, stats }: ClientDashboardProps) {
  const upcomingReservations = reservations.filter(r => 
    (r.status === 'confirmed' || r.status === 'pending') && 
    new Date(r.date) > new Date()
  );
  const completedReservations = reservations.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6 p-6">
      {/* Message de bienvenue personnalisé */}
      <div className="bg-gradient-to-r from-laia-nude to-laia-rose-light rounded-3xl p-8 shadow-laia-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-laia-dark mb-2">
            Bonjour {userData.name} ! 
          </h2>
          <p className="text-laia-gray mb-6">
            Ravie de vous revoir dans votre espace beauté personnalisé
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-laia-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-laia-primary" />
                </div>
                <div>
                  <p className="text-xs text-laia-gray">Prochain RDV</p>
                  <p className="font-bold text-laia-dark">
                    {upcomingReservations[0] ? 
                      new Date(upcomingReservations[0].date).toLocaleDateString('fr-FR') : 
                      'Aucun prévu'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-laia-rose/10 rounded-lg">
                  <Heart className="h-5 w-5 text-laia-rose" />
                </div>
                <div>
                  <p className="text-xs text-laia-gray">Nombre de séances effectuées</p>
                  <p className="font-bold text-laia-dark">{completedReservations.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vos avantages exclusifs */}
      <div className="bg-white rounded-3xl shadow-laia-lg p-6 border border-laia-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-laia-dark flex items-center space-x-2">
            <Gift className="h-6 w-6 text-laia-primary" />
            <span>Vos Avantages Exclusifs</span>
          </h3>
        </div>

        {/* Avantages clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-laia-nude/30 rounded-xl p-4">
            <Award className="h-8 w-8 text-laia-primary mb-3" />
            <h4 className="font-medium text-laia-dark mb-1">Réduction anniversaire</h4>
            <p className="text-sm text-laia-gray">-20% sur votre soin préféré le mois de votre anniversaire</p>
          </div>
          <div className="bg-laia-rose-light/30 rounded-xl p-4">
            <Star className="h-8 w-8 text-laia-rose mb-3" />
            <h4 className="font-medium text-laia-dark mb-1">Soins exclusifs</h4>
            <p className="text-sm text-laia-gray">Accès prioritaire aux nouveaux soins et produits</p>
          </div>
          <div className="bg-laia-beige/30 rounded-xl p-4">
            <Heart className="h-8 w-8 text-laia-primary mb-3" />
            <h4 className="font-medium text-laia-dark mb-1">Conseils personnalisés</h4>
            <p className="text-sm text-laia-gray">Diagnostic beauté gratuit et suivi personnalisé</p>
          </div>
          <div className="bg-laia-cream/30 rounded-xl p-4">
            <TrendingUp className="h-8 w-8 text-laia-rose mb-3" />
            <h4 className="font-medium text-laia-dark mb-1">Offres spéciales</h4>
            <p className="text-sm text-laia-gray">Promotions exclusives réservées à nos clientes fidèles</p>
          </div>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      {upcomingReservations.length > 0 && (
        <div className="bg-white rounded-3xl shadow-laia-lg p-6 border border-laia-primary/10">
          <h3 className="text-xl font-bold text-laia-dark mb-4 flex items-center space-x-2">
            <Clock className="h-6 w-6 text-laia-primary" />
            <span>Vos prochains rendez-vous</span>
          </h3>
          
          <div className="space-y-3">
            {upcomingReservations.slice(0, 3).map((reservation, index) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-laia-cream rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-laia-primary to-laia-rose flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-laia-dark">
                      {reservation.services.join(', ')}
                      {reservation.status === 'pending' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                          En attente
                        </span>
                      )}
                      {reservation.status === 'confirmed' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          Confirmé
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-laia-gray">
                      {new Date(reservation.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })} à {reservation.time}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-laia-gray" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-laia-primary to-laia-rose p-6 text-white shadow-laia-lg hover:shadow-laia-xl transition-all">
          <div className="relative z-10">
            <Calendar className="h-8 w-8 mb-3" />
            <h4 className="text-lg font-bold mb-1">Réserver un soin</h4>
            <p className="text-sm opacity-90">Découvrez nos disponibilités</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
        
        <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-laia-nude to-laia-beige p-6 text-laia-dark shadow-laia-lg hover:shadow-laia-xl transition-all">
          <div className="relative z-10">
            <Gift className="h-8 w-8 mb-3" />
            <h4 className="text-lg font-bold mb-1">Offrir un soin</h4>
            <p className="text-sm text-laia-gray">Cartes cadeaux disponibles</p>
          </div>
          <div className="absolute inset-0 bg-laia-primary opacity-0 group-hover:opacity-5 transition-opacity" />
        </button>
      </div>
    </div>
  );
}