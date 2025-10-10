'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateLocal } from '@/lib/date-utils';
import { 
  User, Calendar, Star, MessageSquare, Clock, Award, 
  Heart, TrendingUp, Gift, Bell, Settings, LogOut,
  ChevronRight, Plus, Send, ThumbsUp, Camera, Edit3,
  Shield, Phone, Mail, MapPin, CreditCard, History
} from 'lucide-react';

interface Treatment {
  id: string;
  name: string;
  date: Date;
  price: number;
  duration: number;
  therapist: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  rated?: boolean;
  rating?: number;
  review?: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: Date;
  joinDate: Date;
  loyaltyPoints: number;
  vipStatus: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  treatmentCount: number;
  lastVisit: Date;
  nextAppointment?: Date;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  skinProfile: {
    type: string;
    concerns: string[];
    allergies: string[];
    currentRoutine: string;
  };
}

export default function ClientPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'treatments' | 'reviews' | 'profile' | 'rewards'>('dashboard');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);

  // Données fictives du client
  const clientData: ClientData = {
    id: '1',
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    phone: '06 12 34 56 78',
    address: '15 rue de la Paix, 75002 Paris',
    birthDate: new Date('1985-03-15'),
    joinDate: new Date('2023-01-10'),
    loyaltyPoints: 2450,
    vipStatus: 'gold',
    totalSpent: 3850,
    treatmentCount: 32,
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    preferences: {
      notifications: true,
      newsletter: true,
      reminders: true,
      marketing: false
    },
    skinProfile: {
      type: 'Mixte',
      concerns: ['Hydratation', 'Anti-âge', 'Éclat'],
      allergies: ['Parfum'],
      currentRoutine: 'Nettoyant doux, sérum vitamine C, crème hydratante SPF30'
    }
  };

  const treatments: Treatment[] = [
    {
      id: '1',
      name: 'HydraFacial Premium',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      price: 120,
      duration: 60,
      therapist: 'Laïa',
      status: 'completed',
      rated: false
    },
    {
      id: '2',
      name: 'Peeling aux acides de fruits',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      price: 90,
      duration: 45,
      therapist: 'Laïa',
      status: 'completed',
      rated: true,
      rating: 5,
      review: 'Excellent soin, ma peau est radieuse !'
    },
    {
      id: '3',
      name: 'LED Therapy + Microneedling',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      price: 150,
      duration: 75,
      therapist: 'Laïa',
      status: 'upcoming'
    }
  ];

  const getVipColor = (status: string) => {
    switch (status) {
      case 'platinum': return 'bg-gradient-to-r from-gray-600 to-gray-400';
      case 'gold': return 'bg-gradient-to-r from-yellow-600 to-yellow-400';
      case 'silver': return 'bg-gradient-to-r from-gray-500 to-gray-300';
      default: return 'bg-gradient-to-r from-orange-600 to-orange-400';
    }
  };

  const handleSubmitReview = () => {
    if (selectedTreatment && reviewText) {
      // Ici, envoi de l'avis au serveur
      console.log('Avis soumis:', {
        treatmentId: selectedTreatment.id,
        rating,
        review: reviewText,
        photos: reviewPhotos
      });
      
      // Mise à jour locale
      const treatmentIndex = treatments.findIndex(t => t.id === selectedTreatment.id);
      if (treatmentIndex !== -1) {
        treatments[treatmentIndex].rated = true;
        treatments[treatmentIndex].rating = rating;
        treatments[treatmentIndex].review = reviewText;
      }
      
      setShowReviewModal(false);
      setSelectedTreatment(null);
      setRating(5);
      setReviewText('');
      setReviewPhotos([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Mon Espace LAIA SKIN</h1>
              <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getVipColor(clientData.vipStatus)}`}>
                {clientData.vipStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
            { id: 'treatments', label: 'Mes soins', icon: Calendar },
            { id: 'reviews', label: 'Mes avis', icon: Star },
            { id: 'rewards', label: 'Mes récompenses', icon: Gift },
            { id: 'profile', label: 'Mon profil', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Bonjour {clientData.name.split(' ')[0]} !</h2>
              <p className="mb-4">Bienvenue dans votre espace personnel</p>
              {clientData.nextAppointment && (
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm mb-1">Prochain rendez-vous</p>
                  <p className="font-semibold">
                    {clientData.nextAppointment.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-2xl font-bold">{clientData.treatmentCount}</span>
                </div>
                <p className="text-sm text-gray-600">Soins réalisés</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{clientData.loyaltyPoints}</span>
                </div>
                <p className="text-sm text-gray-600">Points fidélité</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">4.9</span>
                </div>
                <p className="text-sm text-gray-600">Note moyenne</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">
                    {Math.floor((Date.now() - clientData.joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30))}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Mois d'ancienneté</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => router.push('/reservation')}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <span className="text-sm">Prendre RDV</span>
                </button>
                <button 
                  onClick={() => window.open('https://wa.me/33683717050?text=Bonjour,%20je%20souhaite%20des%20informations', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                  <span className="text-sm">Contacter</span>
                </button>
                <button 
                  onClick={() => router.push('/espace-client?tab=loyalty')}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Gift className="w-6 h-6 text-purple-500" />
                  <span className="text-sm">Mes offres</span>
                </button>
                <button 
                  onClick={() => router.push('/avis/nouveau')}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-sm">Laisser un avis</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Treatments */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Historique de mes soins</h3>
              <div className="space-y-4">
                {treatments.map(treatment => (
                  <div key={treatment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {treatment.date.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Durée: {treatment.duration} min</span>
                          <span>Avec: {treatment.therapist}</span>
                          <span className="font-medium">{treatment.price}€</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          treatment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          treatment.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {treatment.status === 'completed' ? 'Terminé' :
                           treatment.status === 'upcoming' ? 'À venir' : 'Annulé'}
                        </span>
                        {treatment.status === 'completed' && !treatment.rated && (
                          <button
                            onClick={() => {
                              setSelectedTreatment(treatment);
                              setShowReviewModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Donner mon avis
                          </button>
                        )}
                        {treatment.rated && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (treatment.rating || 0)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {treatment.review && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 italic">"{treatment.review}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Mes avis</h3>
              <div className="space-y-4">
                {treatments
                  .filter(t => t.rated)
                  .map(treatment => (
                    <div key={treatment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                          <p className="text-sm text-gray-600">
                            {treatment.date.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (treatment.rating || 0)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {treatment.review && (
                        <p className="text-gray-700">{treatment.review}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Rewards */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Programme de fidélité</h3>
              
              {/* Points balance */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white mb-6">
                <p className="text-sm mb-2">Solde de points</p>
                <p className="text-4xl font-bold mb-4">{clientData.loyaltyPoints} pts</p>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-sm">Prochain palier: Platinum</p>
                  <div className="mt-2 bg-white/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '65%' }} />
                  </div>
                  <p className="text-xs mt-1">550 points restants</p>
                </div>
              </div>

              {/* Available rewards */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Récompenses disponibles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: '-10% sur votre prochain soin', points: 500 },
                    { name: 'Soin découverte LED offert', points: 1000 },
                    { name: '-20% sur un HydraFacial', points: 1500 },
                    { name: 'Duo mère-fille -30%', points: 2000 }
                  ].map((reward, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{reward.name}</p>
                        <p className="text-sm text-gray-600">{reward.points} points</p>
                      </div>
                      <button
                        disabled={clientData.loyaltyPoints < reward.points}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          clientData.loyaltyPoints >= reward.points
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Échanger
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Mes informations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={clientData.name}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      readOnly
                    />
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={clientData.email}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      readOnly
                    />
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={clientData.phone}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      readOnly
                    />
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={formatDateLocal(clientData.birthDate)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Skin profile */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Mon profil beauté</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de peau</label>
                  <p className="px-3 py-2 bg-gray-50 rounded-lg">{clientData.skinProfile.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Préoccupations</label>
                  <div className="flex flex-wrap gap-2">
                    {clientData.skinProfile.concerns.map((concern, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {clientData.skinProfile.allergies.map((allergy, i) => (
                      <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Donner mon avis sur : {selectedTreatment.name}
            </h3>
            
            {/* Rating */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Votre note</p>
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
                <span className="ml-2 text-gray-600">
                  {rating === 5 ? 'Excellent !' :
                   rating === 4 ? 'Très bien' :
                   rating === 3 ? 'Bien' :
                   rating === 2 ? 'Moyen' : 'Décevant'}
                </span>
              </div>
            </div>

            {/* Review text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre commentaire
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Photo upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter des photos (optionnel)
              </label>
              <button className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Ajouter des photos</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedTreatment(null);
                  setRating(5);
                  setReviewText('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!reviewText}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publier mon avis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}