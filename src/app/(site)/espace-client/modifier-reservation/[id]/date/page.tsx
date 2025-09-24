"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ModifierDate() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30", "23:00"
  ];

  useEffect(() => {
    fetchReservation();
  }, [params.id]);

  const fetchReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservation(data);
        setSelectedDate(data.date.split('T')[0]);
        setSelectedTime(data.time);
      }
    } catch (error) {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/public/availability?action=slots&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Erreur créneaux:', error);
    }
  };

  const isSlotAvailable = (time: string) => {
    // Si c'est le même créneau que l'actuel, il est disponible
    if (time === reservation?.time && selectedDate === reservation?.date.split('T')[0]) {
      return true;
    }
    const slot = availableSlots.find(s => s.time === time);
    return slot ? slot.available : true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          services: JSON.parse(reservation.services),
          date: selectedDate,
          time: selectedTime,
          totalPrice: reservation.totalPrice
        })
      });

      if (response.ok) {
        setSuccess(true);
        
        // Envoyer notification email
        const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: reservation.user.email,
            subject: 'Modification de votre rendez-vous - LAIA SKIN INSTITUT',
            message: `Bonjour ${reservation.user.name},\n\nVotre rendez-vous a été modifié avec succès.\n\nNouvelle date : ${formattedDate}\nNouvel horaire : ${selectedTime}\n\nSoins : ${JSON.parse(reservation.services).join(', ')}\nTotal : ${reservation.totalPrice}€\n\nÀ très bientôt !\n\nLAIA SKIN INSTITUT`
          })
        });

        setTimeout(() => {
          router.push('/espace-client');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      setError("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/espace-client/modifier-reservation/${params.id}/choix`}
            className="inline-flex items-center text-[#d4b5a0] hover:text-[#c9a084] mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour au choix
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#2c3e50]">
            Modifier la date et l'heure
          </h1>
          <p className="text-[#2c3e50]/70 mt-2">
            Choisissez une nouvelle date et un nouvel horaire pour vos soins
          </p>
        </div>

        {/* Info soins actuels */}
        {reservation && (
          <div className="bg-[#d4b5a0]/10 rounded-xl p-4 mb-6">
            <p className="text-[#2c3e50] font-medium">
              Soins réservés : {JSON.parse(reservation.services).join(', ')}
            </p>
            <p className="text-[#2c3e50]/70 text-sm mt-1">
              Ces soins seront conservés à la nouvelle date
            </p>
          </div>
        )}

        {/* Alertes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-green-800">Date modifiée avec succès ! Redirection...</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sélection de la date */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#2c3e50] mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#d4b5a0]" />
              Choisir une nouvelle date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(""); // Réinitialiser l'heure lors du changement de date
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none text-lg"
              required
            />
            {selectedDate && (
              <p className="mt-2 text-sm text-[#2c3e50]/60">
                {selectedDate === reservation?.date.split('T')[0] 
                  ? "📅 Date actuelle de votre rendez-vous" 
                  : "📅 Nouvelle date sélectionnée"}
              </p>
            )}
          </div>

          {/* Sélection de l'heure */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-[#2c3e50] mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                Choisir un nouvel horaire
              </h2>
              
              {/* Alerte si peu de créneaux */}
              {availableSlots.length > 0 && availableSlots.filter(s => s.available).length < 3 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Peu de créneaux disponibles ce jour. Pensez à sélectionner une autre date si nécessaire.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {timeSlots.map((time) => {
                  const available = isSlotAvailable(time);
                  const isCurrentTime = time === reservation?.time && selectedDate === reservation?.date.split('T')[0];
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => available && setSelectedTime(time)}
                      disabled={!available}
                      className={`py-2.5 px-2 rounded-lg border-2 text-sm font-medium transition-all relative ${
                        !available 
                          ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed line-through"
                          : selectedTime === time
                          ? "border-[#d4b5a0] bg-[#d4b5a0] text-white shadow-md"
                          : isCurrentTime
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-[#d4b5a0] text-[#2c3e50] hover:shadow"
                      }`}
                      title={
                        !available ? "Créneau indisponible" :
                        isCurrentTime ? "Horaire actuel" :
                        "Créneau disponible"
                      }
                    >
                      {time}
                      {isCurrentTime && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-200 rounded"></div>
                  <span className="text-[#2c3e50]/60">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
                  <span className="text-[#2c3e50]/60">Horaire actuel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#d4b5a0] rounded"></div>
                  <span className="text-[#2c3e50]/60">Sélectionné</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                  <span className="text-[#2c3e50]/60">Indisponible</span>
                </div>
              </div>
            </div>
          )}

          {/* Résumé et boutons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {selectedDate && selectedTime && (
              <div className="mb-6 p-4 bg-[#d4b5a0]/10 rounded-lg">
                <h3 className="font-medium text-[#2c3e50] mb-2">Récapitulatif de la modification</h3>
                <div className="space-y-1 text-sm text-[#2c3e50]/80">
                  <p>
                    <strong>Ancienne date :</strong> {new Date(reservation?.date).toLocaleDateString('fr-FR')} à {reservation?.time}
                  </p>
                  <p>
                    <strong>Nouvelle date :</strong> {new Date(selectedDate).toLocaleDateString('fr-FR')} à {selectedTime}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                href={`/espace-client/modifier-reservation/${params.id}/choix`}
                className="flex-1 py-3 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-lg text-center hover:bg-[#d4b5a0]/10 transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving || !selectedDate || !selectedTime || (selectedDate === reservation?.date.split('T')[0] && selectedTime === reservation?.time)}
                className="flex-1 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? 'Modification...' : 'Confirmer la nouvelle date'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}