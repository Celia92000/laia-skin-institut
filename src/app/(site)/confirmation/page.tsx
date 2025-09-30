"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, Phone, Mail, MessageCircle, Edit, X, Download, Instagram, ChevronRight } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { getReservationWithServiceNames, getServiceIcon } from '@/lib/service-utils';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);

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
        // Utiliser notre fonction utilitaire pour enrichir les données
        const enrichedReservation = await getReservationWithServiceNames(data);
        setReservation(enrichedReservation);
        
        // Envoyer l'email de confirmation
        await sendConfirmationEmail(enrichedReservation);
        
        // Préparer le message WhatsApp
        prepareWhatsAppMessage(enrichedReservation);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = async (reservationData: any) => {
    try {
      await fetch('/api/send-reservation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: reservationData.user.email,
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
    
    // Utiliser les noms formatés des services fournis par notre fonction utilitaire
    const servicesList = reservationData.formattedServices?.join(', ') || 'Soins sélectionnés';
    
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
🔔 Interphone : JOLLY

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
    const phone = "33683717050"; // Numéro de Célia IVORRA - LAIA SKIN
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
    
    const servicesList = reservation.formattedServices?.join(', ') || 'Soins sélectionnés';
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LAIA SKIN Institut//FR
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Laia Skin - ${servicesList}
DESCRIPTION:Rendez-vous chez Laia Skin Institut\\nSoins: ${servicesList}\\nPrix: ${reservation.totalPrice}€\\n\\nBâtiment 5, 2ème étage, Porte 523\\nInterphone: JOLLY\\n\\nPaiement en espèces sur place
LOCATION:5 allée Jean de la Fontaine, 92000 Nanterre (Interphone JOLLY)
URL:https://www.instagram.com/laia.skin/
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
            <span className="text-5xl">✓</span>
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
                    {reservation.services?.map((serviceId: string, index: number) => {
                      const serviceName = reservation.serviceNames?.[index] || serviceId;
                      const packageType = reservation.packages?.[serviceId];
                      const icon = getServiceIcon(serviceId);
                      return (
                        <div key={serviceId} className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span className="text-[#2c3e50]/80">{serviceName}</span>
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

          {/* Action Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={addToCalendar}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-lg transition-all"
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
          <div className="space-y-4 text-[#2c3e50]/80">
            <div className="p-5 bg-gradient-to-r from-[#d4b5a0]/15 to-[#c9a084]/15 rounded-xl border-2 border-[#d4b5a0]/40">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-lg text-[#2c3e50] mb-2">📍 Adresse de l'institut</p>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-base font-medium text-[#2c3e50]">
                      5 allée Jean de la Fontaine<br/>
                      92000 Nanterre
                    </p>
                    <div className="mt-2 p-2 bg-[#d4b5a0]/10 rounded border-l-4 border-[#d4b5a0]">
                      <p className="text-sm font-semibold text-[#2c3e50]">
                        🏢 Bâtiment 5<br/>
                        🔢 2ème étage<br/>
                        🚪 Porte 523<br/>
                        🔔 Interphone : JOLLY
                      </p>
                    </div>
                    <p className="text-sm text-[#2c3e50]/70 mt-2 flex items-center gap-2">
                      <span className="text-base">🚇</span>
                      <strong>6 min à pied</strong> de la gare Nanterre Université
                    </p>
                  </div>
                  <button 
                    onClick={() => window.open('https://maps.google.com/?q=5+allée+Jean+de+la+Fontaine+92000+Nanterre', '_blank')}
                    className="mt-3 text-sm text-[#d4b5a0] hover:text-[#c9a084] font-medium flex items-center gap-1"
                  >
                    📍 Voir sur Google Maps →
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="w-5 h-5 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
              <p>Suivez-nous : <a href="https://www.instagram.com/laia.skin/" target="_blank" className="text-[#d4b5a0] hover:text-[#c9a084] font-medium underline">@laia.skin</a></p>
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