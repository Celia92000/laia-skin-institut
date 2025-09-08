"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, Phone, Mail, MessageCircle, Edit, X, Download, Instagram, ChevronRight } from "lucide-react";
import { useSearchParams } from 'next/navigation';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);

  const services = {
    "hydro-naissance": { name: "Hydro'Naissance", icon: "👑" },
    "hydro": { name: "Hydro'Cleaning", icon: "💧" },
    "renaissance": { name: "Renaissance", icon: "✨" },
    "bbglow": { name: "BB Glow", icon: "🌟" },
    "led": { name: "LED Thérapie", icon: "💡" }
  };

  useEffect(() => {
    const reservationId = searchParams.get('id');
    if (reservationId) {
      fetchReservation(reservationId);
    }
  }, [searchParams]);

  const fetchReservation = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservation(data);
        
        // Envoyer l'email de confirmation
        await sendConfirmationEmail(data);
        
        // Préparer le message WhatsApp
        prepareWhatsAppMessage(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = async (reservationData: any) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: reservationData.user.email,
          subject: 'Confirmation de votre réservation - Laia Skin',
          reservation: reservationData
        })
      });
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  };

  const prepareWhatsAppMessage = (reservationData: any) => {
    const date = new Date(reservationData.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const servicesList = JSON.parse(reservationData.services)
      .map((s: string) => services[s as keyof typeof services]?.name)
      .join(', ');
    
    const message = `Bonjour ${reservationData.user.name} ! 

✨ Votre réservation chez Laia Skin est confirmée :

📅 Date : ${date}
🕐 Heure : ${reservationData.time}
💆 Soins : ${servicesList}
💰 Prix : ${reservationData.totalPrice}€

📍 Adresse complète :
Laia Skin Institut
5 allée Jean de la Fontaine
92000 Nanterre
Bâtiment 5, 2ème étage, Porte 523

🚇 À 6 minutes à pied de la gare de Nanterre Université

Pour confirmer : Répondez OUI
Pour reprogrammer : Répondez MODIFIER

Au plaisir de vous accueillir !
Laia Skin Institut 🌸`;

    // Stocker le message pour l'utiliser dans le bouton WhatsApp
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('whatsappMessage', encodeURIComponent(message));
    }
  };

  const openWhatsApp = () => {
    const phone = "33612345678"; // Remplacer par votre numéro
    const message = localStorage.getItem('whatsappMessage') || '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const addToCalendar = () => {
    if (!reservation) return;
    
    const startDate = new Date(reservation.date);
    startDate.setHours(parseInt(reservation.time.split(':')[0]));
    startDate.setMinutes(parseInt(reservation.time.split(':')[1]));
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1, endDate.getMinutes() + 30);
    
    const servicesList = JSON.parse(reservation.services)
      .map((s: string) => services[s as keyof typeof services]?.name)
      .join(', ');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Laia Skin - ${servicesList}
