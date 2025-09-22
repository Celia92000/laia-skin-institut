"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ModifierReservation() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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

  // Charger la réservation existante
  useEffect(() => {
    fetchReservation();
    fetchServices();
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
        setSelectedServices(JSON.parse(data.services));
        setSelectedDate(data.date.split('T')[0]);
        setSelectedTime(data.time);
      } else {
        setError("Réservation introuvable");
      }
    } catch (error) {
      setError("Erreur lors du chargement de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Erreur chargement services:', error);
    }
  };

  // Vérifier la disponibilité des créneaux
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
      console.error('Erreur lors de la récupération des créneaux:', error);
    }
  };

  const isSlotAvailable = (time: string) => {
    // Si c'est le même créneau que celui déjà réservé, il est disponible
    if (time === reservation?.time && selectedDate === reservation?.date.split('T')[0]) {
      return true;
    }
    const slot = availableSlots.find(s => s.time === time);
    return slot ? slot.available : true;
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.displayPrice || service?.price || 0);
    }, 0);
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
          services: selectedServices,
          date: selectedDate,
          time: selectedTime,
          totalPrice: calculateTotal()
        })
      });

      if (response.ok) {
        setSuccess(true);
        // Envoyer une notification email de modification
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: reservation.user.email,
            subject: 'Modification de votre réservation - LAIA SKIN INSTITUT',
            message: `Votre réservation a été modifiée avec succès.\n\nNouvelle date : ${new Date(selectedDate).toLocaleDateString('fr-FR')}\nNouvel horaire : ${selectedTime}\n\nÀ très bientôt !`
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
      setError("Erreur lors de la modification de la réservation");
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

  if (error && !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/espace-client" className="text-[#d4b5a0] hover:underline">
            Retour à l'espace client
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/espace-client" className="inline-flex items-center text-[#d4b5a0] hover:text-[#c9a084] mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour à mon espace
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#2c3e50]">
            Modifier ma réservation
          </h1>
          <p className="text-[#2c3e50]/70 mt-2">
            Réservation du {new Date(reservation?.date).toLocaleDateString('fr-FR')} à {reservation?.time}
          </p>
        </div>

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
            <p className="text-green-800">Réservation modifiée avec succès ! Redirection...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sélection des services */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#2c3e50] mb-4">
              Modifier les soins
            </h2>
            <div className="space-y-3">
              {services.map(service => (
                <label
                  key={service.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-[#d4b5a0] bg-[#d4b5a0]/5'
                      : 'border-gray-200 hover:border-[#d4b5a0]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service.id]);
                        } else {
                          setSelectedServices(selectedServices.filter(id => id !== service.id));
                        }
                      }}
                      className="w-5 h-5 text-[#d4b5a0] rounded"
                    />
                    <div>
                      <h3 className="font-medium text-[#2c3e50]">{service.name}</h3>
                      <p className="text-sm text-[#2c3e50]/60">{service.duration}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#d4b5a0]">
                    {service.displayPrice || service.price}€
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sélection de la date */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#2c3e50] mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#d4b5a0]" />
              Modifier la date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              required
            />
          </div>

          {/* Sélection de l'heure */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#2c3e50] mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                Modifier l'horaire
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((time) => {
                  const available = isSlotAvailable(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => available && setSelectedTime(time)}
                      disabled={!available}
                      className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        !available 
                          ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed line-through"
                          : selectedTime === time
                          ? "border-[#d4b5a0] bg-[#d4b5a0] text-white"
                          : "border-gray-200 hover:border-[#d4b5a0] text-[#2c3e50]"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total et boutons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-[#2c3e50]">Total :</span>
              <span className="text-2xl font-bold text-[#d4b5a0]">{calculateTotal()}€</span>
            </div>

            <div className="flex gap-4">
              <Link
                href="/espace-client"
                className="flex-1 py-3 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-lg text-center hover:bg-[#d4b5a0] hover:text-white transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving || selectedServices.length === 0 || !selectedDate || !selectedTime}
                className="flex-1 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Modification...' : 'Confirmer la modification'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}