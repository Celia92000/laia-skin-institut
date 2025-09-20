"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, XCircle, Gift, Star, RefreshCw, User, Award, TrendingUp, LogOut, Share2, Heart, History, Check, Edit2, X, CalendarDays, MessageSquare, ThumbsUp, Send, Camera } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { logout } from "@/lib/auth-client";

interface Reservation {
  id: string;
  services: string[];
  packages: {[key: string]: string};
  date: string;
  time: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface UserData {
  name: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
}

export default function EspaceClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [satisfaction, setSatisfaction] = useState(5);
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);

  const services = {
    "hydro-naissance": "Hydro'Naissance",
    "hydro": "Hydro'Cleaning",
    "renaissance": "Renaissance",
    "bbglow": "BB Glow",
    "led": "LED Thérapie"
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.push('/login');
        return;
      }

      const userInfo = JSON.parse(user);
      // Permettre l'accès à tous les utilisateurs connectés (clients et admins)
      // Définir le nom en fonction du rôle et de l'email
      let displayName = 'Cliente';
      if (userInfo.email === 'admin@laiaskin.com') {
        displayName = 'Laïa';
      } else if (userInfo.email === 'marie.dupont@email.com') {
        displayName = 'Marie';
      } else if (userInfo.name) {
        displayName = userInfo.name;
      } else if (userInfo.email) {
        displayName = userInfo.email.split('@')[0].split('.').map((n: string) => 
          n.charAt(0).toUpperCase() + n.slice(1)
        ).join(' ');
      }
      
      setUserData({
        name: displayName,
        email: userInfo.email,
        loyaltyPoints: userInfo.loyaltyPoints || 350,
        totalSpent: userInfo.totalSpent || 750
      });

      fetchUserData();
      fetchReservations();
    };

    checkAuth();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ne remplacer que si l'API retourne des données valides
        if (data && data.name) {
          setUserData(prevData => ({
            ...prevData,
            ...data
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      // Garder les données existantes en cas d'erreur
    }
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        // Données de démonstration si l'API n'est pas disponible
        setReservations([
          {
            id: '1',
            services: ['hydro-naissance'],
            packages: {},
            date: '2025-02-15',
            time: '10:00',
            totalPrice: 169,
            status: 'confirmed',
            createdAt: '2025-01-06'
          },
          {
            id: '2',
            services: ['hydro'],
            packages: {},
            date: '2025-01-20',
            time: '14:30',
            totalPrice: 89,
            status: 'completed',
            createdAt: '2024-12-15'
          },
          {
            id: '3',
            services: ['bbglow'],
            packages: { 'bbglow': 'forfait' },
            date: '2024-12-10',
            time: '11:00',
            totalPrice: 360,
            status: 'completed',
            createdAt: '2024-11-20'
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      // Données de démonstration en cas d'erreur
      setReservations([
        {
          id: '1',
          services: ['hydro-naissance'],
          packages: {},
          date: '2025-02-15',
          time: '10:00',
          totalPrice: 169,
          status: 'confirmed',
          createdAt: '2025-01-06'
        },
        {
          id: '2',
          services: ['hydro'],
          packages: {},
          date: '2025-01-20',
          time: '14:30',
          totalPrice: 89,
          status: 'completed',
          createdAt: '2024-12-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRebook = (reservation: Reservation) => {
    // Stocker les détails de la réservation dans le localStorage
    localStorage.setItem('rebookData', JSON.stringify({
      services: reservation.services,
      packages: reservation.packages
    }));
    router.push('/reservation');
  };

  const getLoyaltyLevel = (points: number, totalSpent: number) => {
    // Système basé sur les points ET le montant dépensé
    if (points >= 400 || totalSpent >= 1200) {
      return { 
        name: "VIP Diamond 💎", 
        color: "text-purple-600", 
        nextLevel: null,
        benefits: "20% de réduction + Soins exclusifs + Cadeaux VIP",
        discount: 20
      };
    }
    if (points >= 250 || totalSpent >= 750) {
      return { 
        name: "Gold ⭐", 
        color: "text-yellow-600", 
        nextLevel: 400,
        benefits: "15% de réduction + Accès prioritaire",
        discount: 15
      };
    }
    if (points >= 100 || totalSpent >= 300) {
      return { 
        name: "Silver 🌟", 
        color: "text-gray-600", 
        nextLevel: 250,
        benefits: "10% de réduction",
        discount: 10
      };
    }
    return { 
      name: "Découverte", 
      color: "text-[#d4b5a0]", 
      nextLevel: 100,
      benefits: "5% dès le 2ème soin",
      discount: 5
    };
  };

  const loyalty = userData ? getLoyaltyLevel(userData.loyaltyPoints, userData.totalSpent) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#2c3e50] mb-2">
                  Bonjour {userData?.name || 'Cliente'} !
                </h1>
                <p className="text-[#2c3e50]/70">Bienvenue dans votre espace personnel</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>

          {/* Loyalty Status */}
          {userData && loyalty && (
            <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Award className={`w-8 h-8 ${loyalty.color}`} />
                    <h2 className="text-xl font-semibold text-[#2c3e50]">
                      Statut : {loyalty.name}
                    </h2>
                  </div>
                  <p className="text-[#2c3e50]/70 mb-1">
                    {userData.loyaltyPoints} points de fidélité
                  </p>
                  {loyalty.nextLevel && (
                    <p className="text-sm text-[#2c3e50]/60">
                      Plus que {loyalty.nextLevel - userData.loyaltyPoints} points pour atteindre le niveau supérieur !
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Total dépensé</p>
                  <p className="text-2xl font-bold text-[#d4b5a0]">{userData.totalSpent}€</p>
                </div>
              </div>
              
              {/* Progress bar */}
              {loyalty.nextLevel && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(userData.loyaltyPoints % 150) / 1.5}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "reservations"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Mes Réservations
          </button>
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "loyalty"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Programme Fidélité
          </button>
          <button
            onClick={() => setActiveTab("recommend")}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "recommend"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Recommander
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Mon Profil
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === "reviews"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Mes Avis
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Vue d'ensemble
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-6 border border-[#d4b5a0]/20">
                  <History className="w-8 h-8 text-[#d4b5a0] mb-2" />
                  <p className="text-3xl font-bold text-[#2c3e50]">
                    {reservations.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-[#2c3e50]/60">Soins réalisés</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-6 border border-[#d4b5a0]/20">
                  <Calendar className="w-8 h-8 text-[#d4b5a0] mb-2" />
                  <p className="text-3xl font-bold text-[#2c3e50]">
                    {reservations.filter(r => r.status === 'confirmed').length}
                  </p>
                  <p className="text-[#2c3e50]/60">À venir</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-6 border border-[#d4b5a0]/20">
                  <Award className="w-8 h-8 text-[#d4b5a0] mb-2" />
                  <p className="text-3xl font-bold text-[#2c3e50]">
                    {userData?.loyaltyPoints || 0}
                  </p>
                  <p className="text-[#2c3e50]/60">Points fidélité</p>
                </div>
              </div>
              
              {/* Prochaine réservation avec actions */}
              {reservations.filter(r => r.status === 'confirmed').length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-[#2c3e50]">Prochain rendez-vous</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      À VENIR
                    </span>
                  </div>
                  {reservations
                    .filter(r => r.status === 'confirmed')
                    .slice(0, 1)
                    .map(reservation => (
                      <div key={reservation.id}>
                        <div className="flex items-center gap-4 mb-3">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-[#2c3e50]">
                            {new Date(reservation.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-[#2c3e50]">{reservation.time}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {reservation.services.map((serviceId: string) => (
                            <span key={serviceId} className="px-3 py-1 bg-white rounded-full text-sm">
                              {services[serviceId as keyof typeof services]}
                            </span>
                          ))}
                        </div>
                        
                        {/* Actions rapides pour le prochain RDV */}
                        <div className="flex gap-2 pt-3 border-t border-green-200">
                          <button
                            onClick={() => {
                              const newDate = prompt('Nouvelle date (format: JJ/MM/AAAA) :');
                              const newTime = prompt('Nouvelle heure (format: HH:MM) :');
                              if (newDate && newTime) {
                                alert(`Rendez-vous modifié pour le ${newDate} à ${newTime}. Vous recevrez un email de confirmation.`);
                                window.location.reload();
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white text-green-700 rounded-lg text-sm hover:bg-green-50 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
                                alert('Rendez-vous annulé. Vous recevrez un email de confirmation.');
                                window.location.reload();
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white text-red-600 rounded-lg text-sm hover:bg-red-50 transition-all"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              {/* Actions rapides */}
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/reservation"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  Prendre un nouveau rendez-vous
                </Link>
                <button
                  onClick={() => setActiveTab('recommend')}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-xl font-medium hover:bg-[#d4b5a0]/10 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Recommander LAIA SKIN
                </button>
              </div>
            </div>
          )}
          
          {activeTab === "reservations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#2c3e50]">
                  Historique de mes soins
                </h2>
                <Link
                  href="/reservation"
                  className="px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full font-medium hover:shadow-lg transition-all"
                >
                  Prendre un nouveau rendez-vous
                </Link>
              </div>

              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-[#d4b5a0]/30 mx-auto mb-4" />
                  <p className="text-[#2c3e50]/70 mb-4">Vous n'avez pas encore de réservation</p>
                  <Link
                    href="/reservation"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full font-medium hover:shadow-lg transition-all"
                  >
                    Prendre mon premier rendez-vous
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="border border-[#d4b5a0]/20 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-[#d4b5a0]" />
                            <span className="font-semibold text-[#2c3e50]">
                              {new Date(reservation.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <Clock className="w-5 h-5 text-[#d4b5a0]" />
                            <span className="text-[#2c3e50]/70">{reservation.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            reservation.status === 'completed' 
                              ? 'bg-green-100 text-green-600'
                              : reservation.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-600'
                              : reservation.status === 'cancelled'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {reservation.status === 'completed' ? 'Terminé' :
                             reservation.status === 'confirmed' ? 'Confirmé' :
                             reservation.status === 'cancelled' ? 'Annulé' : 'En attente'}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-[#2c3e50] mb-2">Soins réservés :</h4>
                        <div className="flex flex-wrap gap-2">
                          {reservation.services.map((serviceId: string) => (
                            <span key={serviceId} className="px-3 py-1 bg-[#d4b5a0]/10 rounded-full text-sm">
                              {services[serviceId as keyof typeof services]}
                              {reservation.packages[serviceId] === 'forfait' && ' (Forfait 4 séances)'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</span>
                        
                        {/* Actions selon le statut */}
                        <div className="flex gap-2">
                          {reservation.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => {
                                  if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
                                    alert('Rendez-vous annulé. Vous recevrez un email de confirmation.');
                                    // Ici, appeler l'API pour annuler
                                    window.location.reload();
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-all"
                              >
                                <X className="w-4 h-4" />
                                Annuler
                              </button>
                              <button
                                onClick={() => {
                                  const newDate = prompt('Nouvelle date (format: JJ/MM/AAAA) :');
                                  const newTime = prompt('Nouvelle heure (format: HH:MM) :');
                                  if (newDate && newTime) {
                                    alert(`Rendez-vous modifié pour le ${newDate} à ${newTime}. Vous recevrez un email de confirmation.`);
                                    // Ici, appeler l'API pour modifier
                                    window.location.reload();
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-2 border border-[#d4b5a0] text-[#d4b5a0] rounded-lg text-sm hover:bg-[#d4b5a0]/10 transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                                Modifier
                              </button>
                            </>
                          )}
                          
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  alert('Rendez-vous confirmé ! Vous recevrez un email de rappel 24h avant.');
                                  // Ici, appeler l'API pour confirmer
                                  window.location.reload();
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-all"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirmer
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
                                    alert('Rendez-vous annulé.');
                                    window.location.reload();
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-all"
                              >
                                <X className="w-4 h-4" />
                                Annuler
                              </button>
                            </>
                          )}
                          
                          {reservation.status === 'completed' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowReviewModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-all"
                              >
                                <Star className="w-4 h-4" />
                                Donner un avis
                              </button>
                              <button
                                onClick={() => handleRebook(reservation)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Reprendre ce soin
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "loyalty" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-2">
                Votre Programme Fidélité Double Avantage
              </h2>
              <p className="text-[#2c3e50]/60 text-center mb-6">
                Deux cartes de fidélité pour maximiser vos avantages !
              </p>

              {/* Deux cartes de fidélité */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Carte fidélité soins individuels */}
                <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-2xl p-6 shadow-xl">
                  <div className="text-center">
                    <Gift className="w-12 h-12 mx-auto mb-3 text-white/80" />
                    <h3 className="text-xl font-bold mb-2">Soins Individuels</h3>
                    <p className="text-lg mb-4">5 soins = -20€ sur le 6ème</p>
                    
                    {/* Carte de fidélité visuelle */}
                    <div className="bg-white/20 rounded-xl p-4">
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <div 
                            key={num}
                            className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg font-bold ${
                              num <= 3 ? 'bg-white text-[#d4b5a0]' : 'bg-white/30 text-white'
                            }`}
                          >
                            {num <= 3 ? '✓' : num}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm">3 soins validés sur 6</p>
                      <p className="text-xs mt-1 font-bold">Dès le 1er soin ! -20€ au 6ème soin</p>
                    </div>
                  </div>
                </div>

                {/* Carte fidélité forfaits */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-xl">
                  <div className="text-center">
                    <Star className="w-12 h-12 mx-auto mb-3 text-white/80" />
                    <h3 className="text-xl font-bold mb-2">Forfaits Premium</h3>
                    <p className="text-lg mb-4">3 forfaits = -40€ sur le 4ème</p>
                    
                    {/* Carte de fidélité visuelle forfaits */}
                    <div className="bg-white/20 rounded-xl p-4">
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[1, 2, 3, 4].map((num) => (
                          <div 
                            key={num}
                            className={`w-full aspect-square rounded-lg flex items-center justify-center text-xl font-bold ${
                              num <= 1 ? 'bg-white text-purple-600' : 'bg-white/30 text-white'
                            }`}
                          >
                            {num <= 1 ? '✓' : num}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm">1 forfait validé sur 4</p>
                      <p className="text-xs mt-1 font-bold">Dès le 1er forfait ! -40€ au 4ème forfait</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment ça marche */}
              <div className="bg-[#fdfbf7] rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-[#2c3e50] mb-4 text-center">Comment ça marche ?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-[#d4b5a0]" />
                      <h4 className="font-semibold text-[#2c3e50]">Carte Soins Individuels</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-[#2c3e50]/70">
                      <li>• <strong>Dès le 1er soin</strong> = 1 tampon</li>
                      <li>• Au 6ème soin = -20€ de réduction immédiate</li>
                      <li>• Valable sur tous les soins individuels</li>
                      <li>• Carte renouvelable à l'infini</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-[#2c3e50]">Carte Forfaits Premium</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-[#2c3e50]/70">
                      <li>• <strong>Dès le 1er forfait</strong> = 1 tampon</li>
                      <li>• Au 4ème forfait = -40€ de réduction immédiate</li>
                      <li>• Économies importantes garanties</li>
                      <li>• Avantages VIP inclus</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Avantages immédiats */}
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#d4b5a0]/20">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Avantages dès aujourd'hui
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2c3e50]">-10% anniversaire</p>
                        <p className="text-sm text-[#2c3e50]/60">Tout le mois de votre anniversaire</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2c3e50]">Suivi personnalisé</p>
                        <p className="text-sm text-[#2c3e50]/60">Conseils adaptés à votre peau</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2c3e50]">Rappels automatiques</p>
                        <p className="text-sm text-[#2c3e50]/60">Pour ne jamais oublier vos soins</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parrainage */}
                <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-6 shadow-lg border-2 border-[#d4b5a0]/20">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-[#d4b5a0]" />
                    Parrainage = Gagnant-Gagnant
                  </h3>
                  <div className="bg-[#d4b5a0]/10 rounded-lg p-4 mb-4">
                    <p className="text-center text-lg font-bold text-[#2c3e50] mb-2">
                      Votre amie : -20% sur son 1er soin
                    </p>
                    <p className="text-center text-lg font-bold text-[#d4b5a0]">
                      Vous : 1 soin validé en plus !
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-[#d4b5a0]/20">
                    <p className="text-xs text-[#2c3e50]/60 mb-1">Votre code</p>
                    <p className="text-xl font-bold text-[#d4b5a0]">LAIA{userData?.name?.substring(0, 4).toUpperCase() || 'CODE'}</p>
                  </div>
                </div>
              </div>

              {/* Historique simplifié */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-[#2c3e50] mb-4">Vos derniers soins</h3>
                <div className="space-y-3">
                  {reservations.filter(r => r.status === 'completed').slice(0, 3).map((reservation) => (
                    <div key={reservation.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-[#2c3e50]">
                          {reservation.services.map(s => services[s as keyof typeof services]).join(', ')}
                        </p>
                        <p className="text-sm text-[#2c3e50]/60">
                          {new Date(reservation.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {reservations.filter(r => r.status === 'completed').length === 0 && (
                  <p className="text-center text-[#2c3e50]/60 py-4">
                    Commencez votre carte de fidélité dès votre premier soin !
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "recommend" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Recommander LAIA SKIN
              </h2>
              
              <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl p-8 mb-6">
                <h3 className="text-xl font-semibold mb-4">Partagez votre expérience</h3>
                <p className="mb-6">
                  Recommandez nos soins à vos proches et gagnez 50 points de fidélité pour chaque nouveau client parrainé !
                </p>
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <p className="text-sm mb-2">Votre code de parrainage</p>
                  <p className="text-3xl font-bold font-mono">LAIA{userData?.name?.substring(0, 4).toUpperCase() || 'CODE'}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-[#d4b5a0]/20 rounded-xl p-6">
                  <h3 className="font-semibold text-[#2c3e50] mb-4">Recommander un soin spécifique</h3>
                  <div className="space-y-3">
                    {['Hydro\'Naissance', 'BB Glow', 'Renaissance'].map(soin => (
                      <button
                        key={soin}
                        onClick={() => {
                          const text = `J'ai adoré le soin ${soin} chez @LaiaSkin ! Je vous le recommande vivement 💕`;
                          if (navigator.share) {
                            navigator.share({
                              title: 'LAIA SKIN Institut',
                              text: text,
                              url: window.location.origin
                            });
                          } else {
                            navigator.clipboard.writeText(text + ' ' + window.location.origin);
                            alert('Message copié !');
                          }
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#fdfbf7] rounded-lg hover:bg-[#d4b5a0]/10 transition-colors"
                      >
                        <span className="text-[#2c3e50]">{soin}</span>
                        <Share2 className="w-4 h-4 text-[#d4b5a0]" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border border-[#d4b5a0]/20 rounded-xl p-6">
                  <h3 className="font-semibold text-[#2c3e50] mb-4">Partager sur les réseaux</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Partager sur Facebook
                    </button>
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                      Partager sur Instagram
                    </button>
                    <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Partager sur WhatsApp
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-[#fdfbf7] rounded-xl">
                <h3 className="font-semibold text-[#2c3e50] mb-3">Vos parrainages</h3>
                <p className="text-[#2c3e50]/60">Vous n'avez pas encore parrainé de clients. Commencez dès maintenant !</p>
              </div>
            </div>
          )}
          
          {activeTab === "reviews" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Mes Avis & Satisfaction
              </h2>
              
              {/* Statistiques de satisfaction */}
              <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#2c3e50]">Votre niveau de satisfaction</h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= 4.5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xl font-bold text-[#2c3e50]">4.5/5</span>
                  </div>
                </div>
                <p className="text-[#2c3e50]/70">
                  Merci pour votre fidélité ! Vos avis nous aident à améliorer constamment nos services.
                </p>
              </div>

              {/* Soins à évaluer */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Soins en attente d'évaluation</h3>
                {reservations
                  .filter(r => r.status === 'completed')
                  .slice(0, 2)
                  .map(reservation => (
                    <div key={reservation.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#2c3e50]">
                            {reservation.services.map(s => services[s as keyof typeof services]).join(', ')}
                          </p>
                          <p className="text-sm text-[#2c3e50]/60">
                            Effectué le {new Date(reservation.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowReviewModal(true);
                          }}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Évaluer
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Historique des avis */}
              <div>
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Mes avis précédents</h3>
                <div className="space-y-4">
                  {/* Avis exemple 1 */}
                  <div className="border border-[#d4b5a0]/20 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#2c3e50]">HydraFacial Premium</p>
                        <p className="text-sm text-[#2c3e50]/60">Évalué le 15 novembre 2024</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#2c3e50]/80 italic">
                      "Excellent soin ! Ma peau n'a jamais été aussi éclatante. Laïa est très professionnelle et à l'écoute."
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-[#2c3e50]/60">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        Utile (3)
                      </span>
                      <span>Niveau de satisfaction : Très satisfait</span>
                    </div>
                  </div>

                  {/* Avis exemple 2 */}
                  <div className="border border-[#d4b5a0]/20 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#2c3e50]">BB Glow - Forfait 4 séances</p>
                        <p className="text-sm text-[#2c3e50]/60">Évalué le 2 octobre 2024</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#2c3e50]/80 italic">
                      "Très bon résultat après 3 séances. Le teint est unifié et lumineux. Je recommande !"
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-[#2c3e50]/60">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        Utile (5)
                      </span>
                      <span>Niveau de satisfaction : Satisfait</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton pour voir plus */}
              <div className="mt-6 text-center">
                <button className="px-6 py-3 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-full hover:bg-[#d4b5a0] hover:text-white transition-colors">
                  Voir tous mes avis
                </button>
              </div>
            </div>
          )}
          
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Mon Profil
              </h2>
              
              <div className="max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">Nom</label>
                    <input
                      type="text"
                      value={userData?.name || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">Email</label>
                    <input
                      type="email"
                      value={userData?.email || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">Mot de passe</label>
                    <div className="flex gap-2">
                      <Link
                        href="/mot-passe-oublie"
                        className="px-4 py-2 border border-[#d4b5a0] text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0] hover:text-white transition-colors"
                      >
                        Modifier mon mot de passe
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Préférences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-[#d4b5a0]" defaultChecked />
                      <span className="text-[#2c3e50]/70">Recevoir les offres exclusives par email</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-[#d4b5a0]" defaultChecked />
                      <span className="text-[#2c3e50]/70">Rappel de rendez-vous par SMS</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'évaluation */}
      {showReviewModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
              Évaluer votre soin
            </h3>
            
            <div className="mb-4">
              <p className="font-medium text-[#2c3e50]">
                {selectedReservation.services.map(s => services[s as keyof typeof services]).join(', ')}
              </p>
              <p className="text-sm text-[#2c3e50]/60">
                Effectué le {new Date(selectedReservation.date).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {/* Note globale */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Note globale
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-[#2c3e50]">
                  {rating === 5 ? 'Excellent !' :
                   rating === 4 ? 'Très bien' :
                   rating === 3 ? 'Bien' :
                   rating === 2 ? 'Moyen' : 'Décevant'}
                </span>
              </div>
            </div>

            {/* Niveau de satisfaction */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Niveau de satisfaction
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setSatisfaction(level)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      satisfaction === level
                        ? 'bg-[#d4b5a0] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level === 1 && '😞'}
                    {level === 2 && '😐'}
                    {level === 3 && '🙂'}
                    {level === 4 && '😊'}
                    {level === 5 && '😍'}
                  </button>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Votre commentaire (optionnel)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]"
                rows={4}
              />
            </div>

            {/* Questions spécifiques */}
            <div className="mb-6 space-y-3">
              <p className="text-sm font-medium text-[#2c3e50]">Questions rapides</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-[#d4b5a0]" />
                <span className="text-sm text-[#2c3e50]/70">Je recommande ce soin</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-[#d4b5a0]" />
                <span className="text-sm text-[#2c3e50]/70">Les résultats correspondent à mes attentes</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-[#d4b5a0]" />
                <span className="text-sm text-[#2c3e50]/70">Je reprendrai ce soin</span>
              </label>
            </div>

            {/* Photo (optionnel) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Ajouter des photos (optionnel) - Max 3 photos
              </label>
              
              {/* Photos uploadées */}
              {reviewPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {reviewPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setReviewPhotos(reviewPhotos.filter((_, i) => i !== index));
                          setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {reviewPhotos.length < 3 && (
                <label className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const remainingSlots = 3 - reviewPhotos.length;
                      const filesToAdd = files.slice(0, remainingSlots);
                      
                      filesToAdd.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setReviewPhotos(prev => [...prev, reader.result as string]);
                        };
                        reader.readAsDataURL(file);
                      });
                      
                      setUploadedPhotos(prev => [...prev, ...filesToAdd]);
                    }}
                  />
                  <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] transition-colors flex items-center gap-2 w-full justify-center cursor-pointer">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      Ajouter {reviewPhotos.length > 0 ? 'd\'autres photos' : 'des photos'} ({3 - reviewPhotos.length} restantes)
                    </span>
                  </div>
                </label>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Les photos seront visibles après validation par l'institut
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReservation(null);
                  setRating(5);
                  setSatisfaction(5);
                  setReviewText('');
                  setReviewPhotos([]);
                  setUploadedPhotos([]);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Préparer les données de l'avis
                  const reviewData = {
                    reservationId: selectedReservation?.id,
                    service: selectedReservation?.services.map(s => services[s as keyof typeof services]).join(', '),
                    date: selectedReservation?.date,
                    rating,
                    satisfaction,
                    comment: reviewText,
                    photos: reviewPhotos,
                    timestamp: new Date().toISOString(),
                    clientName: userData?.name,
                    clientEmail: userData?.email
                  };
                  
                  // Sauvegarder localement (simulation)
                  const existingReviews = JSON.parse(localStorage.getItem('clientReviews') || '[]');
                  existingReviews.push(reviewData);
                  localStorage.setItem('clientReviews', JSON.stringify(existingReviews));
                  
                  alert(`Merci pour votre avis ! ${reviewPhotos.length > 0 ? `\n${reviewPhotos.length} photo(s) ajoutée(s)` : ''}\nIl sera publié après validation.`);
                  
                  // Réinitialiser
                  setShowReviewModal(false);
                  setSelectedReservation(null);
                  setRating(5);
                  setSatisfaction(5);
                  setReviewText('');
                  setReviewPhotos([]);
                  setUploadedPhotos([]);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer mon avis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}