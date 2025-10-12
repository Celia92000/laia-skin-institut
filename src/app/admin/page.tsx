"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, XCircle, Gift, User, Users, Award, TrendingUp, UserCheck, Settings, Euro, Edit2, Save, FileText, Heart, AlertCircle, CreditCard, Download, Receipt, LogOut, MapPin, Phone, Mail, Instagram, Globe, Grid3x3, List, Cake, CreditCard as CardIcon, Star, MessageCircle, Send, X, Target, BarChart3, Package, Search, Ban, GraduationCap } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AdminCalendarEnhanced from "@/components/AdminCalendarEnhanced";
import AdminServicesTab from "@/components/AdminServicesTab";
import AdminStockTab from "@/components/AdminStockTab";
import AdminConfigTab from "@/components/AdminConfigTab";
import AdminDashboardOptimized from "@/components/AdminDashboardOptimized";
import UnifiedCRMTab, { type Client } from "@/components/UnifiedCRMTab";
import PlanningCalendar from "@/components/PlanningCalendar";
import PlanningCalendarDebug from "@/components/PlanningCalendarDebug";
import AdminDisponibilitesTabSync from "@/components/AdminDisponibilitesTabSync";
import { InvoiceButton } from "@/components/InvoiceGenerator";
import PaymentSectionEnhanced from "@/components/PaymentSectionEnhanced";
import WhatsAppHub from "@/components/WhatsAppHub";
import AdminLoyaltyTab from "@/components/AdminLoyaltyTab";
import AdminStatsEnhanced from "@/components/AdminStatsEnhanced";
import EmployeeStatsView from "@/components/EmployeeStatsView";
import AdminReviewsManager from "@/components/AdminReviewsManager";
import ClientSegmentation from "@/components/ClientSegmentation";
import EmailCompleteInterface from "@/components/EmailCompleteInterface";
import SourceStats from "@/components/SourceStats";
import RevenueManagement from "@/components/RevenueManagement";
import RealTimeStats from "@/components/admin/RealTimeStats";
import DynamicCharts from "@/components/admin/DynamicCharts";
import DataExport from "@/components/admin/DataExport";
import ObjectivesSettings from "@/components/ObjectivesSettings";
import { formatDateLocal } from "@/lib/date-utils";
import { checkAndCleanAuth, getAuthToken, clearAuthData } from '@/lib/auth-utils';
import ReservationTableAdvanced from "@/components/ReservationTableAdvanced";
import QuickBlockManagerEnhanced from "@/components/QuickBlockManagerEnhanced";
import QuickActionModal from "@/components/QuickActionModal";
import { logout } from "@/lib/auth-client";
import { getCurrentPrice, calculateTotalPrice } from "@/lib/pricing";
import ValidationPaymentModal from "@/components/ValidationPaymentModal";
import { generateInvoiceNumber, calculateInvoiceTotals, formatInvoiceHTML, generateCSVExport, downloadFile } from '@/lib/invoice-generator';
import AdminComptabiliteTab from "@/components/AdminComptabiliteTab";
import AdvancedSearch from "@/components/AdvancedSearch";
import FormationOrderSection from "@/components/FormationOrderSection";
import AdminGiftCardsTab from "@/components/AdminGiftCardsTab";
import AdminPendingOrdersTab from "@/components/AdminPendingOrdersTab";
import SocialMediaCalendar from "@/components/admin/SocialMediaCalendar";
import SocialMediaHub from "@/components/admin/SocialMediaHub";

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
  paymentDate?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  paymentNotes?: string;
  source?: string;
  modifiedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}


