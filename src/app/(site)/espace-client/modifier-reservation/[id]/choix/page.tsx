"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Sparkles, ChevronLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export default function ChoixModification() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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
          <Link href="/espace-client" className="inline-flex items-center text-[#d4b5a0] hover:text-[#c9a084] mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour à mon espace
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#2c3e50]">
            Que souhaitez-vous modifier ?
          </h1>
          <p className="text-[#2c3e50]/70 mt-2">
            Choisissez ce que vous voulez changer pour votre rendez-vous
          </p>
        </div>

        {/* Info réservation actuelle */}
        {reservation && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Votre réservation actuelle</h3>
            <div className="grid md:grid-cols-2 gap-4 text-[#2c3e50]/80">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#d4b5a0] mt-0.5" />
                <div>
                  <p className="font-medium">Date & Heure</p>
                  <p>{new Date(reservation.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })} à {reservation.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#d4b5a0] mt-0.5" />
                <div>
                  <p className="font-medium">Soins</p>
                  <p>{JSON.parse(reservation.services).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Options de modification */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Modifier les soins */}
          <div 
            onClick={() => router.push(`/espace-client/modifier-reservation/${params.id}/soins`)}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-10 h-10 text-[#d4b5a0]" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[#2c3e50] text-center mb-3">
              Modifier mes soins
            </h2>
            <p className="text-[#2c3e50]/70 text-center text-sm">
              Changez les soins sélectionnés, ajoutez ou retirez des services
            </p>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg text-sm font-medium">
                Changer les services
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </span>
            </div>
          </div>

          {/* Modifier la date/heure */}
          <div 
            onClick={() => router.push(`/espace-client/modifier-reservation/${params.id}/date`)}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-10 h-10 text-[#d4b5a0]" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[#2c3e50] text-center mb-3">
              Modifier la date/heure
            </h2>
            <p className="text-[#2c3e50]/70 text-center text-sm">
              Reportez votre rendez-vous à une autre date ou un autre horaire
            </p>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg text-sm font-medium">
                Changer la date
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </span>
            </div>
          </div>
        </div>

        {/* Note d'information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Bon à savoir :</strong> Vous pouvez modifier votre réservation jusqu'à 24h avant le rendez-vous. 
            Les modifications sont immédiatement synchronisées avec notre planning.
          </p>
        </div>
      </div>
    </div>
  );
}