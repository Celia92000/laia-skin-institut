"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, XCircle, Gift, Star, RefreshCw, User, Award, TrendingUp, LogOut, Share2, Heart, History, Check, Edit2, X, CalendarDays, MessageSquare, ThumbsUp, Send, Camera, Edit, Bell, AlertCircle } from "lucide-react";
import ClientSpaceWrapper from "./ClientSpaceWrapper";
import Modal from "@/components/Modal";
import { logout } from "@/lib/auth-client";
import ClientDashboard from "@/components/ClientDashboard";
import { ReferralSystem } from "@/components/ReferralSystem";
import { DiscountHistory } from "@/components/DiscountHistory";
import { SocialQRCodes } from "@/components/SocialQRCodes";
import { CongratulationsAnimation } from "@/components/CongratulationsAnimation";
import { getReservationWithServiceNames, getServiceIcon } from '@/lib/service-utils';

interface Reservation {
  id: string;
  services: string[];
  packages: {[key: string]: string};
  isSubscription?: boolean;
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
  loyaltyProfile?: {
    loyaltyCode?: string;
    referralCode?: string;
  };
}

export default function EspaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showDiscountAnimation, setShowDiscountAnimation] = useState(false);
  const [discountAnimationType, setDiscountAnimationType] = useState<'service_discount' | 'package_discount' | 'birthday' | 'referral'>('service_discount');
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  
  // Fonction pour vérifier le statut de l'abonnement
  const getSubscriptionStatus = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filtrer les réservations d'abonnement
    const subscriptionReservations = reservations.filter(r => r.isSubscription === true);
    
    if (subscriptionReservations.length === 0) {
      return { hasSubscription: false };
    }
    
    // Vérifier si l'abonnement du mois a été utilisé
    const monthlyUsed = subscriptionReservations.some(r => {
      const resDate = new Date(r.date);
      return resDate.getMonth() === currentMonth && 
             resDate.getFullYear() === currentYear &&
             (r.status === 'confirmed' || r.status === 'completed');
    });
    
    // Vérifier s'il y a un RDV d'abonnement à venir
    const upcoming = subscriptionReservations.find(r => {
      const resDate = new Date(r.date);
      return resDate.getMonth() === currentMonth && 
             resDate.getFullYear() === currentYear &&
             r.status === 'pending' &&
             resDate >= new Date();
    });
    
    // Trouver le dernier service utilisé en abonnement
    const lastSubscription = subscriptionReservations
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const lastService = lastSubscription ? lastSubscription.services[0] : null;
    
    return { 
      hasSubscription: true, 
      monthlyUsed, 
      upcoming,
      lastService 
    };
  };

  // Créer un map des services de la BDD
  const services = Object.fromEntries(dbServices.map(s => [s.slug, s.name]));

  useEffect(() => {
    // Vérifier si un onglet spécifique est demandé dans l'URL
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'reservations', 'reviews', 'loyalty', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.push('/login');
        return;
      }

      const userInfo = JSON.parse(user);
      // Utiliser le nom de l'utilisateur tel quel, sans distinction pour l'admin
      let displayName = userInfo.name || 'Cliente';
      
      setUserData({
        name: displayName,
        email: userInfo.email,
        loyaltyPoints: userInfo.loyaltyPoints || 0,
        totalSpent: userInfo.totalSpent || 0
      });

      fetchUserData();
      fetchReservations();
      fetchServices();
      fetchPreferences();
      fetchReviews();
    };

    checkAuth();
  }, [router]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setDbServices(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications);
        setWhatsappNotifications(data.whatsappNotifications);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
    }
  };
  
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews?userOnly=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    }
  };

  const updatePreference = async (type: 'email' | 'whatsapp', value: boolean) => {
    setSavingPreferences(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(type === 'email' ? { emailNotifications: value } : { whatsappNotifications: value })
        })
      });
      
      if (response.ok) {
        if (type === 'email') {
          setEmailNotifications(value);
        } else {
          setWhatsappNotifications(value);
        }
        // Afficher une notification de succès
        const message = value 
          ? `Les notifications ${type === 'email' ? 'email' : 'WhatsApp'} ont été réactivées`
          : `Les notifications ${type === 'email' ? 'email' : 'WhatsApp'} ont été désactivées`;
        alert(message);
      }
    } catch (error) {
      console.error('Erreur mise à jour préférences:', error);
      alert('Erreur lors de la mise à jour des préférences');
    } finally {
      setSavingPreferences(false);
    }
  };

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
        if (data) {
          setUserData(prevData => ({
            ...prevData,
            ...data,
            name: data.name || prevData?.name || 'Cliente'
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
        // Enrichir chaque réservation avec les noms des services
        const enrichedReservations = await Promise.all(
          data.map(async (reservation: any) => {
            return await getReservationWithServiceNames(reservation);
          })
        );
        setReservations(enrichedReservations);
      } else {
        // Données de démonstration si l'API n'est pas disponible
        const demoReservations = [
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
            services: ['hydro-cleaning'],
            packages: {},
            date: '2025-01-20',
            time: '14:30',
            totalPrice: 89,
            status: 'completed',
            createdAt: '2024-12-15'
          },
          {
            id: '3',
            services: ['bb-glow'],
            packages: { 'bb-glow': 'forfait' },
            date: '2024-12-10',
            time: '11:00',
            totalPrice: 360,
            status: 'completed',
            createdAt: '2024-11-20'
          }
        ];
        
        // Enrichir les données de démo aussi
        const enrichedDemo = await Promise.all(
          demoReservations.map(async (reservation: any) => {
            return await getReservationWithServiceNames(reservation);
          })
        );
        setReservations(enrichedDemo);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      // Données de démonstration en cas d'erreur
      const fallbackReservations = [
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
          services: ['hydro-cleaning'],
          packages: {},
          date: '2025-01-20',
          time: '14:30',
          totalPrice: 89,
          status: 'completed',
          createdAt: '2024-12-15'
        }
      ];
      
      // Enrichir les données de fallback aussi
      const enrichedFallback = await Promise.all(
        fallbackReservations.map(async (reservation: any) => {
          return await getReservationWithServiceNames(reservation);
        })
      );
      setReservations(enrichedFallback);
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

  const getLoyaltyLevel = (reservationCount: number) => {
    // Système basé sur le nombre de soins réservés
    if (reservationCount >= 20) {
      return { 
        name: "VIP Diamond 💎", 
        color: "text-purple-600", 
        nextLevel: null,
        benefits: "20% de réduction + Soins exclusifs + Cadeaux VIP",
        discount: 20
      };
    }
    if (reservationCount >= 10) {
      return { 
        name: "Gold ⭐", 
        color: "text-yellow-600", 
        nextLevel: 20,
        benefits: "15% de réduction + Accès prioritaire",
        discount: 15
      };
    }
    if (reservationCount >= 5) {
      return { 
        name: "Silver 🌟", 
        color: "text-gray-600", 
        nextLevel: 10,
        benefits: "10% de réduction",
        discount: 10
      };
    }
    return { 
      name: "Découverte", 
      color: "text-[#d4b5a0]", 
      nextLevel: 5,
      benefits: "5% dès le 2ème soin",
      discount: 5
    };
  };

  // Ne compter que les réservations terminées pour le statut de fidélité
  const completedReservationsCount = reservations.filter(r => r.status === 'completed').length;
  const loyalty = getLoyaltyLevel(completedReservationsCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <ClientSpaceWrapper>
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
                    {completedReservationsCount} soins effectués
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Niveau fidélité</p>
                  <p className="text-2xl font-bold text-[#d4b5a0]">
                    {Math.floor(completedReservationsCount / 5) + 1}
                  </p>
                </div>
              </div>
              
              {/* Barre de progression des soins */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#2c3e50]/60 mb-1">
                  <span>{completedReservationsCount} soins effectués</span>
                  <span>Prochain palier : {loyalty.nextLevel || '∞'} soins</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: loyalty.nextLevel 
                        ? `${Math.min(100, (completedReservationsCount / loyalty.nextLevel) * 100)}%` 
                        : '100%'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-[#2c3e50]/60 mt-2">
                  {loyalty.nextLevel ? (
                    `Encore ${loyalty.nextLevel - completedReservationsCount} soin${loyalty.nextLevel - completedReservationsCount > 1 ? 's' : ''} pour atteindre le statut ${
                      loyalty.nextLevel === 5 ? 'Silver 🌟' :
                      loyalty.nextLevel === 10 ? 'Gold ⭐' :
                      loyalty.nextLevel === 20 ? 'VIP Diamond 💎' : ''
                    }`
                  ) : (
                    'Niveau maximum atteint ! 🎉'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notification d'abonnement */}
        {/* Formule Liberté temporairement désactivée */}
        {false && (() => {
          const subscriptionStatus = getSubscriptionStatus();
          if (subscriptionStatus.hasSubscription && !subscriptionStatus.monthlyUsed && !subscriptionStatus.upcoming) {
            return (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 rounded-full p-3 animate-pulse">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Votre rendez-vous mensuel vous attend !
                    </h3>
                    <p className="text-purple-700 mb-4">
                      Votre abonnement Formule Liberté inclut une séance ce mois-ci.
                      <span className="font-semibold"> Ne perdez pas votre avantage !</span>
                    </p>
                    <p className="text-sm text-purple-600 mb-4">
                      💜 Profitez de votre soin mensuel inclus - Valable jusqu'à la fin du mois
                    </p>
                    <Link
                      href={`/reservation${subscriptionStatus.lastService ? `?service=${subscriptionStatus.lastService}&package=abonnement` : '?package=abonnement'}`}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      <CalendarDays className="w-5 h-5" />
                      Réserver mon RDV mensuel maintenant
                    </Link>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

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
          {activeTab === "dashboard" && userData && (
            <ClientDashboard 
              userData={{
                name: userData.name,
                loyaltyPoints: userData.loyaltyPoints,
                totalSpent: userData.totalSpent,
                nextAppointment: reservations.find(r => r.status === 'confirmed' || r.status === 'pending'),
                lastVisit: reservations.filter(r => r.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
              }}
              reservations={reservations}
              stats={{
                totalVisits: reservations.filter(r => r.status === 'completed').length,
                favoriteService: 'HydraFacial',
                memberSince: '2023'
              }}
            />
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
                          {reservation.services?.map((serviceId: string) => {
                            const packageType = (reservation.packages as any)?.[serviceId];
                            return (
                              <span key={serviceId} className="px-3 py-1 bg-[#d4b5a0]/10 rounded-full text-sm">
                                {serviceId}
                                {packageType === 'forfait' && ' (Forfait 4 séances)'}
                              </span>
                            );
                          })}
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
                              <Link
                                href={`/reservation?reschedule=${reservation.id}`}
                                className="flex items-center gap-1 px-3 py-2 border border-[#d4b5a0] text-[#d4b5a0] rounded-lg text-sm hover:bg-[#d4b5a0]/10 transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                                Reprogrammer
                              </Link>
                            </>
                          )}
                          
                          {reservation.status === 'pending' && (
                            <>
                              <Link
                                href={`/reservation?reschedule=${reservation.id}`}
                                className="flex items-center gap-1 px-3 py-2 bg-[#d4b5a0] text-white rounded-lg text-sm hover:bg-[#c9a084] transition-all"
                              >
                                <Edit className="w-4 h-4" />
                                Reprogrammer
                              </Link>
                              <button
                                onClick={() => {
                                  if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?\n\nCette action est irréversible.')) {
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
                        {[1, 2, 3, 4, 5, 6].map((num) => {
                          const completedCount = reservations.length;
                          const effectiveCount = completedCount % 6;
                          const finalCount = effectiveCount === 0 && completedCount > 0 ? 6 : effectiveCount;
                          return (
                            <div 
                              key={num}
                              className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg font-bold ${
                                num <= finalCount ? 'bg-white text-[#d4b5a0]' : 'bg-white/30 text-white'
                              }`}
                            >
                              {num <= finalCount ? '✓' : num}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm">
                        {(() => {
                          const count = reservations.length;
                          const effectiveCount = count % 6;
                          return effectiveCount === 0 && count > 0 ? '6 soins validés sur 6' : `${effectiveCount} soin${effectiveCount > 1 ? 's' : ''} validé${effectiveCount > 1 ? 's' : ''} sur 6`;
                        })()}
                      </p>
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
                        {[1, 2, 3, 4].map((num) => {
                          const forfaitCount = reservations.filter(r => {
                            if (r.status !== 'completed') return false;
                            try {
                              const packages = r.packages ? JSON.parse(typeof r.packages === 'string' ? r.packages : JSON.stringify(r.packages)) : {};
                              return Object.values(packages).some(p => p === 'forfait');
                            } catch {
                              return false;
                            }
                          }).length;
                          const effectiveCount = forfaitCount % 4;
                          const finalCount = effectiveCount === 0 && forfaitCount > 0 ? 4 : effectiveCount;
                          return (
                            <div 
                              key={num}
                              className={`w-full aspect-square rounded-lg flex items-center justify-center text-xl font-bold ${
                                num <= finalCount ? 'bg-white text-purple-600' : 'bg-white/30 text-white'
                              }`}
                            >
                              {num <= finalCount ? '✓' : num}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm">
                        {(() => {
                          const forfaitCount = reservations.filter(r => {
                            if (r.status !== 'completed') return false;
                            try {
                              const packages = r.packages ? JSON.parse(typeof r.packages === 'string' ? r.packages : JSON.stringify(r.packages)) : {};
                              return Object.values(packages).some(p => p === 'forfait');
                            } catch {
                              return false;
                            }
                          }).length;
                          const effectiveCount = forfaitCount % 4;
                          const finalCount = effectiveCount === 0 && forfaitCount > 0 ? 4 : effectiveCount;
                          return `${finalCount} forfait${finalCount > 1 ? 's' : ''} validé${finalCount > 1 ? 's' : ''} sur 4`;
                        })()}
                      </p>
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
                          {reservation.services?.join(', ') || 'Service inconnu'}
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
              
              {/* Historique des réductions */}
              <div className="mt-8">
                {userData && <DiscountHistory userId={userData.email} isAdmin={false} />}
              </div>
            </div>
          )}

          {activeTab === "recommend" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Programme de Parrainage & Réseaux Sociaux
              </h2>
              
              {/* Bouton pour ouvrir le système de parrainage */}
              <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl p-8 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-6 h-6" />
                  Partagez et Gagnez !
                </h3>
                <p className="mb-6">
                  Recommandez nos soins à vos proches et recevez <strong>15€ de réduction</strong> pour vous et votre filleul !
                </p>
                <button
                  onClick={() => setShowReferralModal(true)}
                  className="bg-white text-[#d4b5a0] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Accéder au programme de parrainage
                </button>
              </div>

              {/* QR Codes des réseaux sociaux */}
              <SocialQRCodes showTitle={true} size="medium" />
              
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
                  <h3 className="font-semibold text-[#2c3e50] mb-4">💡 Comment ça marche ?</h3>
                  <div className="space-y-3 text-[#2c3e50]/80">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <p className="text-sm">Partagez votre code parrainage <strong className="text-[#d4b5a0]">{`LAIA${userData?.name?.substring(0, 4).toUpperCase() || 'CODE'}`}</strong> à vos proches</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <p className="text-sm">Votre filleul(e) indique votre code lors de sa réservation</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <p className="text-sm">Vous recevez automatiquement <strong>10€ de réduction</strong> sur votre prochain soin</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <p className="text-sm">Votre filleul(e) bénéficie aussi de <strong>10€ de réduction</strong> sur son premier soin</p>
                    </div>
                  </div>
                  
                  {/* Boutons de partage actifs */}
                  <div className="mt-4 pt-4 border-t border-[#d4b5a0]/20">
                    <p className="text-xs text-[#2c3e50]/60 mb-3">Partager sur les réseaux :</p>
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          const url = window.location.href;
                          const text = `Je recommande LAIA SKIN Institut ! ${userData?.loyaltyProfile?.loyaltyCode ? `Utilisez mon code parrainage : ${userData?.loyaltyProfile?.loyaltyCode}` : ''}`;
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Partager sur Facebook
                      </button>
                      <button 
                        onClick={() => {
                          const text = `Je recommande LAIA SKIN Institut ! ${userData?.loyaltyProfile?.loyaltyCode ? `Code parrainage : ${userData?.loyaltyProfile?.loyaltyCode}` : ''} 🌟 #laiaskin #beaute #soins`;
                          navigator.clipboard.writeText(text);
                          alert('Texte copié pour Instagram ! Collez-le dans votre story ou post.');
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                        Partager sur Instagram
                      </button>
                      <button 
                        onClick={() => {
                          const text = `Je recommande LAIA SKIN Institut ! ${userData?.loyaltyProfile?.loyaltyCode ? `Utilisez mon code parrainage : ${userData?.loyaltyProfile?.loyaltyCode}` : ''} pour avoir -10% 🌟`;
                          const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                        Partager sur WhatsApp
                      </button>
                    </div>
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
                {(() => {
                  const reviewedReservationIds = userReviews.map(r => r.reservationId);
                  const unreviewedReservations = reservations
                    .filter(r => r.status === 'completed' && !reviewedReservationIds.includes(r.id));
                  
                  if (unreviewedReservations.length === 0) {
                    return (
                      <p className="text-[#2c3e50]/60 text-center py-8 bg-gray-50 rounded-xl">
                        Tous vos soins ont été évalués. Merci pour vos retours !
                      </p>
                    );
                  }
                  
                  return unreviewedReservations.slice(0, 3).map(reservation => (
                    <div key={reservation.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#2c3e50]">
                            {reservation.services?.join(', ') || 'Service inconnu'}
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
                  ));
                })()}
              </div>

              {/* Historique des avis */}
              <div>
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Mes avis précédents</h3>
                <div className="space-y-4">
                  {userReviews.length === 0 ? (
                    <p className="text-[#2c3e50]/60 text-center py-8 bg-gray-50 rounded-xl">
                      Vous n'avez pas encore laissé d'avis. Partagez votre expérience !
                    </p>
                  ) : (
                    userReviews.map((review) => (
                      <div key={review.id} className="border border-[#d4b5a0]/20 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-[#2c3e50]">{review.serviceName}</p>
                            <p className="text-sm text-[#2c3e50]/60">
                              Évalué le {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-[#2c3e50]/80 italic mb-3">"{review.comment}"</p>
                        )}
                        
                        {/* Photos de l'avis */}
                        {review.photos && JSON.parse(review.photos).length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {JSON.parse(review.photos).slice(0, 3).map((photo: string, idx: number) => (
                              <img 
                                key={idx}
                                src={photo} 
                                alt={`Photo ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-[#2c3e50]/60">
                            <span>
                              Satisfaction : {['😞', '😐', '🙂', '😊', '😍'][review.satisfaction - 1] || '😊'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              review.approved 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {review.approved ? 'Publié' : 'En attente de validation'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Réponse de l'institut */}
                        {review.response && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-[#d4b5a0] mb-1">Réponse de l'institut :</p>
                            <p className="text-sm text-[#2c3e50]/70">{review.response}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
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
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Préférences de notification</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#d4b5a0] rounded focus:ring-[#d4b5a0]" 
                        checked={emailNotifications}
                        onChange={(e) => updatePreference('email', e.target.checked)}
                        disabled={savingPreferences}
                      />
                      <span className="text-[#2c3e50]/70">Recevoir les offres exclusives par email</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#d4b5a0] rounded focus:ring-[#d4b5a0]" 
                        checked={whatsappNotifications}
                        onChange={(e) => updatePreference('whatsapp', e.target.checked)}
                        disabled={savingPreferences}
                      />
                      <span className="text-[#2c3e50]/70">Rappel de rendez-vous par WhatsApp</span>
                    </label>
                    {savingPreferences && (
                      <p className="text-sm text-[#2c3e50]/60 italic">Enregistrement...</p>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-[#fdfbf7] rounded-lg">
                    <p className="text-sm text-[#2c3e50]/70">
                      📌 <strong>Note :</strong> Si vous désactivez les rappels WhatsApp, vous ne recevrez plus de notifications automatiques la veille de vos rendez-vous. 
                      Vous pouvez réactiver cette option à tout moment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'évaluation */}
      <Modal
        isOpen={showReviewModal && selectedReservation !== null}
        onClose={() => {
          if (reviewText || rating !== 5 || reviewPhotos.length > 0) {
            if (window.confirm('Voulez-vous vraiment fermer ? Votre avis ne sera pas sauvegardé.')) {
              setShowReviewModal(false);
              setSelectedReservation(null);
              setRating(5);
              setSatisfaction(5);
              setReviewText('');
              setReviewPhotos([]);
              setUploadedPhotos([]);
            }
          } else {
            setShowReviewModal(false);
            setSelectedReservation(null);
          }
        }}
        title="Évaluer votre soin"
        size="md"
        preventCloseOnClickOutside={reviewText.length > 0 || reviewPhotos.length > 0}
      >
        {selectedReservation && (
          <div className="p-6">
            <div className="mb-4">
              <p className="font-medium text-[#2c3e50]">
                {selectedReservation.services?.join(', ') || 'Service inconnu'}
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
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/reviews', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        reservationId: selectedReservation?.id,
                        serviceName: selectedReservation?.services?.join(', ') || 'Service inconnu',
                        rating,
                        comment: reviewText,
                        satisfaction,
                        photos: reviewPhotos
                      })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      alert(`Merci pour votre avis ! ${reviewPhotos.length > 0 ? `\n${reviewPhotos.length} photo(s) ajoutée(s)` : ''}\nIl sera publié après validation.`);
                      
                      // Si 5 étoiles, proposer de laisser un avis Google
                      if (rating === 5 && data.googleUrl) {
                        if (confirm('Votre expérience était excellente ! Souhaitez-vous également partager votre avis sur Google ?')) {
                          window.open(data.googleUrl, '_blank');
                        }
                      }
                      
                      // Réinitialiser
                      setShowReviewModal(false);
                      setSelectedReservation(null);
                      setRating(5);
                      setSatisfaction(5);
                      setReviewText('');
                      setReviewPhotos([]);
                      setUploadedPhotos([]);
                      
                      // Recharger les avis
                      fetchReviews();
                    } else {
                      alert(data.error || 'Erreur lors de l\'envoi de l\'avis');
                    }
                  } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de l\'envoi de l\'avis');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer mon avis
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de parrainage */}
      {showReferralModal && userData && (
        <ReferralSystem 
          clientId={userData.email}
          clientName={userData.name}
          onClose={() => setShowReferralModal(false)}
        />
      )}

      {/* Animation de félicitations */}
      {showDiscountAnimation && (
        <CongratulationsAnimation
          type={discountAnimationType}
          amount={discountAnimationType === 'service_discount' ? 20 : 40}
          onClose={() => setShowDiscountAnimation(false)}
        />
      )}
    </div>
    </ClientSpaceWrapper>
  );
}