export default function AdminDashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [useOptimizedView, setUseOptimizedView] = useState(false); // Dashboard classique pour l'instant
  const [activeTab, setActiveTab] = useState("stats");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [paymentDateFilter, setPaymentDateFilter] = useState("");
  const [paymentDateStart, setPaymentDateStart] = useState("");
  const [paymentDateEnd, setPaymentDateEnd] = useState("");
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showEditReservationModal, setShowEditReservationModal] = useState(false);
  const [quickActionDate, setQuickActionDate] = useState<Date | null>(null);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [lastCheckedReservations, setLastCheckedReservations] = useState<string[]>([]);
  const [newReservationCount, setNewReservationCount] = useState(0);
  const [planningSubTab, setPlanningSubTab] = useState<'calendar' | 'availability' | 'list'>('calendar');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [reservationToValidate, setReservationToValidate] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<'total' | 'pending' | 'completed' | 'revenue' | null>(null);
  const [showObjectivesSettings, setShowObjectivesSettings] = useState(false);
  const [selectedStatDetail, setSelectedStatDetail] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [orderToSchedule, setOrderToSchedule] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState({
    date: formatDateLocal(new Date()),
    time: '09:00'
  });
  const [newReservation, setNewReservation] = useState({
    client: '',
    email: '',
    phone: '',
    date: formatDateLocal(new Date()),
    time: '09:00',
    services: [] as string[],
    notes: ''
  });
  const [dbServices, setDbServices] = useState<any[]>([]);

  // États pour la carte cadeau dans nouvelle réservation
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardData, setGiftCardData] = useState<any>(null);
  const [giftCardError, setGiftCardError] = useState("");
  const [isVerifyingGiftCard, setIsVerifyingGiftCard] = useState(false);

  // Services par défaut (au cas où la BDD est vide)
  const defaultServices = {
    "hydro-naissance": "Hydro'Naissance",
    "hydro-cleaning": "Hydro'Cleaning",
    "renaissance": "Renaissance",
    "bb-glow": "BB Glow",
    "led-therapie": "LED Thérapie"
  };

  // Utiliser les services de la BDD ou les services par défaut
  // S'assurer que services contient uniquement des strings
  const services = dbServices.length > 0 
    ? Object.fromEntries(dbServices.map(s => [s.slug, String(s.name)]))
    : defaultServices;
  
  // Vérifier et nettoyer services pour s'assurer qu'il ne contient que des strings
  const cleanServices: Record<string, string> = {};
  for (const [key, value] of Object.entries(services)) {
    if (typeof value !== 'string') {
      console.error(`services[${key}] n'est pas une string:`, value);
      cleanServices[key] = String(value);
    } else {
      cleanServices[key] = value;
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      // Nettoyer les tokens invalides automatiquement
      if (!checkAndCleanAuth()) {
        router.push('/login');
        return;
      }

      const token = getAuthToken();
      const user = localStorage.getItem('user');

      if (!token || !user) {
        router.push('/login');
        return;
      }

      let userInfo;
      try {
        userInfo = JSON.parse(user);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        clearAuthData();
        router.push('/login');
        return;
      }

      // Autoriser admin ET employés
      if (userInfo.role !== 'admin' && userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE') {
        router.push('/espace-client');
        return;
      }
      
      // Stocker le rôle et les données utilisateur pour contrôler l'affichage
      setUserRole(userInfo.role);
      setUserData(userInfo);

      // Vérifier si un onglet est spécifié dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }

      // Charger séquentiellement pour éviter de saturer la connection pool (1 seule connexion Supabase)
      const loadData = async () => {
        await fetchReservations();
        await fetchClients();
        await fetchServices();
        await fetchLoyaltyProfiles();
        await fetchReviewStatistics();
        await fetchOrders();
      };
      loadData();
    };

    checkAuth();
    
    // Écouter l'événement pour rafraîchir les profils de fidélité
    const handleRefreshLoyalty = () => {
      fetchLoyaltyProfiles();
      setActiveTab('loyalty'); // Rester sur l'onglet fidélité
    };
    window.addEventListener('refreshLoyalty', handleRefreshLoyalty);
    
    // Exposer la fonction de mise à jour pour les composants enfants
    (window as any).updateLoyaltyProfiles = setLoyaltyProfiles;
    
    // Rafraîchir les réservations toutes les 2 minutes (au lieu de 30s) pour réduire la charge DB
    const interval = setInterval(() => {
      fetchReservations();
    }, 120000); // 2 minutes
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshLoyalty', handleRefreshLoyalty);
      delete (window as any).updateLoyaltyProfiles;
    };
  }, [router]);

  // Effet pour pré-remplir les données du client sélectionné
  useEffect(() => {
    if (showNewReservationModal) {
      const preselectedClientData = localStorage.getItem('preselectedClient');
      if (preselectedClientData) {
        try {
          const client = JSON.parse(preselectedClientData);
          setNewReservation(prev => ({
            ...prev,
            client: client.name || '',
            email: client.email || '',
            phone: client.phone || ''
          }));
        } catch (error) {
          console.error('Erreur lors de la récupération du client:', error);
        }
      }
    }
  }, [showNewReservationModal]);

  const fetchServices = async () => {
    try {
      // Cache des services pendant 5 minutes (ils changent rarement)
      const cachedServices = localStorage.getItem('cachedServices');
      const cacheTime = localStorage.getItem('cachedServicesTime');
      const now = Date.now();

      if (cachedServices && cacheTime && (now - parseInt(cacheTime) < 5 * 60 * 1000)) {
        const data = JSON.parse(cachedServices);
        setDbServices(data);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // S'assurer que les données sont sérialisables
        const cleanedData = data.map((s: any) => ({
          id: s.id,
          slug: s.slug,
          name: String(s.name),
          price: Number(s.price),
          promoPrice: s.promoPrice ? Number(s.promoPrice) : null,
          duration: Number(s.duration),
          active: Boolean(s.active)
        }));

        // Mettre en cache
        localStorage.setItem('cachedServices', JSON.stringify(cleanedData));
        localStorage.setItem('cachedServicesTime', now.toString());
        setDbServices(cleanedData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('Token invalide ou expiré');
        clearAuthData();
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error('Non autorisé - redirection vers login');
        clearAuthData();
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setReservations(data);

        // Vérifier les nouvelles réservations en attente
        const pendingReservations = data.filter((r: Reservation) => r.status === 'pending');
        const storedLastChecked = localStorage.getItem('lastCheckedReservations');
        const lastChecked = storedLastChecked ? JSON.parse(storedLastChecked) : [];
        
        const newPendingReservations = pendingReservations.filter((r: Reservation) => 
          !lastChecked.includes(r.id)
        );
        
        if (newPendingReservations.length > 0) {
          setNewReservationCount(newPendingReservations.length);
          setShowNotification(true);
          
          // Jouer un son de notification
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {
            // Gérer silencieusement si le son ne peut pas être joué
          });
        }
      } else {
        console.error('Erreur HTTP:', response.status, response.statusText);
        if (response.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (response.status === 500) {
          // Erreur serveur - on continue avec des données vides
          console.warn('Erreur serveur, utilisation de données vides');
          setReservations([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Problème de connexion au serveur. Utilisation de données vides.');
        setReservations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
    }
  };

  const fetchReviewStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/statistics-safe?viewMode=month&selectedMonth=' + new Date().toISOString().slice(0, 7), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviewStats(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'avis:', error);
    }
  };

  const fetchLoyaltyProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/loyalty', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyProfiles(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des profils de fidélité:', error);
    }
  };

  const applyDiscount = async (userId: string, amount: number, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, discountAmount: amount, reason })
      });

      if (response.ok) {
        alert(`Réduction de ${amount}€ appliquée avec succès !`);
        fetchLoyaltyProfiles();
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de la réduction:', error);
    }
  };

  const updateReservationStatus = async (reservationId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Mettre à jour la liste localement
        setReservations(prev => prev.map(r => 
          r.id === reservationId ? { ...r, status } : r
        ));
        
        // Trouver la réservation pour avoir les infos du client
        const reservation = reservations.find(r => r.id === reservationId);
        
        // Si le soin est validé, les points sont automatiquement ajoutés
        if (status === 'completed') {
          fetchClients(); // Rafraîchir les données clients
          fetchLoyaltyProfiles(); // Rafraîchir les profils de fidélité
          alert(`✅ Soin validé pour ${reservation?.userName || 'le client'}`);
        }
        
        // Si le client était absent, notifier et enregistrer
        if (status === 'no_show' && reservation) {
          // Envoyer une notification WhatsApp au client
          try {
            await fetch('/api/notifications/no-show', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                reservationId: reservation.id,
                clientEmail: reservation.userEmail,
                clientName: reservation.userName,
                date: reservation.date,
                time: reservation.time,
                services: reservation.services
              })
            });
          } catch (error) {
            console.error('Erreur envoi notification no-show:', error);
          }
          
          alert(`⚠️ Client absent enregistré pour ${reservation.userName || 'le client'}. Une notification a été envoyée.`);
          fetchClients(); // Rafraîchir pour mettre à jour l'historique
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleValidationPayment = async (data: any) => {
    if (!reservationToValidate) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reservations/${reservationToValidate.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        fetchReservations();
        fetchClients();
        fetchLoyaltyProfiles();
        
        let message = data.status === 'completed' 
          ? `✅ Soin validé pour ${reservationToValidate.userName}`
          : `⚠️ ${reservationToValidate.userName} était absent`;
        
        if (data.paymentStatus === 'paid') {
          message += ` - Paiement de ${data.paymentAmount}€ enregistré`;
        } else if (data.paymentStatus === 'partial') {
          message += ` - Acompte de ${data.paymentAmount}€ enregistré`;
        }
        
        alert(message);
        setShowValidationModal(false);
        setReservationToValidate(null);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const addBonusPoints = async (clientId: string, points: number) => {
    // Fonction désactivée - nous utilisons un système de compteurs de soins/forfaits
    console.log('Système de points désactivé - Utilisation des compteurs de fidélité');
  };

  const openEditModal = (reservation: Reservation) => {
    setEditingReservation({
      id: reservation.id,
      client: reservation.userName || '',
      email: reservation.userEmail || '',
      phone: reservation.phone || '',
      date: typeof reservation.date === 'string' ? formatDateLocal(reservation.date) : formatDateLocal(reservation.date),
      time: reservation.time,
      services: reservation.services,
      notes: reservation.notes || '',
      totalPrice: reservation.totalPrice
    });
    setShowEditReservationModal(true);
  };

  const updateReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/reservations/${editingReservation.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: editingReservation.date,
          time: editingReservation.time,
          services: editingReservation.services,
          notes: editingReservation.notes,
          totalPrice: editingReservation.totalPrice
        })
      });

      if (response.ok) {
        setShowEditReservationModal(false);
        setEditingReservation(null);
        fetchReservations();
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
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
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        fetchReservations();
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
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
        fetchReservations();
        alert('Réservation validée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const verifyGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setGiftCardError("Veuillez entrer un code");
      return;
    }

    setIsVerifyingGiftCard(true);
    setGiftCardError("");
    setGiftCardData(null);

    try {
      const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(giftCardCode.toUpperCase())}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setGiftCardData(data);
        setGiftCardError("");
      } else {
        setGiftCardError(data.error || "Code invalide");
        setGiftCardData(null);
      }
    } catch (error) {
      setGiftCardError("Erreur lors de la vérification du code");
      setGiftCardData(null);
    } finally {
      setIsVerifyingGiftCard(false);
    }
  };

  const createNewReservation = async () => {
    try {
      const token = localStorage.getItem('token');

      // Calculer le prix total en fonction des services sélectionnés
      const totalPrice = calculateTotalPrice(newReservation.services);

      // Préparer les données de la réservation avec la carte cadeau si applicable
      const reservationData: any = {
        ...newReservation,
        totalPrice,
        status: 'confirmed',
        source: 'admin'
      };

      // Si une carte cadeau est valide, l'inclure
      if (giftCardData?.valid && giftCardData?.giftCard?.id) {
        const giftCardBalance = giftCardData.balance || 0;
        const usedAmount = Math.min(giftCardBalance, totalPrice);

        reservationData.giftCardId = giftCardData.giftCard.id;
        reservationData.giftCardUsedAmount = usedAmount;
      }

      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });

      if (response.ok) {
        setShowNewReservationModal(false);
        setNewReservation({
          client: '',
          email: '',
          phone: '',
          date: formatDateLocal(new Date()),
          time: '09:00',
          services: [],
          notes: ''
        });
        setGiftCardCode("");
        setGiftCardData(null);
        setGiftCardError("");
        fetchReservations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      alert('Erreur lors de la création de la réservation');
    }
  };

  const scheduleOrder = async () => {
    if (!orderToSchedule) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderToSchedule.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduledDate: new Date(scheduleData.date).toISOString(),
          scheduledTime: scheduleData.time,
          status: 'confirmed'
        })
      });

      if (response.ok) {
        alert('Commande planifiée avec succès !');
        setShowScheduleModal(false);
        setOrderToSchedule(null);
        setScheduleData({ date: formatDateLocal(new Date()), time: '09:00' });
        fetchOrders();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Erreur lors de la planification'}`);
      }
    } catch (error) {
      console.error('Erreur planification commande:', error);
      alert('Erreur lors de la planification de la commande');
    }
  };

  const recordPayment = async (reservationId: string, appliedDiscount?: { type: string, amount: number }, paymentDetails?: any) => {
    const amountInput = document.getElementById(`amount-${reservationId}`) as HTMLInputElement;
    const methodSelect = document.getElementById(`method-${reservationId}`) as HTMLSelectElement;
    const invoiceInput = document.getElementById(`invoice-${reservationId}`) as HTMLInputElement;
    const notesInput = document.getElementById(`notes-${reservationId}`) as HTMLInputElement;

    try {
      const token = localStorage.getItem('token');
      
      // Gestion de l'annulation de paiement
      if (paymentDetails?.reset) {
        const response = await fetch(`/api/admin/reservations/${reservationId}/payment`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          fetchReservations();
          fetchLoyaltyProfiles();
          alert('Paiement annulé avec succès');
        }
        return;
      }
      
      // Générer automatiquement un numéro de facture unique si non fourni
      let invoiceNumber = invoiceInput?.value || '';
      if (!invoiceNumber) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = reservations.filter(r => r.invoiceNumber && r.invoiceNumber.startsWith(`${year}-${month}`)).length + 1;
        invoiceNumber = `${year}-${month}-${String(count).padStart(3, '0')}`;
      }
      
      // Déterminer le montant et la méthode de paiement
      let paymentAmount = 0;
      let paymentMethod = '';
      let paymentNotes = notesInput?.value || '';
      
      if (paymentDetails && !paymentDetails.reset) {
        // Paiement mixte
        paymentAmount = paymentDetails.total;
        const methods = [];
        if (paymentDetails.cash > 0) methods.push(`Espèces: ${paymentDetails.cash}€`);
        if (paymentDetails.card > 0) methods.push(`Carte: ${paymentDetails.card}€`);
        if (paymentDetails.transfer > 0) methods.push(`Virement: ${paymentDetails.transfer}€`);
        paymentMethod = 'mixed';
        paymentNotes = `Paiement mixte - ${methods.join(', ')}${paymentNotes ? ' | ' + paymentNotes : ''}`;
      } else {
        // Paiement simple
        paymentAmount = parseFloat(amountInput?.value || '0');
        paymentMethod = methodSelect?.value || 'cash';
      }
      
      const response = await fetch(`/api/admin/reservations/${reservationId}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentAmount,
          method: paymentMethod,
          invoiceNumber: invoiceNumber,
          notes: paymentNotes,
          appliedDiscount: appliedDiscount,
          paymentDetails: paymentDetails
        })
      });

      if (response.ok) {
        fetchReservations();
        fetchLoyaltyProfiles();
        alert(`Paiement enregistré avec succès !\nFacture n°${invoiceNumber}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
    }
  };

  const exportPayments = (format: 'csv' | 'detailed' = 'csv') => {
    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');
    
    if (format === 'detailed') {
      // Export détaillé pour le livre de recettes
      const headers = [
        'Date Soin', 'Heure', 'Date Paiement', 'N° Facture', 
        'Client', 'Email', 'Téléphone',
        'Prestations', 'Prix HT', 'TVA (20%)', 'Prix TTC',
        'Mode de Paiement', 'Détails Paiement', 'Notes'
      ];
      
      const rows = paidReservations
        .sort((a, b) => new Date(a.paymentDate || a.date).getTime() - new Date(b.paymentDate || b.date).getTime())
        .map(r => {
          const servicesStr = (typeof r.services === 'string' ? JSON.parse(r.services) : r.services)
            .map((s: string) => cleanServices[s as keyof typeof cleanServices] || s).join(', ');
          const ht = (r.paymentAmount || r.totalPrice) / 1.2;
          const tva = (r.paymentAmount || r.totalPrice) - ht;
          
          let paymentMethodStr = '';
          if (r.paymentMethod === 'mixed' && r.paymentNotes?.includes('Paiement mixte')) {
            paymentMethodStr = 'Mixte';
          } else {
            paymentMethodStr = r.paymentMethod === 'cash' ? 'Espèces' : 
                             r.paymentMethod === 'card' ? 'Carte bancaire' : 
                             r.paymentMethod === 'transfer' ? 'Virement' : r.paymentMethod || '';
          }
          
          return [
            new Date(r.date).toLocaleDateString('fr-FR'),
            r.time,
            r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('fr-FR') : '',
            r.invoiceNumber || '',
            r.userName || '',
            r.userEmail || '',
            r.phone || '',
            servicesStr,
            ht.toFixed(2) + '€',
            tva.toFixed(2) + '€',
            (r.paymentAmount || r.totalPrice) + '€',
            paymentMethodStr,
            r.paymentNotes?.replace('Paiement mixte - ', '') || '',
            r.notes || ''
          ];
        });
      
      // Ajouter une ligne de total à la fin
      const totalHT = paidReservations.reduce((sum, r) => sum + ((r.paymentAmount || r.totalPrice) / 1.2), 0);
      const totalTVA = paidReservations.reduce((sum, r) => sum + ((r.paymentAmount || r.totalPrice) - (r.paymentAmount || r.totalPrice) / 1.2), 0);
      const totalTTC = paidReservations.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0);
      
      rows.push([
        '', '', '', '',
        'TOTAL', '', '',
        `${paidReservations.length} prestations`,
        totalHT.toFixed(2) + '€',
        totalTVA.toFixed(2) + '€',
        totalTTC.toFixed(2) + '€',
        '', '', ''
      ]);
      
      const csvContent = '\uFEFF' + [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(';'))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const dateRange = paymentDateStart && paymentDateEnd 
        ? `${paymentDateStart}_${paymentDateEnd}`
        : formatDateLocal(new Date());
      link.download = `livre_recettes_${dateRange}.csv`;
      link.click();
      
    } else {
      // Export simple existant
      const headers = ['Date', 'Client', 'Services', 'Montant TTC', 'Méthode', 'Facture', 'Notes'];
      const rows = paidReservations
        .map(r => [
          new Date(r.paymentDate || '').toLocaleDateString('fr-FR'),
          r.userName || '',
          (typeof r.services === 'string' ? JSON.parse(r.services) : r.services).map((s: string) => cleanServices[s as keyof typeof cleanServices]).join(', '),
          `${r.paymentAmount || r.totalPrice}€`,
          r.paymentMethod === 'cash' ? 'Espèces' : 
          r.paymentMethod === 'card' ? 'Carte' : 
          r.paymentMethod === 'mixed' ? 'Mixte' : 'Virement',
          r.invoiceNumber || '',
          r.paymentNotes || ''
        ]);

      const csvContent = '\uFEFF' + [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(';'))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `paiements_${formatDateLocal(new Date())}.csv`;
      link.click();
    }
  };

  const getLoyaltyLevel = (points: number, totalSpent: number) => {
    if (points >= 400 || totalSpent >= 1200) {
      return { name: "VIP Diamond 💎", color: "text-purple-600" };
    }
    if (points >= 250 || totalSpent >= 750) {
      return { name: "Gold ⭐", color: "text-yellow-600" };
    }
    if (points >= 100 || totalSpent >= 300) {
      return { name: "Silver 🌟", color: "text-gray-600" };
    }
    return { name: "Découverte", color: "text-[#d4b5a0]" };
  };

  // Filtrer les réservations par date pour le planning
  const todayReservations = reservations.filter(r =>
    (typeof r.date === 'string' ? formatDateLocal(r.date) : formatDateLocal(r.date)) === selectedDate
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Statistiques pour le dashboard
  const stats = {
    totalReservations: reservations.length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    completedToday: reservations.filter(r =>
      r.status === 'completed' && (typeof r.date === 'string' ? formatDateLocal(r.date) : formatDateLocal(r.date)) === formatDateLocal(new Date())
    ).length,
    totalRevenue: Math.round(reservations.filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0))
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  // Afficher le nouveau dashboard optimisé avec les données
  if (useOptimizedView) {
    return (
      <AuthGuard requireAdmin={true}>
        <AdminDashboardOptimized />
      </AuthGuard>
    );
  }

  // Dashboard classique
  return (
    <AuthGuard requireAdmin={true}>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
        
        {/* Notification de nouvelles réservations */}
        {showNotification && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 shadow-xl animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <p className="font-bold text-lg">
                    {newReservationCount} nouvelle{newReservationCount > 1 ? 's' : ''} réservation{newReservationCount > 1 ? 's' : ''} !
                  </p>
                  <p className="text-white/90 text-sm">
                    En attente de confirmation dans l'onglet "Planning du jour"
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNotification(false);
                  setActiveTab('planning');
                  const pendingIds = reservations
                    .filter(r => r.status === 'pending')
                    .map(r => r.id);
                  localStorage.setItem('lastCheckedReservations', JSON.stringify(pendingIds));
                }}
                className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Voir les réservations
              </button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#2c3e50] mb-2">
                Tableau de Bord Admin
              </h1>
              <p className="text-[#2c3e50]/70">Gérez vos réservations et vos clients</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="px-4 py-2 text-sm border border-laia-primary/10 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-laia-primary/30 rounded-full transition-all flex items-center gap-2 text-laia-gray hover:text-laia-primary"
              >
                <Search className="w-4 h-4" />
                Recherche
              </button>
              
              {/* Boutons visibles uniquement pour les ADMINS */}
              {(userRole === 'ADMIN' || userRole === 'admin') && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white hover:from-[#c9a084] hover:to-[#b89778] rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Users className="w-4 h-4" />
                  Utilisateurs & Permissions
                </button>
              )}
              <button
                onClick={() => router.push('/admin/settings')}
                className="px-4 py-2 text-sm bg-[#d4b5a0] text-white hover:bg-[#c9a084] rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Stats - Cliquables */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setShowDetailsModal('total')}
              className="bg-gradient-to-br from-[#f5e6d3]/30 to-[#fdfbf7] rounded-xl p-4 hover:shadow-md transition-all text-left group border border-[#d4a574]/20"
            >
              <p className="text-sm text-[#2c3e50]/60 mb-1">Réservations</p>
              <p className="text-2xl font-bold text-[#d4a574]">{stats.totalReservations}</p>
              <p className="text-xs text-[#d4a574]/70 mt-1">Total</p>
            </button>
            <button
              onClick={() => setShowDetailsModal('pending')}
              className="bg-gradient-to-br from-[#f5e6d3]/30 to-[#fdfbf7] rounded-xl p-4 hover:shadow-md transition-all text-left group border border-[#d4a574]/20"
            >
              <p className="text-sm text-[#2c3e50]/60 mb-1">En attente</p>
              <p className="text-2xl font-bold text-[#d4a574]">{stats.pendingReservations}</p>
              <p className="text-xs text-[#d4a574]/70 mt-1">À confirmer</p>
            </button>
            <button
              onClick={() => setShowDetailsModal('completed')}
              className="bg-gradient-to-br from-[#c9a084]/20 to-[#fdfbf7] rounded-xl p-4 hover:shadow-md transition-all text-left group border border-[#c9a084]/20"
            >
              <p className="text-sm text-[#2c3e50]/60 mb-1">Aujourd'hui</p>
              <p className="text-2xl font-bold text-[#c9a084]">{stats.completedToday}</p>
              <p className="text-xs text-[#c9a084]/70 mt-1">Terminés</p>
            </button>
            <button
              onClick={() => setShowDetailsModal('revenue')}
              className="bg-gradient-to-br from-[#d4a574]/20 to-[#f5e6d3]/20 rounded-xl p-4 hover:shadow-md transition-all text-left group border border-[#d4a574]/20"
            >
              <p className="text-sm text-[#2c3e50]/60 mb-1">Revenus</p>
              <p className="text-2xl font-bold text-[#d4a574]">{stats.totalRevenue}€</p>
              <p className="text-xs text-[#d4a574]/70 mt-1">Total</p>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className="bg-gradient-to-br from-[#d4a574]/20 to-[#f5e6d3]/20 rounded-xl p-4 hover:shadow-md transition-all text-left group border border-[#d4a574]/20"
            >
              <p className="text-sm text-[#2c3e50]/60 mb-1">Satisfaction</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-[#d4a574]">
                  {reviewStats?.averageRating?.toFixed(1) || '0.0'}
                </p>
                <Star className="w-5 h-5 text-[#d4a574] fill-[#d4a574]" />
              </div>
              <p className="text-xs text-[#d4a574]/70">
                {reviewStats?.satisfaction?.total || 0} avis
              </p>
            </button>
          </div>
        </div>

        {/* Tabs - Sans mouvement vertical */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-2 no-vertical-scroll scrollbar-hide" style={{ overflowY: 'hidden', overflowX: 'auto', touchAction: 'pan-x' }}>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
              activeTab === "stats"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            {userRole === 'EMPLOYEE' ? 'Tableau de bord' : 'Statistiques'}
          </button>
          <button
            onClick={() => setActiveTab("planning")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap relative flex-shrink-0 text-sm sm:text-base ${
              activeTab === "planning"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            <span className="relative group">
              Planning du jour
              {reservations.filter(r => r.status === 'pending').length > 0 && (
                <>
                  <span className="absolute -top-3 -right-6 z-20 px-1.5 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg min-w-[18px] text-center">
                    {reservations.filter(r => r.status === 'pending').length}
                  </span>
                  <div className="absolute top-8 right-0 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 whitespace-nowrap pointer-events-none">
                    <div className="font-bold mb-1">Réservations en attente</div>
                    <div>{reservations.filter(r => r.status === 'pending').length} à confirmer</div>
                    <div className="absolute -top-2 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900"></div>
                  </div>
                </>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("soins-paiements")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
              activeTab === "soins-paiements" || activeTab === "validation" || activeTab === "paiements"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Soins & Paiements
          </button>
          <button
            onClick={() => setActiveTab("fidelite")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap relative flex-shrink-0 text-sm sm:text-base ${
              activeTab === "fidelite"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            <span className="relative group">
              Fidélité / Cartes Cadeaux
              {(() => {
                const clientsWithRewards = clients.filter(client => {
                  const clientReservations = reservations.filter(r => 
                    r.userEmail === client.email && r.status !== 'cancelled'
                  );
                  const sessionCount = clientReservations.length;
                  const has6Sessions = sessionCount > 0 && sessionCount % 6 === 0;
                  const currentMonth = new Date().getMonth();
                  const hasBirthday = client.birthdate && 
                    new Date(client.birthdate).getMonth() === currentMonth;
                  return has6Sessions || hasBirthday;
                });
                
                if (clientsWithRewards.length > 0) {
                  const birthdayCount = clients.filter(c => c.birthdate && 
                    new Date(c.birthdate).getMonth() === new Date().getMonth()).length;
                  const rewardCount = clientsWithRewards.length - birthdayCount;
                  
                  return (
                    <>
                      <span className="absolute -top-3 -right-6 z-20 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] px-1.5 py-0.5 flex items-center justify-center font-bold animate-pulse shadow-lg">
                        {clientsWithRewards.length}
                      </span>
                      <div className="absolute top-8 right-0 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 whitespace-nowrap pointer-events-none">
                        <div className="font-bold mb-1">Réductions disponibles</div>
                        {rewardCount > 0 && <div>{rewardCount} client(s) - 6ème séance</div>}
                        {birthdayCount > 0 && <div>{birthdayCount} anniversaire(s)</div>}
                        <div className="absolute -top-2 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900"></div>
                      </div>
                    </>
                  );
                }
                return null;
              })()}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
              activeTab === "crm"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            CRM Clients
          </button>
          {/* Emailing et WhatsApp après CRM */}
          {(userRole === 'ADMIN' || userRole === 'admin') && (
            <>
              <button
                onClick={() => setActiveTab("emailing")}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "emailing"
                    ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Emailing
              </button>
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "whatsapp"
                    ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                WhatsApp
              </button>
            </>
          )}
          {/* Services et Produits - uniquement pour ADMIN */}
          {(userRole === 'ADMIN' || userRole === 'admin') && (
            <>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "services"
                    ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                Gestion Services
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "products"
                    ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Gestion des Stocks
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "pending"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Commandes en attente
              </button>
            </>
          )}
          {(userRole === 'ADMIN' || userRole === 'admin') && (
            <>
              <button
                onClick={() => setActiveTab("comptabilite")}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "comptabilite"
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                <Euro className="w-4 h-4 inline mr-2" />
                Comptabilité
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
              activeTab === "reviews"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Avis & Photos
          </button>
          {(userRole === 'ADMIN' || userRole === 'admin') && (
            <button
              onClick={() => setActiveTab("social-media")}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                activeTab === "social-media"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white text-[#2c3e50] hover:shadow-md"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Réseaux Sociaux
            </button>
          )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === "stats" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                {userRole === 'EMPLOYEE' ? 'Tableau de bord' : 'Tableau de bord et statistiques'}
              </h2>
              
              {userRole === 'EMPLOYEE' ? (
                // Vue limitée pour les employés
                <div className="space-y-6">
                  {/* Stats de base uniquement */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6">
                      <p className="text-sm text-[#2c3e50]/60 mb-2">Réservations du jour</p>
                      <p className="text-3xl font-bold text-[#2c3e50]">
                        {reservations.filter(r => {
                          const date = typeof r.date === 'string' ? r.date : r.date;
                          return formatDateLocal(date) === formatDateLocal(new Date());
                        }).length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <p className="text-sm text-[#2c3e50]/60 mb-2">Confirmées</p>
                      <p className="text-3xl font-bold text-green-600">
                        {reservations.filter(r => r.status === 'confirmed').length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                      <p className="text-sm text-[#2c3e50]/60 mb-2">En attente</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {reservations.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                  
                  {/* CA du mois - vue simplifiée */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-[#2c3e50]">Évolution du CA</h3>
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-600 mb-2">CA du mois en cours</p>
                      <p className="text-4xl font-bold text-[#d4b5a0]">
                        {reservations
                          .filter(r => {
                            const date = new Date(r.date);
                            const now = new Date();
                            return date.getMonth() === now.getMonth() && 
                                   date.getFullYear() === now.getFullYear() &&
                                   r.status === 'completed';
                          })
                          .reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note :</strong> En tant qu'employé, vous avez accès aux statistiques de base.
                      Pour plus d'informations, contactez votre administrateur.
                    </p>
                  </div>
                </div>
              ) : (
                // Vue complète pour les admins
                <>
                  {/* Vue employé avec statistiques utiles */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#d4b5a0]" />
                      Vue Performance & Objectifs
                    </h3>
                    <EmployeeStatsView 
                      reservations={reservations}
                      viewMode="month"
                      selectedDate={selectedDate}
                      selectedMonth={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                      selectedYear={new Date().getFullYear().toString()}
                    />
                  </div>

                  {/* Séparateur visuel */}
                  <div className="my-8 border-t-2 border-gray-100"></div>

                  {/* Objectifs personnalisables */}
                  <div className="flex items-center justify-between mb-4 mt-8">
                    <h3 className="text-lg font-semibold text-[#2c3e50] flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Objectifs et Performance
                    </h3>
                    <button
                      onClick={() => setShowObjectivesSettings(!showObjectivesSettings)}
                      className="px-3 py-1 text-sm bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Personnaliser les objectifs
                    </button>
                  </div>
                  
                  {showObjectivesSettings && (
                    <div className="mb-6">
                      <ObjectivesSettings 
                        onClose={() => setShowObjectivesSettings(false)}
                        onSave={() => {
                          // Rafraîchir les données si nécessaire
                          fetchReservations();
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Statistiques réelles depuis la base de données */}
                  <RealTimeStats />
                  
                  {/* Graphiques dynamiques avec période d'analyse */}
                  <DynamicCharts />
                  
                  {/* Export des données */}
                  <DataExport />
                  
                  {/* Statistiques des sources */}
                  <SourceStats reservations={reservations} />
                </>
              )}
            </div>
          )}
          
          {activeTab === "planning" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-4">
                  Planning & Disponibilités
                </h2>
                
                {/* Sous-onglets */}
                <div className="flex gap-2 mb-6 border-b border-[#d4b5a0]/20 pb-4">
                  <button
                    onClick={() => setPlanningSubTab('calendar')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      planningSubTab === 'calendar'
                        ? 'bg-[#d4b5a0] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Vue calendrier
                  </button>
                  <button
                    onClick={() => setPlanningSubTab('list')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      planningSubTab === 'list'
                        ? 'bg-[#d4b5a0] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4 inline mr-2" />
                    Liste des réservations
                  </button>
                  <button
                    onClick={() => setPlanningSubTab('availability')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      planningSubTab === 'availability'
                        ? 'bg-[#d4b5a0] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Gérer mes disponibilités
                  </button>
                </div>
              </div>
              
              {/* Section nouvelles réservations et commandes en attente */}
              {(reservations.filter(r => r.status === 'pending').length > 0 || orders.filter(o => !o.scheduledDate).length > 0) && (
                <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Nouvelles réservations à valider ({reservations.filter(r => r.status === 'pending').length + orders.filter(o => !o.scheduledDate).length})
                  </h3>
                  <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-3">
                      {reservations
                        .filter(r => r.status === 'pending')
                        .map((reservation) => (
                          <div key={reservation.id} className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-[#2c3e50]">{reservation.userName}</p>
                                <p className="text-sm text-[#2c3e50]/60">{reservation.userEmail}</p>
                              </div>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                En attente
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#2c3e50]/70">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(reservation.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reservation.time}
                              </span>
                            </div>
                            <p className="text-sm mt-2 font-medium text-[#d4b5a0]">
                              {reservation.services.map((s: string) => cleanServices[s as keyof typeof cleanServices] || s).join(', ')}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        ))}

                      {/* Commandes en attente (produits et formations sans date) */}
                      {orders
                        .filter(o => !o.scheduledDate)
                        .map((order) => {
                          const items = JSON.parse(order.items || '[]');
                          const orderType = items[0]?.type || 'commande';
                          const isProduct = orderType === 'product';
                          const isFormation = orderType === 'formation';
                          const isGiftCard = orderType === 'giftcard';

                          return (
                            <div key={order.id} className={`bg-white rounded-lg p-4 border-2 hover:shadow-md transition-all ${
                              isProduct ? 'border-indigo-200' :
                              isFormation ? 'border-purple-200' :
                              isGiftCard ? 'border-pink-200' : 'border-gray-200'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-[#2c3e50] flex items-center gap-2">
                                    {isProduct ? <Package className="w-4 h-4 text-indigo-500" /> :
                                     isFormation ? <GraduationCap className="w-4 h-4 text-purple-500" /> :
                                     isGiftCard ? <Gift className="w-4 h-4 text-pink-500" /> : null}
                                    {order.user?.name}
                                  </p>
                                  <p className="text-sm text-[#2c3e50]/60">{order.user?.email}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isProduct ? 'bg-indigo-100 text-indigo-700' :
                                  isFormation ? 'bg-purple-100 text-purple-700' :
                                  isGiftCard ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {isProduct ? 'Produit' : isFormation ? 'Formation' : isGiftCard ? 'Carte Cadeau' : 'Commande'}
                                </span>
                              </div>
                              <div className="text-sm text-[#2c3e50]/70 mb-2">
                                <p className="text-xs text-gray-500">
                                  Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <p className="text-sm mt-2 font-medium text-[#d4b5a0]">
                                {items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                              </p>
                              <p className="text-sm font-bold text-green-600 mt-1">
                                Total: {order.totalAmount}€
                              </p>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    setOrderToSchedule(order);
                                    setShowScheduleModal(true);
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                  Planifier
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Annuler cette commande ?')) {
                                      // TODO: Annuler la commande
                                      alert('Annulation à implémenter');
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  {(reservations.filter(r => r.status === 'pending').length + orders.filter(o => !o.scheduledDate).length) > 6 && (
                    <div className="mt-3 text-center text-xs text-[#2c3e50]/50">
                      Faites défiler pour voir toutes les réservations et commandes
                    </div>
                  )}
                </div>
              )}

              {/* Afficher le contenu selon le sous-onglet */}
              {planningSubTab === 'calendar' && (
                <>
                  {(() => {
                    try {
                      // Convertir les commandes planifiées en format "réservation" pour l'affichage calendrier
                      const scheduledOrders = orders
                        .filter(o => o.scheduledDate && o.status === 'confirmed')
                        .map(o => {
                          const items = JSON.parse(o.items || '[]');
                          const orderType = items[0]?.type || 'commande';
                          return {
                            id: o.id,
                            date: formatDateLocal(new Date(o.scheduledDate)),
                            time: o.scheduledTime || '09:00',
                            userName: o.user?.name || 'Client',
                            userEmail: o.user?.email || '',
                            services: [`${orderType}-order`], // Marqueur pour identifier que c'est une commande
                            serviceName: items.map((item: any) => `${item.quantity}x ${item.name}`).join(', '),
                            serviceDuration: 30, // Durée fixe pour les commandes
                            status: 'confirmed',
                            totalPrice: o.totalAmount,
                            isOrder: true, // Marqueur pour distinguer les commandes des réservations
                            orderType // product ou formation
                          };
                        });

                      return (
                        <PlanningCalendar
                          reservations={[
                            ...reservations
                              .filter(r => r.status !== 'cancelled')
                              .map(r => ({
                              ...r,
                              date: typeof r.date === 'string' ? r.date : r.date.toISOString(),
                              userName: r.userName || 'Client',
                              userEmail: r.userEmail || '',
                              // Convertir services en tableau de strings uniquement
                              services: r.services && r.services.length > 0
                                ? r.services.map((s: any) => {
                                    if (typeof s === 'string') return s;
                                    if (typeof s === 'object' && s.slug) return s.slug;
                                    if (typeof s === 'object' && s.name) return s.name;
                                    return 'service-inconnu';
                                  })
                                : [],
                              serviceName: (r.services && r.services.length > 0
                                ? r.services.map((s: any) => {
                                    // Si s est un objet, extraire le nom
                                    if (typeof s === 'object' && s.name) {
                                      return s.name;
                                    }
                                    // Si s est une string, chercher dans cleanServices
                                    if (typeof s === 'string') {
                                      const serviceName = cleanServices[s];
                                      // S'assurer qu'on retourne toujours une string
                                      return serviceName && typeof serviceName === 'string' ? serviceName : s;
                                    }
                                    return 'Service inconnu';
                                  }).join(', ')
                                : 'Service non défini'),
                              serviceDuration: r.services && r.services.length > 0
                                ? r.services.reduce((total: number, serviceSlug: any) => {
                                    // Si serviceSlug est un objet avec duration, l'utiliser
                                    if (typeof serviceSlug === 'object' && serviceSlug.duration) {
                                      return total + serviceSlug.duration;
                                    }
                                    // Si serviceSlug est une string, chercher le service dans dbServices
                                    if (typeof serviceSlug === 'string') {
                                      const service = dbServices.find(s => s.slug === serviceSlug);
                                      return total + (service?.duration || 60);
                                    }
                                    return total + 60;
                                  }, 0)
                                : 60
                            })),
                            ...scheduledOrders
                          ]}
                          services={cleanServices}
                          dbServices={dbServices}
                          onNewReservation={() => setShowNewReservationModal(true)}
                          onDateClick={(date) => {
                            setQuickActionDate(date);
                            setShowQuickActionModal(true);
                          }}
                        />
                      );
                    } catch (error) {
                      console.error('Erreur dans PlanningCalendar:', error);
                      return <div className="p-4 bg-red-50 text-red-600 rounded">Erreur lors du chargement du calendrier. Veuillez rafraîchir la page.</div>;
                    }
                  })()}
                  
                  {/* Modal de création rapide */}
                  {showQuickActionModal && quickActionDate && (
                    <QuickActionModal
                      date={quickActionDate}
                      onClose={() => setShowQuickActionModal(false)}
                      onCreateReservation={async (data) => {
                        try {
                          // Créer la réservation
                          const response = await fetch('/api/admin/reservations', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
                            },
                            body: JSON.stringify(data)
                          });

                          if (response.ok) {
                            fetchReservations();
                            setShowQuickActionModal(false);
                          } else {
                            const errorData = await response.json();
                            alert(errorData.error || 'Erreur lors de la création de la réservation');
                          }
                        } catch (error) {
                          console.error('Erreur:', error);
                          alert('Erreur lors de la création de la réservation');
                        }
                      }}
                      onBlockSlot={async (data) => {
                        // Bloquer le créneau
                        await fetch('/api/admin/blocked-slots', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                          },
                          body: JSON.stringify(data)
                        });
                        fetchReservations();
                        setShowQuickActionModal(false);
                      }}
                      services={cleanServices}
                      existingClients={clients}
                    />
                  )}
                </>
              )}
              
              {planningSubTab === 'availability' && (
                <div className="space-y-6">
                  {/* Nouveau gestionnaire de blocage avec sélection par glissement */}
                  <QuickBlockManagerEnhanced />
                  
                  {/* Gestionnaire complet des disponibilités */}
                  <AdminDisponibilitesTabSync />
                  
                  {/* Instructions */}
                  <div className="bg-[#fdfbf7] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
                      Guide rapide
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-[#2c3e50] mb-2">Blocages récurrents</h4>
                        <ul className="text-sm text-[#2c3e50]/70 space-y-1">
                          <li>• Pause déjeuner quotidienne</li>
                          <li>• Jour de fermeture hebdomadaire</li>
                          <li>• Réunion mensuelle</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-[#2c3e50] mb-2">Blocages ponctuels</h4>
                        <ul className="text-sm text-[#2c3e50]/70 space-y-1">
                          <li>• Utilisez la vue calendrier</li>
                          <li>• Cliquez sur le jour/créneau</li>
                          <li>• Blocage immédiat</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-[#2c3e50] mb-2">Application automatique</h4>
                        <ul className="text-sm text-[#2c3e50]/70 space-y-1">
                          <li>• 3 mois à l'avance</li>
                          <li>• Mise à jour instantanée</li>
                          <li>• Clients informés en temps réel</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {planningSubTab === 'list' && (
                <div>
                  {/* Tableau des réservations avec toutes les infos */}
                  <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#2c3e50]">Toutes les réservations</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        viewMode === 'cards' 
                          ? 'bg-[#d4b5a0] text-white' 
                          : 'bg-[#d4b5a0]/10 text-[#2c3e50] hover:bg-[#d4b5a0]/20'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4 inline mr-1" />
                      Cartes
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        viewMode === 'table' 
                          ? 'bg-[#d4b5a0] text-white' 
                          : 'bg-[#d4b5a0]/10 text-[#2c3e50] hover:bg-[#d4b5a0]/20'
                      }`}
                    >
                      <List className="w-4 h-4 inline mr-1" />
                      Tableau
                    </button>
                  </div>
                </div>

                {/* Vue en cartes */}
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservations.map((reservation) => (
                      <div 
                        key={reservation.id} 
                        className="bg-white border border-[#d4b5a0]/20 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        {/* En-tête avec statut */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-[#d4b5a0]" />
                              <span className="font-semibold text-[#2c3e50]">
                                {new Date(reservation.date).toLocaleDateString('fr-FR', { 
                                  weekday: 'short', 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#2c3e50]/60" />
                              <span className="text-lg font-bold text-[#2c3e50]">{reservation.time}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reservation.status === 'completed' ? 'bg-green-100 text-green-600' :
                            reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {reservation.status === 'completed' ? '✓ Terminé' :
                             reservation.status === 'confirmed' ? 'Confirmé' :
                             reservation.status === 'cancelled' ? 'Annulé' :
                             'En attente'}
                          </span>
                        </div>

                        {/* Informations client */}
                        <div className="bg-[#fdfbf7] rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-[#d4b5a0]" />
                            <span className="font-semibold text-[#2c3e50]">
                              {reservation.userName || 'Client'}
                            </span>
                          </div>
                          {reservation.userEmail && (
                            <div className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                              <Mail className="w-3 h-3" />
                              <span>{reservation.userEmail}</span>
                            </div>
                          )}
                          {reservation.phone && (
                            <div className="flex items-center gap-2 text-sm text-[#2c3e50]/70 mt-1">
                              <Phone className="w-3 h-3" />
                              <span>{reservation.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Badge abonnement si applicable */}
                        {(reservation as any).isSubscription && (
                          <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg">
                            <span className="text-purple-600">🔔</span>
                            <span className="text-sm font-medium text-purple-700">Abonnement mensuel</span>
                            <span className="text-xs text-purple-600">Séance du mois</span>
                          </div>
                        )}
                        
                        {/* Services */}
                        <div className="mb-3">
                          <div className="text-xs text-[#2c3e50]/60 mb-1">Services</div>
                          <div className="flex flex-wrap gap-1">
                            {reservation.services.map((serviceId: string) => (
                              <span 
                                key={serviceId} 
                                className="px-2 py-1 bg-[#d4b5a0]/10 rounded-full text-xs font-medium text-[#2c3e50]"
                              >
                                {cleanServices[serviceId as keyof typeof cleanServices]}
                                {reservation.packages && reservation.packages[serviceId] === 'forfait' && (
                                  <span className="ml-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                    Forfait 4 séances
                                  </span>
                                )}
                                {/* Formule Liberté temporairement désactivée */}
                                {false && reservation.packages && reservation.packages[serviceId] === 'abonnement' && (
                                  <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    Formule Liberté
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Notes si présentes */}
                        {reservation.notes && (
                          <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                            <div className="text-xs text-[#2c3e50]/60 mb-1">Notes</div>
                            <p className="text-sm text-[#2c3e50] line-clamp-2">{reservation.notes}</p>
                          </div>
                        )}

                        {/* Prix et paiement */}
                        <div className="flex justify-between items-center pt-3 border-t border-[#d4b5a0]/10">
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-[#d4b5a0]" />
                            <span className="text-xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</span>
                          </div>
                          {reservation.paymentStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              reservation.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' :
                              reservation.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {reservation.paymentStatus === 'paid' ? '✓ Payé' :
                               reservation.paymentStatus === 'partial' ? 'Partiel' :
                               'Non payé'}
                            </span>
                          )}
                        </div>

                        {/* Source */}
                        <div className="mt-2 text-xs text-[#2c3e50]/50 text-center">
                          {reservation.source === 'site' && '🌐 Site web'}
                          {reservation.source === 'admin' && '👤 Admin'}
                          {reservation.source === 'planity' && '📱 Planity'}
                          {reservation.source === 'treatwell' && '💜 Treatwell'}
                          {reservation.source === 'appel' && '📞 Appel'}
                          {reservation.source === 'reseaux' && '📲 Réseaux'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ReservationTableAdvanced 
                    reservations={reservations.map(r => ({
                      ...r,
                      totalPrice: r.totalPrice || 0,
                      services: r.services || [],
                      paymentStatus: r.paymentStatus || 'pending'
                    }))}
                    services={cleanServices}
                    onEdit={openEditModal}
                    onCancel={(reservation) => cancelReservation(reservation.id)}
                    onStatusChange={(id, status) => updateReservationStatus(id, status as any)}
                  />
                )}
              </div>
                </div>
              )}
              
            </div>
          )}

          {(activeTab === "soins-paiements" || activeTab === "validation" || activeTab === "paiements") && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2c3e50]">
                    Gestion des Soins & Paiements
                  </h2>
                  <p className="text-[#2c3e50]/70 mt-2">
                    Validez les rendez-vous effectués et gérez tous les paiements
                  </p>
                </div>
                {/* Boutons Export - uniquement pour ADMIN */}
                {(userRole === 'ADMIN' || userRole === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportPayments('csv')}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => exportPayments('detailed')}
                      className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Livre de Recettes
                    </button>
                  </div>
                )}
              </div>

              {/* Section des soins à valider */}
              {(() => {
                const validationReservations = reservations.filter(r => r.status === 'confirmed');
                
                if (validationReservations.length > 0) {
                  return (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          {validationReservations.length}
                        </span>
                        Soins à valider
                      </h3>
                      <div className="space-y-4">
                        {validationReservations.map((reservation) => (
                  <div key={reservation.id} className="border border-[#d4b5a0]/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-[#d4b5a0]" />
                          <span className="font-semibold text-[#2c3e50]">
                            {new Date(reservation.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-[#2c3e50]/60">à {reservation.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-[#2c3e50]/60" />
                          <span className="text-[#2c3e50] font-medium">{reservation.userName || 'Client'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-[#2c3e50]/70">
                            Services: {(() => {
                              try {
                                // Essayer de parser si c'est du JSON
                                const servicesList = typeof reservation.services === 'string' 
                                  ? JSON.parse(reservation.services) 
                                  : reservation.services;
                                
                                if (Array.isArray(servicesList)) {
                                  return servicesList.map((s: string) => 
                                    cleanServices[s as keyof typeof cleanServices] || s
                                  ).join(', ');
                                } else {
                                  return reservation.services || 'Service non spécifié';
                                }
                              } catch {
                                // Si ce n'est pas du JSON, c'est probablement une chaîne simple
                                if (typeof reservation.services === 'string' && reservation.services in cleanServices) {
                                  return cleanServices[reservation.services as keyof typeof cleanServices];
                                }
                                return reservation.services || 'Service non spécifié';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {reservation.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              setReservationToValidate(reservation);
                              setShowValidationModal(true);
                            }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white font-medium rounded-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Valider le rendez-vous & Enregistrer le paiement
                          </button>
                        </>
                      )}
                      {reservation.status === 'completed' && (
                        <div className="flex-1 text-center py-2 bg-green-100 text-green-600 rounded-lg font-medium">
                          ✓ Soin effectué
                        </div>
                      )}
                      {reservation.status === 'no_show' && (
                        <div className="flex-1 text-center py-2 bg-orange-100 text-orange-600 rounded-lg font-medium">
                          ✗ Client absent
                        </div>
                      )}
                    </div>
                  </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Section Vente de Formations */}
              <div className="mb-8">
                <FormationOrderSection onOrderCreated={fetchOrders} />
              </div>

              {/* Section historique des commandes (produits et formations) */}
              {orders.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-500" />
                    Historique des commandes
                  </h3>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orders
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((order) => {
                              let items = [];
                              try {
                                items = JSON.parse(order.items || '[]');
                              } catch (e) {}

                              return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900">{order.user?.name}</div>
                                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                      {items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          {item.type === 'product' ? (
                                            <Package className="w-3 h-3 text-purple-500" />
                                          ) : (
                                            <GraduationCap className="w-3 h-3 text-purple-500" />
                                          )}
                                          <span>{item.name} x{item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    {order.totalAmount}€
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500">
                                    {order.paymentMethod === 'cash' ? 'Espèces' :
                                     order.paymentMethod === 'card' ? 'Carte' :
                                     order.paymentMethod === 'transfer' ? 'Virement' :
                                     order.paymentMethod}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      order.paymentStatus === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {order.paymentStatus === 'paid' ? '✓ Payé' : 'En attente'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Section historique des paiements */}
              <div>
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-[#d4b5a0]" />
                  Historique des soins & paiements
                </h3>
                
                <div className="space-y-4">
                  {reservations
                    .filter(r => r.status === 'completed' || r.status === 'no_show')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((reservation) => (
                      <div key={reservation.id} className="border border-[#d4b5a0]/20 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-5 h-5 text-[#d4b5a0]" />
                              <span className="font-semibold text-[#2c3e50]">{reservation.userName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reservation.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-600'
                                  : reservation.paymentStatus === 'partial'
                                  ? 'bg-blue-100 text-blue-600'
                                  : reservation.paymentStatus === 'no_show'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {reservation.paymentStatus === 'paid' ? '✓ Payé' : 
                                 reservation.paymentStatus === 'partial' ? '⚠ Acompte' :
                                 reservation.paymentStatus === 'no_show' ? '⚠ Absent' : 
                                 'Non payé'}
                              </span>
                            </div>
                            <p className="text-sm text-[#2c3e50]/60 mb-1">
                              {new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}
                            </p>
                            <p className="text-sm text-[#2c3e50]/70">
                              Services: {(() => {
                                try {
                                  const servicesList = typeof reservation.services === 'string' 
                                    ? JSON.parse(reservation.services) 
                                    : reservation.services;
                                  
                                  if (Array.isArray(servicesList)) {
                                    return servicesList.map((s: string) => 
                                      cleanServices[s as keyof typeof cleanServices] || s
                                    ).join(', ');
                                  } else {
                                    return reservation.services || 'Service non spécifié';
                                  }
                                } catch {
                                  if (typeof reservation.services === 'string' && reservation.services in cleanServices) {
                                    return cleanServices[reservation.services as keyof typeof cleanServices];
                                  }
                                  return reservation.services || 'Service non spécifié';
                                }
                              })()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</p>
                            {reservation.paymentAmount && reservation.paymentAmount !== reservation.totalPrice && (
                              <p className="text-sm text-[#2c3e50]/60">Payé: {reservation.paymentAmount}€</p>
                            )}
                          </div>
                        </div>
                        
                        {reservation.paymentStatus !== 'paid' && reservation.paymentStatus !== 'no_show' && reservation.paymentStatus !== 'partial' && (
                          <PaymentSectionEnhanced
                            reservation={reservation}
                            loyaltyProfiles={loyaltyProfiles}
                            recordPayment={recordPayment}
                          />
                        )}
                        
                        {/* Section avec les détails de paiement et bouton CRM */}
                        {(reservation.paymentStatus === 'paid' || reservation.paymentStatus === 'partial' || reservation.paymentStatus === 'no_show') && (
                          <div className="border-t border-[#d4b5a0]/10 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-[#2c3e50]/60">
                                {reservation.paymentStatus === 'no_show' ? (
                                  <>
                                    <p className="text-orange-600 font-medium">Client absent</p>
                                    <p>Date: {new Date(reservation.date).toLocaleDateString('fr-FR')}</p>
                                  </>
                                ) : reservation.paymentStatus === 'partial' ? (
                                  <>
                                    <p className="text-blue-600 font-medium">Acompte reçu</p>
                                    <p>Montant: {reservation.paymentAmount}€</p>
                                    <p>Méthode: {reservation.paymentMethod}</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-green-600 font-medium">Payé</p>
                                    <p>Date: {reservation.paymentDate ? new Date(reservation.paymentDate).toLocaleDateString('fr-FR') : 'N/A'}</p>
                                    <p>Méthode: {reservation.paymentMethod || 'N/A'}</p>
                                  </>
                                )}
                                {reservation.paymentNotes && (
                                  <p className="mt-1 text-xs italic">{reservation.paymentNotes}</p>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {/* Bouton pour voir dans le CRM */}
                                <button
                                  onClick={() => {
                                    setActiveTab('crm');
                                    // Optionnel : vous pouvez aussi sélectionner automatiquement le client
                                    setTimeout(() => {
                                      const clientElement = document.querySelector(`[data-client-id="${reservation.userId}"]`);
                                      if (clientElement) {
                                        clientElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        // Ajouter un effet visuel temporaire
                                        clientElement.classList.add('ring-2', 'ring-[#d4b5a0]', 'ring-offset-2');
                                        setTimeout(() => {
                                          clientElement.classList.remove('ring-2', 'ring-[#d4b5a0]', 'ring-offset-2');
                                        }, 3000);
                                      }
                                    }, 500);
                                  }}
                                  className="px-3 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20 transition-all text-sm flex items-center gap-2"
                                  title="Voir dans le CRM"
                                >
                                  <User className="w-4 h-4" />
                                  Profil CRM
                                </button>
                                
                                {reservation.paymentStatus !== 'no_show' && (
                                  <InvoiceButton reservation={{
                                    ...reservation,
                                    client: reservation.userName || 'Client',
                                    email: reservation.userEmail
                                  }} />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {false && activeTab === "paiements" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#2c3e50]">
                  Gestion des Paiements & Livre de Recettes
                </h2>
                {/* Boutons Export - uniquement pour ADMIN */}
                {(userRole === 'ADMIN' || userRole === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportPayments('csv')}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Simple
                    </button>
                    <button
                      onClick={() => exportPayments('detailed')}
                      className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Livre de Recettes
                    </button>
                  </div>
                )}
              </div>

              {/* Filtres */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <select
                    className="px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                    onChange={(e) => setPaymentFilter(e.target.value)}
                  >
                    <option value="all">Tous les paiements</option>
                    <option value="unpaid">Non payés</option>
                    <option value="paid">Payés</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="lastMonth">Mois dernier</option>
                    <option value="year">Cette année</option>
                  </select>
                  
                  <select
                    className="px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'custom') return;
                      
                      const today = new Date();
                      let start = new Date();
                      let end = new Date();
                      
                      switch(value) {
                        case 'today':
                          setPaymentDateStart(formatDateLocal(today));
                          setPaymentDateEnd(formatDateLocal(today));
                          break;
                        case 'yesterday':
                          start.setDate(today.getDate() - 1);
                          setPaymentDateStart(formatDateLocal(start));
                          setPaymentDateEnd(formatDateLocal(start));
                          break;
                        case 'week':
                          start.setDate(today.getDate() - 7);
                          setPaymentDateStart(formatDateLocal(start));
                          setPaymentDateEnd(formatDateLocal(today));
                          break;
                        case 'month':
                          start.setMonth(today.getMonth() - 1);
                          setPaymentDateStart(formatDateLocal(start));
                          setPaymentDateEnd(formatDateLocal(today));
                          break;
                        case 'quarter':
                          start.setMonth(today.getMonth() - 3);
                          setPaymentDateStart(formatDateLocal(start));
                          setPaymentDateEnd(formatDateLocal(today));
                          break;
                        case 'year':
                          start.setFullYear(today.getFullYear() - 1);
                          setPaymentDateStart(formatDateLocal(start));
                          setPaymentDateEnd(formatDateLocal(today));
                          break;
                      }
                    }}
                  >
                    <option value="">Période rapide</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="yesterday">Hier</option>
                    <option value="week">7 derniers jours</option>
                    <option value="month">30 derniers jours</option>
                    <option value="quarter">3 derniers mois</option>
                    <option value="year">Cette année</option>
                    <option value="custom">Personnalisé...</option>
                  </select>
                </div>
                
                {/* Sélection de période personnalisée */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-[#fdfbf7] rounded-lg">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#2c3e50]/70">Du :</label>
                    <input
                      type="date"
                      value={paymentDateStart}
                      className="px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                      onChange={(e) => setPaymentDateStart(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#2c3e50]/70">Au :</label>
                    <input
                      type="date"
                      value={paymentDateEnd}
                      className="px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                      onChange={(e) => setPaymentDateEnd(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPaymentDateStart('');
                      setPaymentDateEnd('');
                      setPaymentFilter('all');
                    }}
                    className="px-4 py-2 text-sm text-[#d4b5a0] hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Statistiques avec totaux HT/TVA/TTC */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#2c3e50]/60">CA du jour</span>
                    <Euro className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {reservations
                      .filter(r => r.paymentStatus === 'paid' && new Date(r.paymentDate || '').toDateString() === new Date().toDateString())
                      .reduce((sum, r) => sum + (r.paymentAmount || 0), 0)}€
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#2c3e50]/60">CA du mois</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {reservations
                      .filter(r => r.paymentStatus === 'paid' && new Date(r.paymentDate || '').getMonth() === new Date().getMonth())
                      .reduce((sum, r) => sum + (r.paymentAmount || 0), 0)}€
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#2c3e50]/60">En attente</span>
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reservations
                      .filter(r => r.status === 'completed' && r.paymentStatus !== 'paid')
                      .reduce((sum, r) => sum + r.totalPrice, 0)}€
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#2c3e50]/60">Factures du mois</span>
                    <Receipt className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {reservations
                      .filter(r => r.invoiceNumber && new Date(r.paymentDate || '').getMonth() === new Date().getMonth())
                      .length}
                  </p>
                </div>
                
                {/* Résumé pour livre de recettes */}
                {(() => {
                  const filteredReservations = reservations.filter(r => {
                    if (r.paymentStatus !== 'paid') return false;
                    if (!r.paymentDate) return false;
                    
                    const paymentDate = new Date(r.paymentDate);
                    if (paymentDateStart && new Date(paymentDateStart) > paymentDate) return false;
                    if (paymentDateEnd && new Date(paymentDateEnd) < paymentDate) return false;
                    
                    return true;
                  });
                  
                  const totalTTC = filteredReservations.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0);
                  const totalHT = totalTTC / 1.2;
                  const totalTVA = totalTTC - totalHT;
                  
                  return (
                    <div className="bg-gradient-to-r from-[#fdfbf7] to-[#f8f6f0] p-4 rounded-xl border border-[#d4b5a0]/20">
                      <h3 className="text-sm font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Résumé pour la période sélectionnée
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-[#2c3e50]/60">Total HT</p>
                          <p className="text-lg font-bold text-[#2c3e50]">{totalHT.toFixed(2)}€</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2c3e50]/60">TVA (20%)</p>
                          <p className="text-lg font-bold text-orange-600">{totalTVA.toFixed(2)}€</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2c3e50]/60">Total TTC</p>
                          <p className="text-lg font-bold text-green-600">{totalTTC.toFixed(2)}€</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#2c3e50]/50 mt-2">
                        {filteredReservations.length} prestations payées
                      </p>
                    </div>
                  );
                })()}
                </div>
              </div>

              {/* Liste des réservations à facturer */}
              <div className="space-y-4">
                {reservations
                  .filter(r => r.status === 'completed')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((reservation) => (
                    <div key={reservation.id} className="border border-[#d4b5a0]/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-[#d4b5a0]" />
                          <span className="font-semibold text-[#2c3e50]">{reservation.userName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reservation.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {reservation.paymentStatus === 'paid' ? '✓ Payé' : 'Non payé'}
                          </span>
                        </div>
                        <p className="text-sm text-[#2c3e50]/60 mb-1">
                          {new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}
                        </p>
                        <p className="text-sm text-[#2c3e50]/70">
                          Services: {(() => {
                            try {
                              // Essayer de parser si c'est du JSON
                              const servicesList = typeof reservation.services === 'string' ? JSON.parse(reservation.services) : reservation.services;
                              return Array.isArray(servicesList) 
                                ? servicesList.map((s: string) => cleanServices[s as keyof typeof cleanServices] || s).join(', ')
                                : reservation.services;
                            } catch {
                              // Si ce n'est pas du JSON, c'est probablement une chaîne simple
                              if (typeof reservation.services === 'string' && reservation.services in cleanServices) {
                                return cleanServices[reservation.services as keyof typeof cleanServices];
                              }
                              return reservation.services;
                            }
                          })()}
                        </p>
                        {reservation.invoiceNumber && (
                          <p className="text-sm text-[#2c3e50]/60 mt-1">
                            Facture: #{reservation.invoiceNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</p>
                        {reservation.paymentAmount && reservation.paymentAmount !== reservation.totalPrice && (
                          <p className="text-sm text-[#2c3e50]/60">Payé: {reservation.paymentAmount}€</p>
                        )}
                      </div>
                    </div>
                    
                    {reservation.paymentStatus !== 'paid' && (
                      <PaymentSectionEnhanced
                        reservation={reservation}
                        loyaltyProfiles={loyaltyProfiles}
                        recordPayment={recordPayment}
                      />
                    )}
                    
                    {reservation.paymentStatus === 'paid' && (
                      <div className="border-t border-[#d4b5a0]/10 pt-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-[#2c3e50]/60">
                            <p>Payé le: {new Date(reservation.paymentDate || '').toLocaleDateString('fr-FR')}</p>
                            <p>Méthode: {reservation.paymentMethod === 'cash' ? 'Espèces' : reservation.paymentMethod === 'card' ? 'Carte' : 'Virement'}</p>
                            {reservation.paymentNotes && <p>Notes: {reservation.paymentNotes}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(reservation)}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm"
                            >
                              <Edit2 className="w-4 h-4 inline mr-1" />
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Êtes-vous sûr de vouloir annuler ce paiement ?')) {
                                  // Réinitialiser le statut de paiement
                                  recordPayment(reservation.id, undefined, { reset: true });
                                }
                              }}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm"
                            >
                              <X className="w-4 h-4 inline mr-1" />
                              Annuler paiement
                            </button>
                            <InvoiceButton reservation={{
                              ...reservation,
                              client: reservation.userName || 'Client',
                              email: reservation.userEmail
                            }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "fidelite" && (
            <AdminLoyaltyTab 
              clients={clients}
              reservations={reservations}
              loyaltyProfiles={loyaltyProfiles}
              setLoyaltyProfiles={setLoyaltyProfiles}
              onPointsAdd={(clientId, points) => {
                // Ajouter des points bonus
                // TODO: Implémenter updateLoyaltyProfile
                console.log('Points à ajouter:', clientId, points);
              }}
            />
          )}

          {/* Ancien code fidélité - désactivé */}
          {false && activeTab === "fidelite" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Gestion de la Fidélité & Anniversaires
              </h2>

              {/* ALERTES - Clients avec réductions disponibles */}
              {(() => {
                const clientsWithRewards = clients.filter(client => {
                  const clientReservations = reservations.filter(r => 
                    r.userEmail === client.email && r.status !== 'cancelled'
                  );
                  
                  const individualSessions = clientReservations.length;
                  const hasIndividualReward = individualSessions > 0 && individualSessions % 6 === 0;
                  
                  // Vérifier anniversaire ce mois
                  const currentMonth = new Date().getMonth();
                  const hasBirthday = client.birthdate && 
                    new Date(client.birthdate).getMonth() === currentMonth;
                  
                  return hasIndividualReward || hasBirthday;
                });

                if (clientsWithRewards.length > 0) {
                  return (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <AlertCircle className="w-6 h-6 text-green-600 animate-pulse" />
                          <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-lg">
                            {clientsWithRewards.length}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#2c3e50]">
                          Réductions à appliquer ! 🎉
                        </h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {clientsWithRewards.map(client => {
                          const clientReservations = reservations.filter(r => 
                            r.userEmail === client.email && r.status !== 'cancelled'
                          );
                          const sessionCount = clientReservations.length;
                          const has6Sessions = sessionCount > 0 && sessionCount % 6 === 0;
                          const currentMonth = new Date().getMonth();
                          const hasBirthday = client.birthdate && 
                            new Date(client.birthdate).getMonth() === currentMonth;
                          
                          return (
                            <div key={client.id} className="bg-white rounded-lg p-4 flex justify-between items-center border border-green-200">
                              <div className="flex-1">
                                <p className="font-semibold text-[#2c3e50]">{client.name}</p>
                                <p className="text-sm text-[#2c3e50]/60">{client.email}</p>
                                <div className="flex gap-2 mt-2">
                                  {has6Sessions && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                      ✓ 6 séances atteintes
                                    </span>
                                  )}
                                  {hasBirthday && (
                                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                                      🎂 Anniversaire ce mois
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {has6Sessions && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Appliquer -30€ pour ${client.name} (6 séances) ?`)) {
                                        alert(`Réduction de 30€ appliquée pour ${client.name}`);
                                        // TODO: Enregistrer la réduction appliquée
                                      }
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                                  >
                                    <Euro className="w-4 h-4" />
                                    -30€
                                  </button>
                                )}
                                {hasBirthday && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Appliquer -10€ pour ${client.name} (anniversaire) ?`)) {
                                        alert(`Réduction anniversaire de 10€ appliquée pour ${client.name}`);
                                        // TODO: Enregistrer la réduction appliquée
                                      }
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                                  >
                                    <Cake className="w-4 h-4" />
                                    -10€
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Rappel des règles simplifiées */}
              <div className="mb-6 grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4">
                  <User className="w-8 h-8 text-gray-600 mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">Nouveau</h3>
                  <p className="text-sm text-[#2c3e50]/70">0-4 séances</p>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4">
                  <Heart className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">Fidèle ❤️</h3>
                  <p className="text-sm text-[#2c3e50]/70">5-9 séances</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4">
                  <Award className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">Premium 💎</h3>
                  <p className="text-sm text-[#2c3e50]/70">10-19 séances</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4">
                  <Star className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">VIP ⭐</h3>
                  <p className="text-sm text-[#2c3e50]/70">20+ séances</p>
                </div>
              </div>
              
              {/* Règles de réduction */}
              <div className="mb-6 grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-4">
                  <Gift className="w-8 h-8 text-[#d4b5a0] mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">Soins Individuels</h3>
                  <p className="text-sm text-[#2c3e50]/70">6 séances = -30€ sur la 7ème</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4">
                  <CardIcon className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">Forfaits Premium</h3>
                  <p className="text-sm text-[#2c3e50]/70">2 forfaits = -50€ sur le 3ème</p>
                </div>
                <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-xl p-4">
                  <Cake className="w-8 h-8 text-red-500 mb-2" />
                  <h3 className="font-bold text-[#2c3e50] mb-1">Anniversaires</h3>
                  <p className="text-sm text-[#2c3e50]/70">-10€ le mois d'anniversaire</p>
                </div>
              </div>

              {/* Anniversaires du mois */}
              <div className="mb-8 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <Cake className="w-6 h-6 text-red-500" />
                  Anniversaires ce mois-ci
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Clients avec anniversaire ce mois */}
                  {(() => {
                    const currentMonth = new Date().getMonth();
                    const birthdayClients = clients.filter(client => {
                      if (!client.birthdate) return false;
                      const birthMonth = new Date(client.birthdate).getMonth();
                      return birthMonth === currentMonth;
                    });

                    if (birthdayClients.length === 0) {
                      return (
                        <p className="text-center text-[#2c3e50]/60 py-4 col-span-2">
                          Aucun anniversaire ce mois-ci
                        </p>
                      );
                    }

                    return birthdayClients.map((client) => {
                      const birthDate = new Date(client.birthdate!);
                      const day = birthDate.getDate();
                      const monthName = birthDate.toLocaleDateString('fr-FR', { month: 'long' });
                      
                      return (
                        <div key={client.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#2c3e50]">{client.name}</p>
                            <p className="text-sm text-[#2c3e50]/60">{day} {monthName}</p>
                            <p className="text-xs text-[#2c3e50]/50">{client.phone || 'Pas de téléphone'}</p>
                          </div>
                          <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                            -10€
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Cartes de fidélité actives */}
              <h3 className="text-lg font-bold text-[#2c3e50] mb-4">Progression des clients</h3>
              <div className="space-y-4">
                {clients.map((client) => {
                  // Compter les séances du client
                  const clientReservations = reservations.filter(r => 
                    r.userEmail === client.email && r.status !== 'cancelled'
                  );
                  const sessionCount = clientReservations.length;
                  
                  // Compter séparément les soins individuels et les forfaits
                  const individualSessions = clientReservations.filter(r => {
                    try {
                      const services = typeof r.services === 'string' ? JSON.parse(r.services || '[]') : r.services || [];
                      return !services.some((s: any) => 
                        typeof s === 'string' ? s.toLowerCase().includes('forfait') : 
                        s.name?.toLowerCase().includes('forfait')
                      );
                    } catch {
                      return true; // Compter comme session individuelle en cas d'erreur
                    }
                  }).length;
                  
                  const packages = clientReservations.filter(r => {
                    try {
                      const services = typeof r.services === 'string' ? JSON.parse(r.services || '[]') : r.services || [];
                      return services.some((s: any) => 
                        typeof s === 'string' ? s.toLowerCase().includes('forfait') : 
                        s.name?.toLowerCase().includes('forfait')
                      );
                    } catch {
                      return false; // Ne pas compter comme forfait en cas d'erreur
                    }
                  }).length;
                  
                  const progressTo6 = individualSessions % 6;
                  const progressTo2 = packages % 2;
                  const hasIndividualDiscount = individualSessions > 0 && individualSessions % 6 === 0;
                  const hasPackageDiscount = packages > 0 && packages % 2 === 0;
                  
                  // Vérifier si le client a des réductions disponibles
                  const isBirthday = client.birthdate && 
                    new Date(client.birthdate).getMonth() === new Date().getMonth() &&
                    new Date(client.birthdate).getDate() === new Date().getDate();
                  
                  const hasDiscount = hasIndividualDiscount || hasPackageDiscount || isBirthday;
                  
                  // Ne montrer que les clients qui ont au moins une séance
                  if (sessionCount === 0) return null;
                  
                  return (
                    <div key={client.id} className="border border-[#d4b5a0]/20 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-[#d4b5a0]" />
                            <span className="font-semibold text-lg text-[#2c3e50]">{client.name}</span>
                            {hasDiscount && (
                              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-bold animate-pulse">
                                Réduction disponible !
                              </span>
                            )}
                          </div>
                          <p className="text-[#2c3e50]/60">{client.email}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {hasIndividualDiscount && (
                            <button
                              onClick={() => applyDiscount(client.id, 30, '6 soins individuels effectués')}
                              className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all">
                              <Euro className="w-4 h-4 inline mr-2" />
                              -30€
                            </button>
                          )}
                          {hasPackageDiscount && (
                            <button
                              onClick={() => applyDiscount(client.id, 50, '2 forfaits effectués')}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                              <Euro className="w-4 h-4 inline mr-2" />
                              -50€
                            </button>
                          )}
                          {isBirthday && (
                            <button
                              onClick={() => applyDiscount(client.id, 10, 'Anniversaire')}
                              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                              <Euro className="w-4 h-4 inline mr-2" />
                              -10€
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Carte soins individuels */}
                        <div className="bg-[#fdfbf7] rounded-lg p-4">
                          <h4 className="font-semibold text-[#2c3e50] mb-2 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-[#d4b5a0]" />
                            Soins individuels
                          </h4>
                          <div className="flex gap-2 mb-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <div 
                                key={num}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  num <= progressTo6 ? 'bg-[#d4b5a0] text-white' : 'bg-white border border-[#d4b5a0]/30 text-[#d4b5a0]/50'
                                }`}
                              >
                                {num <= progressTo6 ? '✓' : num}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-[#2c3e50]/70">
                            {hasIndividualDiscount 
                              ? <span className="text-green-600 font-bold">Réduction de 30€ disponible !</span>
                              : progressTo6 === 5
                              ? <span className="text-green-600 font-bold">Prochaine visite : -30€ !</span>
                              : `${progressTo6}/6 soins`
                            }
                          </p>
                          {individualSessions > 6 && (
                            <p className="text-xs text-[#2c3e50]/50 mt-1">
                              Total: {individualSessions} soins effectués
                            </p>
                          )}
                        </div>

                        {/* Carte forfaits */}
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-[#2c3e50] mb-2 flex items-center gap-2">
                            <CardIcon className="w-4 h-4 text-purple-600" />
                            Forfaits
                          </h4>
                          <div className="flex gap-2 mb-2">
                            {[1, 2].map((num) => (
                              <div 
                                key={num}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  num <= progressTo2 ? 'bg-purple-600 text-white' : 'bg-white border border-purple-300 text-purple-300'
                                }`}
                              >
                                {num <= progressTo2 ? '✓' : num}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-[#2c3e50]/70">
                            {hasPackageDiscount 
                              ? <span className="text-purple-600 font-bold">Réduction de 50€ disponible !</span>
                              : progressTo2 === 1
                              ? <span className="text-purple-600 font-bold">Prochain forfait : -50€ !</span>
                              : `${progressTo2}/2 forfaits`
                            }
                          </p>
                          {packages > 2 && (
                            <p className="text-xs text-[#2c3e50]/50 mt-1">
                              Total: {packages} forfaits effectués
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "crm" && (
            <UnifiedCRMTab 
              clients={clients}
              setClients={setClients}
              loyaltyProfiles={loyaltyProfiles}
              reservations={reservations}
              onNewReservation={() => setShowNewReservationModal(true)}
            />
          )}

          {activeTab === "comptabilite" && (
            <AdminComptabiliteTab
              reservations={reservations}
              fetchReservations={fetchReservations}
              orders={orders}
              fetchOrders={fetchOrders}
            />
          )}

          {activeTab === "emailing" && (
            <EmailCompleteInterface />
          )}

          {false && activeTab === "OLD_CLIENTS" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Base Clients ({clients.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-[#2c3e50]">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-[#2c3e50]">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-[#2c3e50]">Téléphone</th>
                      <th className="text-center py-3 px-4 font-medium text-[#2c3e50]">Niveau</th>
                      <th className="text-center py-3 px-4 font-medium text-[#2c3e50]">Points</th>
                      <th className="text-center py-3 px-4 font-medium text-[#2c3e50]">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-[#2c3e50]">Visites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => {
                      const level = getLoyaltyLevel(client.loyaltyPoints, client.totalSpent);
                      return (
                        <tr key={client.id} className="border-b border-gray-100 hover:bg-[#fdfbf7]">
                          <td className="py-3 px-4 font-medium text-[#2c3e50]">{client.name}</td>
                          <td className="py-3 px-4 text-[#2c3e50]/70">{client.email}</td>
                          <td className="py-3 px-4 text-[#2c3e50]/70">{client.phone || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                              {level.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-[#2c3e50]">{client.loyaltyPoints}</td>
                          <td className="py-3 px-4 text-center font-medium text-[#d4b5a0]">{client.totalSpent}€</td>
                          <td className="py-3 px-4 text-center text-[#2c3e50]">{client.reservations}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {false && activeTab === "OLD_CRM" && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                CRM - Gestion Clients Détaillée
              </h2>

              <div className="space-y-6">
                {clients.map((client) => {
                  const [editingClient, setEditingClient] = useState<string | null>(null);
                  const [clientNotes, setClientNotes] = useState<{[key: string]: any}>({});
                  
                  return (
                    <div key={client.id} className="border border-[#d4b5a0]/20 rounded-xl overflow-hidden">
                      {/* Header Client */}
                      <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">{client.name}</h3>
                            <div className="flex gap-4 text-sm text-[#2c3e50]/70">
                              <span>📧 {client.email}</span>
                              <span>📱 {client.phone || 'Non renseigné'}</span>
                              <span>🎂 {client.birthdate || 'Non renseigné'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingClient(editingClient === client.id ? null : client.id)}
                            className="px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all"
                          >
                            {editingClient === client.id ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Informations détaillées */}
                      <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Informations médicales */}
                        <div>
                          <h4 className="font-medium text-[#2c3e50] mb-3 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            Informations Médicales
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-[#2c3e50]/60 block mb-1">Type de peau</label>
                              <select 
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                disabled={editingClient !== client.id}
                                value={clientNotes[client.id]?.skinType || 'normal'}
                              >
                                <option value="normal">Normale</option>
                                <option value="dry">Sèche</option>
                                <option value="oily">Grasse</option>
                                <option value="combination">Mixte</option>
                                <option value="sensitive">Sensible</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm text-[#2c3e50]/60 block mb-1">Allergies connues</label>
                              <textarea 
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                rows={2}
                                disabled={editingClient !== client.id}
                                placeholder="Aucune allergie connue"
                                value={clientNotes[client.id]?.allergies || ''}
                              />
                            </div>
                            <div>
                              <label className="text-sm text-[#2c3e50]/60 block mb-1">Notes médicales</label>
                              <textarea 
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                rows={3}
                                disabled={editingClient !== client.id}
                                placeholder="Antécédents, traitements en cours..."
                                value={clientNotes[client.id]?.medicalNotes || ''}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Préférences et Notes */}
                        <div>
                          <h4 className="font-medium text-[#2c3e50] mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Préférences & Notes
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-[#2c3e50]/60 block mb-1">Préférences soins</label>
                              <textarea 
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                rows={3}
                                disabled={editingClient !== client.id}
                                placeholder="Préfère les soins doux, n'aime pas les odeurs fortes..."
                                value={clientNotes[client.id]?.preferences || ''}
                              />
                            </div>
                            <div>
                              <label className="text-sm text-[#2c3e50]/60 block mb-1">Notes privées (visibles uniquement par vous)</label>
                              <textarea 
                                className="w-full p-2 border border-gray-200 rounded-lg bg-yellow-50"
                                rows={4}
                                disabled={editingClient !== client.id}
                                placeholder="Notes personnelles sur le client..."
                                value={clientNotes[client.id]?.adminNotes || ''}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Historique des soins */}
                      <div className="border-t border-gray-200 p-6">
                        <h4 className="font-medium text-[#2c3e50] mb-3">Historique des soins</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {reservations
                            .filter(r => r.userId === client.id && r.status === 'completed')
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((reservation) => (
                              <div key={reservation.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="text-sm font-medium text-[#2c3e50]">
                                    {new Date(reservation.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="text-sm text-[#2c3e50]/60 ml-3">
                                    {reservation.services.map(s => cleanServices[s as keyof typeof cleanServices]).join(', ')}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-[#d4b5a0]">{reservation.totalPrice}€</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Actions rapides */}
                      {editingClient === client.id && (
                        <div className="bg-gray-50 p-4 flex justify-end gap-2">
                          <button
                            onClick={() => setEditingClient(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => {
                              // Sauvegarder les données
                              alert('Données sauvegardées !');
                              setEditingClient(null);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            Sauvegarder
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Onglet Services */}
          {activeTab === "services" && <AdminServicesTab />}
          {activeTab === "products" && <AdminStockTab />}
          {activeTab === "pending" && <AdminPendingOrdersTab />}

          {activeTab === "whatsapp" && <WhatsAppHub />}

          {activeTab === "reviews" && <AdminReviewsManager />}

          {activeTab === "social-media" && (
            <SocialMediaHub />
          )}
        </div>

      {/* Modal Nouvelle Réservation */}
      {showNewReservationModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Si on clique sur le fond (backdrop) et pas sur le contenu
            if (e.target === e.currentTarget) {
              // Vérifier si des données ont été saisies
              const hasData = newReservation.client || newReservation.email ||
                             newReservation.phone || newReservation.services.length > 0 ||
                             newReservation.notes || giftCardCode || giftCardData;
              
              if (hasData) {
                // Demander confirmation avant de fermer
                if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                  setShowNewReservationModal(false);
                  localStorage.removeItem('preselectedClient');
                  // Réinitialiser le formulaire
                  setNewReservation({
                    client: '',
                    email: '',
                    phone: '',
                    date: formatDateLocal(new Date()),
                    time: '09:00',
                    services: [],
                    notes: ''
                  });
                  setGiftCardCode("");
                  setGiftCardData(null);
                  setGiftCardError("");
                }
              } else {
                // Pas de données, on peut fermer directement
                setShowNewReservationModal(false);
                localStorage.removeItem('preselectedClient');
                setGiftCardCode("");
                setGiftCardData(null);
                setGiftCardError("");
              }
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">Nouvelle réservation</h3>
            
            <div className="space-y-4">
              {/* Informations client */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Nom du client*</label>
                <input
                  type="text"
                  value={newReservation.client}
                  onChange={(e) => setNewReservation({...newReservation, client: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  placeholder="Marie Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Email</label>
                <input
                  type="email"
                  value={newReservation.email}
                  onChange={(e) => setNewReservation({...newReservation, email: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  placeholder="marie@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={newReservation.phone}
                  onChange={(e) => setNewReservation({...newReservation, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  placeholder="06 12 34 56 78"
                />
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Date*</label>
                  <input
                    type="date"
                    value={newReservation.date}
                    onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Heure*</label>
                  <select
                    value={newReservation.time}
                    onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  >
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Services*</label>
                <div className="space-y-2">
                  {dbServices && dbServices
                    .filter(service => service.active)
                    .sort((a, b) => {
                      // Ordre personnalisé : Hydro'Naissance en 1er, Hydro'Cleaning en 2e
                      const order = {
                        'hydro-naissance': 1,
                        'hydro-cleaning': 2,
                        'renaissance': 3,
                        'bb-glow': 4,
                        'led-therapie': 5
                      };
                      const aOrder = order[a.slug as keyof typeof order] || 999;
                      const bOrder = order[b.slug as keyof typeof order] || 999;
                      return aOrder - bOrder;
                    })
                    .map((service) => (
                      <label key={service.slug} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newReservation.services.includes(service.slug)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewReservation({
                                ...newReservation,
                                services: [...newReservation.services, service.slug]
                              });
                            } else {
                              setNewReservation({
                                ...newReservation,
                                services: newReservation.services.filter(s => s !== service.slug)
                              });
                            }
                          }}
                          className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                        />
                        <span className="text-sm text-[#2c3e50]">{service.name}</span>
                        <span className="text-xs text-[#2c3e50]/60 ml-auto">
                          {service.duration} min - {service.promoPrice || service.price}€
                        </span>
                      </label>
                    ))
                  }
                </div>
              </div>

              {/* Carte Cadeau */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Code Carte Cadeau (optionnel)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none uppercase"
                    placeholder="GIFT-XXXX-XXXX"
                    maxLength={14}
                  />
                  <button
                    onClick={verifyGiftCard}
                    disabled={isVerifyingGiftCard || !giftCardCode.trim()}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingGiftCard ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>

                {/* Message d'erreur */}
                {giftCardError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{giftCardError}</p>
                  </div>
                )}

                {/* Carte valide */}
                {giftCardData?.valid && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-green-800">✓ Carte valide</span>
                      <span className="text-sm font-bold text-green-600">{giftCardData.balance}€</span>
                    </div>
                    {giftCardData.expired && (
                      <div className="mb-2 p-2 bg-orange-100 border border-orange-300 rounded">
                        <p className="text-xs text-orange-700 font-medium">⚠️ {giftCardData.warning}</p>
                      </div>
                    )}
                    <p className="text-xs text-green-600">
                      Expire le {new Date(giftCardData.giftCard.expiryDate).toLocaleDateString('fr-FR')}
                    </p>
                    {newReservation.services.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-700">Montant déduit :</span>
                          <span className="font-semibold text-green-800">
                            {Math.min(
                              giftCardData.balance,
                              newReservation.services.reduce((sum, serviceSlug) => {
                                const service = dbServices.find(s => s.slug === serviceSlug);
                                return sum + (service ? (service.promoPrice || service.price) : 0);
                              }, 0)
                            )}€
                          </span>
                        </div>
                        {giftCardData.balance < newReservation.services.reduce((sum, serviceSlug) => {
                          const service = dbServices.find(s => s.slug === serviceSlug);
                          return sum + (service ? (service.promoPrice || service.price) : 0);
                        }, 0) && (
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-700">Reste à payer :</span>
                            <span className="font-semibold text-orange-600">
                              {newReservation.services.reduce((sum, serviceSlug) => {
                                const service = dbServices.find(s => s.slug === serviceSlug);
                                return sum + (service ? (service.promoPrice || service.price) : 0);
                              }, 0) - giftCardData.balance}€
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Notes</label>
                <textarea
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
              </div>

              {/* Prix total */}
              {newReservation.services.length > 0 && (
                <div className="bg-[#d4b5a0]/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#2c3e50]">Prix total</span>
                    <span className="text-xl font-bold text-[#d4b5a0]">
                      {newReservation.services.reduce((sum, serviceSlug) => {
                        const service = dbServices.find(s => s.slug === serviceSlug);
                        return sum + (service ? (service.promoPrice || service.price) : 0);
                      }, 0)}€
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewReservationModal(false);
                  setGiftCardCode("");
                  setGiftCardData(null);
                  setGiftCardError("");
                }}
                className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createNewReservation}
                disabled={!newReservation.client || newReservation.services.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer la réservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Réservation */}
      {showEditReservationModal && editingReservation && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Si on clique sur le fond (backdrop)
            if (e.target === e.currentTarget) {
              // Vérifier si des modifications ont été faites
              const originalReservation = reservations.find(r => r.id === editingReservation.id);
              const hasChanges = originalReservation && (
                originalReservation.userName !== editingReservation.userName ||
                originalReservation.userEmail !== editingReservation.userEmail ||
                originalReservation.phone !== editingReservation.phone ||
                originalReservation.date !== editingReservation.date ||
                originalReservation.time !== editingReservation.time ||
                originalReservation.notes !== editingReservation.notes ||
                JSON.stringify(originalReservation.services) !== JSON.stringify(editingReservation.services)
              );
              
              if (hasChanges) {
                // Demander confirmation avant de fermer
                if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?')) {
                  setShowEditReservationModal(false);
                  setEditingReservation(null);
                }
              } else {
                // Pas de modifications, on peut fermer directement
                setShowEditReservationModal(false);
                setEditingReservation(null);
              }
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">Modifier la réservation</h3>
            
            <div className="space-y-4">
              {/* Informations client */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Nom du client</label>
                <input
                  type="text"
                  value={editingReservation.client}
                  onChange={(e) => setEditingReservation({...editingReservation, client: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Email</label>
                <input
                  type="email"
                  value={editingReservation.email}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editingReservation.phone}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Date*</label>
                  <input
                    type="date"
                    value={editingReservation.date}
                    onChange={(e) => setEditingReservation({...editingReservation, date: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Heure*</label>
                  <select
                    value={editingReservation.time}
                    onChange={(e) => setEditingReservation({...editingReservation, time: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  >
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Services*</label>
                <div className="space-y-2">
                  {Object.entries(services).map(([key, name]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingReservation.services.includes(key)}
                        onChange={(e) => {
                          let newServices;
                          if (e.target.checked) {
                            newServices = [...editingReservation.services, key];
                          } else {
                            newServices = editingReservation.services.filter((s: string) => s !== key);
                          }
                          
                          const newTotalPrice = calculateTotalPrice(newServices);
                          
                          setEditingReservation({
                            ...editingReservation,
                            services: newServices,
                            totalPrice: newTotalPrice
                          });
                        }}
                        className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                      />
                      <span className="text-sm text-[#2c3e50]">{String(name)}</span>
                      <span className="text-xs text-[#2c3e50]/60 ml-auto">
                        {key === 'hydro-naissance' && '90€'}
                        {key === 'hydro-cleaning' && '70€'}
                        {key === 'renaissance' && '70€'}
                        {key === 'bb-glow' && '70€'}
                        {key === 'led-therapie' && '50€'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">Notes</label>
                <textarea
                  value={editingReservation.notes}
                  onChange={(e) => setEditingReservation({...editingReservation, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
              </div>

              {/* Prix total */}
              <div className="bg-[#d4b5a0]/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#2c3e50]">Prix total</span>
                  <span className="text-xl font-bold text-[#d4b5a0]">
                    {editingReservation.totalPrice}€
                  </span>
                </div>
                {/* Afficher si la réservation est payée */}
                {(() => {
                  const currentReservation = reservations.find(r => r.id === editingReservation.id);
                  if (currentReservation?.paymentStatus === 'paid') {
                    const difference = editingReservation.totalPrice - (currentReservation.paymentAmount || currentReservation.totalPrice);
                    return (
                      <div className="mt-3 pt-3 border-t border-[#d4b5a0]/20">
                        <p className="text-sm text-[#2c3e50]/70">
                          Montant déjà payé: <span className="font-semibold">{currentReservation.paymentAmount || currentReservation.totalPrice}€</span>
                        </p>
                        {difference !== 0 && (
                          <p className="text-sm mt-1">
                            {difference > 0 ? (
                              <span className="text-orange-600 font-semibold">
                                Complément à payer: {difference}€
                              </span>
                            ) : (
                              <span className="text-green-600 font-semibold">
                                À rembourser: {Math.abs(difference)}€
                              </span>
                            )}
                          </p>
                        )}
                        <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            ⚠️ La modification d'une réservation payée nécessitera un ajustement du paiement
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditReservationModal(false);
                  setEditingReservation(null);
                }}
                className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={updateReservation}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals de détails pour les statistiques */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#2c3e50]">
                  {showDetailsModal === 'total' && 'Toutes les réservations'}
                  {showDetailsModal === 'pending' && 'Réservations en attente'}
                  {showDetailsModal === 'completed' && 'Réservations terminées aujourd\'hui'}
                  {showDetailsModal === 'revenue' && 'Détails des revenus'}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Liste des réservations totales */}
              {showDetailsModal === 'total' && (
                <div className="space-y-3">
                  {reservations.map(reservation => (
                    <div key={reservation.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#2c3e50]">{reservation.userName}</p>
                          <p className="text-sm text-gray-600">{new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}</p>
                          <p className="text-sm text-gray-500">
                            {(typeof reservation.services === 'string' ? JSON.parse(reservation.services) : reservation.services)
                              .map((s: string) => cleanServices[s as keyof typeof cleanServices] || s).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {reservation.status === 'confirmed' ? 'Confirmé' :
                             reservation.status === 'pending' ? 'En attente' :
                             reservation.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                          </span>
                          <p className="text-sm font-bold text-[#2c3e50] mt-2">{reservation.totalPrice}€</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Liste des réservations en attente */}
              {showDetailsModal === 'pending' && (
                <div className="space-y-3">
                  {reservations.filter(r => r.status === 'pending').map(reservation => (
                    <div key={reservation.id} className="bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#2c3e50]">{reservation.userName}</p>
                          <p className="text-sm text-gray-600">{new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}</p>
                          <p className="text-sm text-gray-500">
                            {(typeof reservation.services === 'string' ? JSON.parse(reservation.services) : reservation.services)
                              .map((s: string) => cleanServices[s as keyof typeof cleanServices] || s).join(', ')}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">📱 {reservation.phone}</p>
                        </div>
                        <button
                          onClick={() => {
                            setReservationToValidate(reservation);
                            setShowValidationModal(true);
                            setShowDetailsModal(null);
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                        >
                          Confirmer
                        </button>
                      </div>
                    </div>
                  ))}
                  {reservations.filter(r => r.status === 'pending').length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucune réservation en attente</p>
                  )}
                </div>
              )}

              {/* Liste des réservations terminées aujourd'hui */}
              {showDetailsModal === 'completed' && (
                <div className="space-y-3">
                  {reservations
                    .filter(r => r.status === 'completed' && 
                      new Date(r.date).toDateString() === new Date().toDateString())
                    .map(reservation => (
                    <div key={reservation.id} className="bg-green-50 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#2c3e50]">{reservation.userName}</p>
                          <p className="text-sm text-gray-600">Terminé à {reservation.time}</p>
                          <p className="text-sm text-gray-500">
                            {(typeof reservation.services === 'string' ? JSON.parse(reservation.services) : reservation.services)
                              .map((s: string) => cleanServices[s as keyof typeof cleanServices] || s).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{reservation.totalPrice}€</p>
                          {reservation.paymentStatus === 'paid' && (
                            <span className="text-xs text-green-600">✓ Payé</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Détails des revenus */}
              {showDetailsModal === 'revenue' && (
                <div>
                  {/* Vue d'ensemble des périodes */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <p className="text-sm text-gray-600">Aujourd'hui</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {reservations
                          .filter(r => r.paymentStatus === 'paid' && 
                            new Date(r.paymentDate || r.date).toDateString() === new Date().toDateString())
                          .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        {reservations.filter(r => r.paymentStatus === 'paid' && 
                          new Date(r.paymentDate || r.date).toDateString() === new Date().toDateString()).length} paiements
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <p className="text-sm text-gray-600">Cette semaine</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reservations
                          .filter(r => {
                            if (r.paymentStatus !== 'paid') return false;
                            const payDate = new Date(r.paymentDate || r.date);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return payDate >= weekAgo;
                          })
                          .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        {reservations.filter(r => {
                          if (r.paymentStatus !== 'paid') return false;
                          const payDate = new Date(r.paymentDate || r.date);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return payDate >= weekAgo;
                        }).length} paiements
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <p className="text-sm text-gray-600">Ce mois</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {reservations
                          .filter(r => {
                            if (r.paymentStatus !== 'paid') return false;
                            const payDate = new Date(r.paymentDate || r.date);
                            return payDate.getMonth() === new Date().getMonth() && 
                                   payDate.getFullYear() === new Date().getFullYear();
                          })
                          .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                      </p>
                      <p className="text-xs text-purple-500 mt-1">
                        {reservations.filter(r => {
                          if (r.paymentStatus !== 'paid') return false;
                          const payDate = new Date(r.paymentDate || r.date);
                          return payDate.getMonth() === new Date().getMonth() && 
                                 payDate.getFullYear() === new Date().getFullYear();
                        }).length} paiements
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                      <p className="text-sm text-gray-600">Total année</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {reservations
                          .filter(r => {
                            if (r.paymentStatus !== 'paid') return false;
                            const payDate = new Date(r.paymentDate || r.date);
                            return payDate.getFullYear() === new Date().getFullYear();
                          })
                          .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                      </p>
                      <p className="text-xs text-orange-500 mt-1">
                        {reservations.filter(r => {
                          if (r.paymentStatus !== 'paid') return false;
                          const payDate = new Date(r.paymentDate || r.date);
                          return payDate.getFullYear() === new Date().getFullYear();
                        }).length} paiements
                      </p>
                    </div>
                  </div>

                  {/* Statistiques par méthode de paiement */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-[#2c3e50] mb-3">Répartition par méthode de paiement</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <p className="text-sm text-gray-600">Carte bancaire</p>
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                          {reservations
                            .filter(r => r.paymentStatus === 'paid' && r.paymentMethod === 'card')
                            .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-gray-600">Espèces</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          {reservations
                            .filter(r => r.paymentStatus === 'paid' && r.paymentMethod === 'cash')
                            .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="w-4 h-4 text-purple-600" />
                          <p className="text-sm text-gray-600">Virement</p>
                        </div>
                        <p className="text-xl font-bold text-purple-600">
                          {reservations
                            .filter(r => r.paymentStatus === 'paid' && r.paymentMethod === 'transfer')
                            .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice), 0).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services les plus rentables */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-[#2c3e50] mb-3">Services les plus rentables</h3>
                    <div className="space-y-2">
                      {(() => {
                        const serviceRevenues: {[key: string]: number} = {};
                        reservations
                          .filter(r => r.paymentStatus === 'paid')
                          .forEach(r => {
                            const servicesList = typeof r.services === 'string' ? JSON.parse(r.services) : r.services;
                            servicesList.forEach((s: string) => {
                              const serviceName = cleanServices[s as keyof typeof cleanServices] || s;
                              serviceRevenues[serviceName] = (serviceRevenues[serviceName] || 0) + (r.totalPrice / servicesList.length);
                            });
                          });
                        
                        return Object.entries(serviceRevenues)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([service, revenue]) => (
                            <div key={service} className="flex justify-between items-center bg-white p-2 rounded">
                              <span className="text-sm">{service}</span>
                              <span className="font-bold text-[#2c3e50]">{Math.round(revenue)}€</span>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>

                  {/* Détails fiscaux */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-[#2c3e50] mb-3">Détails fiscaux (TVA 20%)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total HT</p>
                        <p className="text-xl font-bold">
                          {Math.round(stats.totalRevenue / 1.2)}€
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">TVA collectée</p>
                        <p className="text-xl font-bold">
                          {Math.round(stats.totalRevenue - (stats.totalRevenue / 1.2))}€
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total TTC</p>
                        <p className="text-xl font-bold text-purple-600">
                          {stats.totalRevenue}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Historique détaillé des transactions */}
                  <div>
                    <h3 className="font-bold text-[#2c3e50] mb-3">Historique complet des transactions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Client</th>
                            <th className="text-left p-2">Service</th>
                            <th className="text-left p-2">Méthode</th>
                            <th className="text-right p-2">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations
                            .filter(r => r.paymentStatus === 'paid')
                            .sort((a, b) => new Date(b.paymentDate || b.date).getTime() - new Date(a.paymentDate || a.date).getTime())
                            .map(reservation => (
                            <tr key={reservation.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                {new Date(reservation.paymentDate || reservation.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="p-2">{reservation.userName}</td>
                              <td className="p-2 text-xs">
                                {(typeof reservation.services === 'string' ? JSON.parse(reservation.services) : reservation.services)
                                  .map((s: string) => cleanServices[s as keyof typeof cleanServices] || s)
                                  .join(', ')
                                  .substring(0, 30)}...
                              </td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  reservation.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                                  reservation.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {reservation.paymentMethod === 'card' ? 'CB' :
                                   reservation.paymentMethod === 'cash' ? 'Espèces' : 'Virement'}
                                </span>
                              </td>
                              <td className="p-2 text-right font-bold">
                                {reservation.paymentAmount || reservation.totalPrice}€
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bouton export - uniquement pour ADMIN */}
                  {(userRole === 'ADMIN' || userRole === 'admin') && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => exportPayments('detailed')}
                        className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Exporter en CSV
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de validation et paiement */}
      {showValidationModal && reservationToValidate && (
        <ValidationPaymentModal
          reservation={reservationToValidate}
          isOpen={showValidationModal}
          onClose={() => {
            setShowValidationModal(false);
            setReservationToValidate(null);
          }}
          onValidate={handleValidationPayment}
          loyaltyProfile={loyaltyProfiles.find(p => p.userId === reservationToValidate.userId)}
        />
      )}

      {/* Modal de recherche avancée */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onResultSelect={(result) => {
            // Gérer la sélection d'un résultat
            if (result.type === 'client') {
              setActiveTab('crm');
            } else if (result.type === 'reservation') {
              setActiveTab('planning');
            } else if (result.type === 'service') {
              setActiveTab('services');
            }
            setShowAdvancedSearch(false);
          }}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {/* Modal de planification de commande */}
      {showScheduleModal && orderToSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
              Planifier la commande
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Client:</strong> {orderToSchedule.user?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Commande:</strong>
              </p>
              <ul className="text-sm text-gray-700 ml-4 list-disc">
                {JSON.parse(orderToSchedule.items || '[]').map((item: any, idx: number) => (
                  <li key={idx}>{item.quantity}x {item.name} - {item.price}€</li>
                ))}
              </ul>
              <p className="text-sm font-bold text-green-600 mt-2">
                Total: {orderToSchedule.totalAmount}€
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Date*</label>
                  <input
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Heure*</label>
                  <select
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                  >
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setOrderToSchedule(null);
                    setScheduleData({ date: formatDateLocal(new Date()), time: '09:00' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={scheduleOrder}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </AuthGuard>
  );
}