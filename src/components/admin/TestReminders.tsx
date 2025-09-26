"use client";

import { useState } from "react";
import { Send, Clock, MessageCircle, Star, CheckCircle, AlertCircle } from "lucide-react";

export default function TestReminders() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const testReminders = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET || 'laia-cron-secret-2024';
      
      const response = await fetch('/api/cron/appointment-reminders', {
        headers: {
          'Authorization': `Bearer ${cronSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Erreur lors du test des rappels');
      }
    } catch (error) {
      setError('Erreur de connexion');
      console.error('Erreur test rappels:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendManualReminder = async (reservationId: string) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/cron/appointment-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reservationId })
      });

      if (response.ok) {
        alert('Rappel envoyé avec succès !');
      } else {
        setError('Erreur lors de l\'envoi du rappel');
      }
    } catch (error) {
      setError('Erreur de connexion');
      console.error('Erreur envoi rappel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-serif font-medium text-[#2c3e50] mb-4">
        Test des Rappels Automatiques
      </h2>

      <div className="space-y-4">
        {/* Description des rappels */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            📱 Rappels WhatsApp/Email Automatiques
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>24h avant :</strong> Rappel détaillé du rendez-vous
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>2h avant :</strong> Rappel court "Votre RDV approche"
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>3 jours après :</strong> Demande d'avis et photos (5% de réduction offerte)
              </span>
            </li>
          </ul>
        </div>

        {/* Bouton de test */}
        <button
          onClick={testReminders}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#8B7355] to-[#A0826D] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Tester les Rappels Maintenant
            </>
          )}
        </button>

        {/* Résultats */}
        {result && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Test Exécuté avec Succès
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="bg-white p-3 rounded text-center">
                <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-[#2c3e50]">
                  {result.reminders?.['24h']?.sent || 0}
                </div>
                <div className="text-xs text-[#2c3e50]/60">
                  Rappels 24h envoyés
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Sur {result.reminders?.['24h']?.checked || 0} vérifiés
                </div>
              </div>
              
              <div className="bg-white p-3 rounded text-center">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-[#2c3e50]">
                  {result.reminders?.['2h']?.sent || 0}
                </div>
                <div className="text-xs text-[#2c3e50]/60">
                  Rappels 2h envoyés
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  Sur {result.reminders?.['2h']?.checked || 0} vérifiés
                </div>
              </div>
              
              <div className="bg-white p-3 rounded text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-[#2c3e50]">
                  {result.reminders?.['review']?.sent || 0}
                </div>
                <div className="text-xs text-[#2c3e50]/60">
                  Demandes d'avis
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Sur {result.reminders?.['review']?.checked || 0} vérifiés
                </div>
              </div>
            </div>
            
            <p className="text-xs text-green-700 mt-3">
              Exécuté à : {new Date(result.timestamp).toLocaleString('fr-FR')}
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-xs text-[#2c3e50]/60 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">💡 Note :</p>
          <p>
            Les rappels sont envoyés automatiquement toutes les heures via Vercel Cron.
            Ce bouton permet de tester manuellement le système.
          </p>
          <p className="mt-1">
            Les clients reçoivent les rappels par WhatsApp si leur numéro est enregistré,
            sinon par email.
          </p>
        </div>
      </div>
    </div>
  );
}