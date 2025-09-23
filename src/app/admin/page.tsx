"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, XCircle, Gift, User, Award, TrendingUp, UserCheck, Settings, Euro, Edit2, Save, FileText, Heart, AlertCircle, CreditCard, Download, Receipt, LogOut, MapPin, Phone, Mail, Instagram, Globe, Grid3x3, List, Cake, CreditCard as CardIcon, Star, MessageCircle, Send, X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AdminCalendarEnhanced from "@/components/AdminCalendarEnhanced";
import AdminServicesTab from "@/components/AdminServicesTab";
import AdminDashboardOptimized from "@/components/AdminDashboardOptimized";
import UnifiedCRMTab, { type Client } from "@/components/UnifiedCRMTab";
import PlanningCalendar from "@/components/PlanningCalendar";
import AdminDisponibilitesTabSync from "@/components/AdminDisponibilitesTabSync";
import { InvoiceButton } from "@/components/InvoiceGenerator";
import PaymentSectionEnhanced from "@/components/PaymentSectionEnhanced";
import WhatsAppManager from "@/components/WhatsAppManager";
import WhatsAppSetup from "@/components/WhatsAppSetup";
import WhatsAppTestPanel from "@/components/WhatsAppTestPanel";
import WhatsAppInterface from "@/components/WhatsAppInterface";
import WhatsAppHub from "@/components/WhatsAppHub";
import AdminLoyaltyTab from "@/components/AdminLoyaltyTab";
import WhatsAppHistory from "@/components/WhatsAppHistory";
import AdminStatsEnhanced from "@/components/AdminStatsEnhanced";
import AdminReviewsManager from "@/components/AdminReviewsManager";
import ClientSegmentation from "@/components/ClientSegmentation";
import EmailingInterface from "@/components/EmailingInterface";
import SourceStats from "@/components/SourceStats";
import RevenueAnalytics from "@/components/RevenueAnalytics";
import ReservationTableAdvanced from "@/components/ReservationTableAdvanced";
import QuickActionModal from "@/components/QuickActionModal";
import { logout } from "@/lib/auth-client";
import { servicePricing, getCurrentPrice, calculateTotalPrice } from "@/lib/pricing";
import ValidationPaymentModal from "@/components/ValidationPaymentModal";

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
  const [useOptimizedView, setUseOptimizedView] = useState(false); // Dashboard classique pour l'instant
  const [activeTab, setActiveTab] = useState("stats");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
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
  const [newReservation, setNewReservation] = useState({
    client: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    services: [] as string[],
    notes: ''
  });
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Services par défaut (au cas où la BDD est vide)
  const defaultServices = {
    "hydro-naissance": "Hydro'Naissance",
    "hydro-cleaning": "Hydro'Cleaning",
    "renaissance": "Renaissance",
    "bb-glow": "BB Glow",
    "led-therapie": "LED Thérapie"
  };

  // Utiliser les services de la BDD ou les services par défaut
  const services = dbServices.length > 0 
    ? Object.fromEntries(dbServices.map(s => [s.id, s.name]))
    : defaultServices;

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.push('/login');
        return;
      }

      const userInfo = JSON.parse(user);
      if (userInfo.role !== 'admin') {
        router.push('/espace-client');
        return;
      }

      fetchReservations();
      fetchClients();
      fetchLoyaltyProfiles();
      fetchServices();
    };

    checkAuth();
    
    // Rafraîchir les réservations toutes les 30 secondes pour vérifier les nouvelles
    const interval = setInterval(() => {
      fetchReservations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [router]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDbServices(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${clientId}/bonus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points })
      });

      if (response.ok) {
        // Rafraîchir les données
        fetchClients();
        alert(`${points} points bonus ajoutés avec succès !`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des points:', error);
    }
  };

  const openEditModal = (reservation: Reservation) => {
    setEditingReservation({
      id: reservation.id,
      client: reservation.userName || '',
      email: reservation.userEmail || '',
      phone: reservation.phone || '',
      date: typeof reservation.date === 'string' ? reservation.date.split('T')[0] : reservation.date.toISOString().split('T')[0],
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

  const createNewReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Calculer le prix total en fonction des services sélectionnés
      const totalPrice = calculateTotalPrice(newReservation.services, true); // true pour tarif lancement

      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newReservation,
          totalPrice,
          status: 'confirmed',
          source: 'admin'
        })
      });

      if (response.ok) {
        setShowNewReservationModal(false);
        setNewReservation({
          client: '',
          email: '',
          phone: '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          services: [],
          notes: ''
        });
        fetchReservations();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
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
            .map((s: string) => services[s as keyof typeof services] || s).join(', ');
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
        : new Date().toISOString().split('T')[0];
      link.download = `livre_recettes_${dateRange}.csv`;
      link.click();
      
    } else {
      // Export simple existant
      const headers = ['Date', 'Client', 'Services', 'Montant TTC', 'Méthode', 'Facture', 'Notes'];
      const rows = paidReservations
        .map(r => [
          new Date(r.paymentDate || '').toLocaleDateString('fr-FR'),
          r.userName || '',
          (typeof r.services === 'string' ? JSON.parse(r.services) : r.services).map((s: string) => services[s as keyof typeof services]).join(', '),
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
      link.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
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
    (typeof r.date === 'string' ? r.date.split('T')[0] : r.date.toISOString().split('T')[0]) === selectedDate
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Statistiques pour le dashboard
  const stats = {
    totalReservations: reservations.length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    completedToday: reservations.filter(r => 
      r.status === 'completed' && (typeof r.date === 'string' ? r.date.split('T')[0] : r.date.toISOString().split('T')[0]) === new Date().toISOString().split('T')[0]
    ).length,
    totalRevenue: reservations.filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
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
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/');
              }}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-4">
              <p className="text-sm text-[#2c3e50]/60 mb-1">Réservations totales</p>
              <p className="text-2xl font-bold text-[#2c3e50]">{stats.totalReservations}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <p className="text-sm text-[#2c3e50]/60 mb-1">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReservations}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <p className="text-sm text-[#2c3e50]/60 mb-1">Terminés aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-[#2c3e50]/60 mb-1">Revenus totaux</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue}€</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
              activeTab === "stats"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab("planning")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap relative flex-shrink-0 text-sm sm:text-base ${
              activeTab === "planning"
                ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                : "bg-white text-[#2c3e50] hover:shadow-md"
            }`}
          >
            Planning du jour
            {reservations.filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full animate-pulse">
                {reservations.filter(r => r.status === 'pending').length}
              </span>
            )}
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
            Gestion Fidélité
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
                return (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                    {clientsWithRewards.length}
                  </span>
                );
              }
              return null;
            })()}
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
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === "stats" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
                Tableau de bord et statistiques
              </h2>
              
              {/* Analyse du chiffre d'affaires en premier */}
              <RevenueAnalytics 
                reservations={reservations.map(r => ({
                  ...r,
                  totalPrice: r.totalPrice || 0,
                  paymentStatus: r.paymentStatus || 'pending',
                  paymentDate: r.paymentDate || null,
                  services: r.services || []
                }))} 
                services={services}
              />
              
              {/* Évolution des revenus */}
              <AdminStatsEnhanced />
              
              {/* Statistiques des sources */}
              <SourceStats reservations={reservations} />
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
              
              {/* Section nouvelles réservations en attente */}
              {reservations.filter(r => r.status === 'pending').length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Nouvelles réservations à valider ({reservations.filter(r => r.status === 'pending').length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {reservations
                      .filter(r => r.status === 'pending')
                      .slice(0, 4)
                      .map((reservation) => (
                        <div key={reservation.id} className="bg-white rounded-lg p-4 border border-yellow-200">
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
                            {reservation.services.map((s: string) => services[s as keyof typeof services] || s).join(', ')}
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
                  </div>
                  {reservations.filter(r => r.status === 'pending').length > 4 && (
                    <div className="mt-4 text-center text-sm text-[#2c3e50]/60">
                      Affichez uniquement les 4 premières réservations en attente.
                      <br />Total : {reservations.filter(r => r.status === 'pending').length} réservations à valider
                    </div>
                  )}
                </div>
              )}

              {/* Afficher le contenu selon le sous-onglet */}
              {planningSubTab === 'calendar' && (
                <>
                  <PlanningCalendar 
                    reservations={reservations
                      .filter(r => r.status !== 'cancelled')
                      .map(r => ({
                        ...r,
                        date: typeof r.date === 'string' ? r.date : r.date.toISOString(),
                        userName: r.userName || 'Client',
                        userEmail: r.userEmail || '',
                        serviceName: r.services && r.services.length > 0 
                          ? r.services.map((s: string) => services[s as keyof typeof services] || s).join(', ')
                          : 'Service non défini',
                        serviceDuration: r.services && r.services.length > 0
                          ? r.services.reduce((total: number, serviceId: string) => {
                              const service = dbServices.find(s => s.id === serviceId);
                              return total + (service?.duration || 60);
                            }, 0)
                          : 60
                      }))}
                    services={services}
                    dbServices={dbServices}
                    onNewReservation={() => setShowNewReservationModal(true)}
                    onDateClick={(date) => {
                      setQuickActionDate(date);
                      setShowQuickActionModal(true);
                    }}
                  />
                  
                  {/* Modal de création rapide */}
                  {showQuickActionModal && quickActionDate && (
                    <QuickActionModal
                      date={quickActionDate}
                      onClose={() => setShowQuickActionModal(false)}
                      dbServices={dbServices}
                      onCreateReservation={async (data) => {
                        // Créer la réservation
                        await fetch('/api/admin/reservations', {
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
                      services={services}
                      existingClients={clients}
                    />
                  )}
                </>
              )}
              
              {planningSubTab === 'availability' && (
                <div className="space-y-6">
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
                        {reservation.isSubscription && (
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
                                {services[serviceId as keyof typeof services]}
                                {reservation.packages && reservation.packages[serviceId] === 'forfait' && (
                                  <span className="ml-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                    Forfait 4 séances
                                  </span>
                                )}
                                {reservation.packages && reservation.packages[serviceId] === 'abonnement' && (
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
                    services={services}
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
                                    services[s as keyof typeof services] || s
                                  ).join(', ');
                                } else {
                                  return reservation.services || 'Service non spécifié';
                                }
                              } catch {
                                // Si ce n'est pas du JSON, c'est probablement une chaîne simple
                                if (typeof reservation.services === 'string' && reservation.services in services) {
                                  return services[reservation.services as keyof typeof services];
                                }
                                return reservation.services || 'Service non spécifié';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[#d4b5a0] block mb-2">{reservation.totalPrice}€</span>
                        <span className="text-sm text-green-600">
                          +{Math.floor(reservation.totalPrice / 10)} points
                        </span>
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
                          ✓ Soin effectué - Points attribués
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
                                      services[s as keyof typeof services] || s
                                    ).join(', ');
                                  } else {
                                    return reservation.services || 'Service non spécifié';
                                  }
                                } catch {
                                  if (typeof reservation.services === 'string' && reservation.services in services) {
                                    return services[reservation.services as keyof typeof services];
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
                          setPaymentDateStart(today.toISOString().split('T')[0]);
                          setPaymentDateEnd(today.toISOString().split('T')[0]);
                          break;
                        case 'yesterday':
                          start.setDate(today.getDate() - 1);
                          setPaymentDateStart(start.toISOString().split('T')[0]);
                          setPaymentDateEnd(start.toISOString().split('T')[0]);
                          break;
                        case 'week':
                          start.setDate(today.getDate() - 7);
                          setPaymentDateStart(start.toISOString().split('T')[0]);
                          setPaymentDateEnd(today.toISOString().split('T')[0]);
                          break;
                        case 'month':
                          start.setMonth(today.getMonth() - 1);
                          setPaymentDateStart(start.toISOString().split('T')[0]);
                          setPaymentDateEnd(today.toISOString().split('T')[0]);
                          break;
                        case 'quarter':
                          start.setMonth(today.getMonth() - 3);
                          setPaymentDateStart(start.toISOString().split('T')[0]);
                          setPaymentDateEnd(today.toISOString().split('T')[0]);
                          break;
                        case 'year':
                          start.setFullYear(today.getFullYear() - 1);
                          setPaymentDateStart(start.toISOString().split('T')[0]);
                          setPaymentDateEnd(today.toISOString().split('T')[0]);
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
                                ? servicesList.map((s: string) => services[s as keyof typeof services] || s).join(', ')
                                : reservation.services;
                            } catch {
                              // Si ce n'est pas du JSON, c'est probablement une chaîne simple
                              if (typeof reservation.services === 'string' && reservation.services in services) {
                                return services[reservation.services as keyof typeof services];
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
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
            />
          )}

          {activeTab === "emailing" && (
            <EmailingInterface />
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
                                    {reservation.services.map(s => services[s as keyof typeof services]).join(', ')}
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
          
          {activeTab === "whatsapp" && <WhatsAppHub />}
          
          {activeTab === "reviews" && <AdminReviewsManager />}
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
                             newReservation.notes;
              
              if (hasData) {
                // Demander confirmation avant de fermer
                if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                  setShowNewReservationModal(false);
                  // Réinitialiser le formulaire
                  setNewReservation({
                    client: '',
                    email: '',
                    phone: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '09:00',
                    services: [],
                    notes: '',
                    status: 'confirmed',
                    source: 'admin',
                    totalPrice: 0
                  });
                }
              } else {
                // Pas de données, on peut fermer directement
                setShowNewReservationModal(false);
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
                onClick={() => setShowNewReservationModal(false)}
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
                          
                          const newTotalPrice = calculateTotalPrice(newServices, true); // true pour tarif lancement
                          
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
      </div>
    </div>
    </AuthGuard>
  );
}