DESCRIPTION:Rendez-vous chez Laia Skin\\nSoins: ${servicesList}\\nPrix: ${reservation.totalPrice}€
LOCATION:À 6 minutes de la gare de Nanterre Université
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'laia-skin-reservation.ics';
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[#2c3e50] mb-4">Réservation introuvable</p>
          <Link href="/reservation" className="text-[#d4b5a0] hover:underline">
            Faire une nouvelle réservation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Confirmation Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#2c3e50] mb-2">
            Réservation Confirmée !
          </h1>
          <p className="text-xl text-[#2c3e50]/70">
            Nous avons hâte de vous accueillir
          </p>
        </div>

        {/* Main Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="border-b border-[#d4b5a0]/20 pb-6 mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-4">
              Détails de votre rendez-vous
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#d4b5a0] mt-0.5" />
                <div>
                  <p className="font-medium text-[#2c3e50]">Date</p>
                  <p className="text-lg text-[#2c3e50]/80">
                    {new Date(reservation.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#d4b5a0] mt-0.5" />
                <div>
                  <p className="font-medium text-[#2c3e50]">Heure</p>
                  <p className="text-lg text-[#2c3e50]/80">{reservation.time}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">💆</span>
                <div>
                  <p className="font-medium text-[#2c3e50]">Soins réservés</p>
                  <div className="mt-2 space-y-2">
                    {JSON.parse(reservation.services).map((serviceId: string) => {
                      const service = services[serviceId as keyof typeof services];
                      const packageType = JSON.parse(reservation.packages)[serviceId];
                      return (
                        <div key={serviceId} className="flex items-center gap-2">
                          <span className="text-lg">{service?.icon}</span>
                          <span className="text-[#2c3e50]/80">{service?.name}</span>
                          {packageType === 'forfait' && (
                            <span className="px-2 py-0.5 bg-[#d4b5a0]/20 text-[#d4b5a0] text-xs rounded-full font-medium">
                              Forfait 4 séances
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">💰</span>
                <div>
                  <p className="font-medium text-[#2c3e50]">Montant total</p>
                  <p className="text-2xl font-bold text-[#d4b5a0]">{reservation.totalPrice}€</p>
                  <p className="text-sm text-[#2c3e50]/60">Paiement en espèces sur place</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Confirmer sur WhatsApp
            </button>
            
            <button
              onClick={addToCalendar}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-xl hover:bg-[#d4b5a0] hover:text-white transition-all"
            >
              <Download className="w-5 h-5" />
              Ajouter au calendrier
            </button>
          </div>
          
          {/* Bouton Espace Client plus visible */}
          <div className="pt-6 border-t border-[#d4b5a0]/20">
            <Link
              href="/espace-client"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Accéder à mon espace client
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-sm text-[#2c3e50]/60 mt-3">
              Retrouvez tous vos rendez-vous, vos points de fidélité et gérez votre profil
            </p>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-serif font-bold text-[#2c3e50] mb-4">
            Informations importantes
          </h3>
          <div className="space-y-3 text-[#2c3e50]/80">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Adresse de l'institut :</p>
                <p className="text-sm">5 allée Jean de la Fontaine<br/>
                92000 Nanterre<br/>
                <strong>Bâtiment 5, 2ème étage, Porte 523</strong><br/>
                <span className="text-xs text-[#2c3e50]/60 mt-1">🚇 À 6 minutes à pied de la gare de Nanterre Université</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="w-5 h-5 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
              <p>Suivez-nous : <a href="https://www.instagram.com/laiaskin" target="_blank" className="text-[#d4b5a0] hover:underline">@laiaskin</a></p>
            </div>
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
              <p>Annulation gratuite jusqu'à 24h avant le rendez-vous</p>
            </div>
          </div>
        </div>

        {/* Modification Options */}
        <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-6 border border-[#d4b5a0]/20">
          <p className="text-center text-[#2c3e50]/70 mb-4">
            Besoin de modifier votre rendez-vous ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowReschedule(true)}
              className="flex items-center justify-center gap-2 px-6 py-2 text-[#d4b5a0] hover:underline"
            >
              <Edit className="w-4 h-4" />
              Reprogrammer
            </button>
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir annuler votre réservation ?')) {
                  // Logique d'annulation
                  alert('Votre réservation a été annulée. Vous recevrez un email de confirmation.');
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-2 text-red-600 hover:underline"
            >
              <X className="w-4 h-4" />
              Annuler la réservation
            </button>
          </div>
        </div>

        {/* Modal de reprogrammation */}
        {showReschedule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-serif font-bold text-[#2c3e50] mb-4">
                Reprogrammer votre rendez-vous
              </h3>
              <p className="text-[#2c3e50]/70 mb-4">
                Pour reprogrammer votre rendez-vous, contactez-nous :
              </p>
              <div className="space-y-3">
                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Via WhatsApp
                </button>
                <a
                  href="https://www.instagram.com/laiaskin"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Instagram className="w-5 h-5" />
                  Via Instagram
                </a>
              </div>
              <button
                onClick={() => setShowReschedule(false)}
                className="mt-4 w-full px-4 py-2 text-[#2c3e50]/60 hover:text-[#2c3e50] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <Link
            href="/espace-client"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-xl transition-all"
          >
            Accéder à mon espace client
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Confirmation() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d4b5a0]"></div>
    </div>}>
      <ConfirmationContent />
    </Suspense>
  );
}