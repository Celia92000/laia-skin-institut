'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, MessageSquare, Award, Camera, X, Upload } from 'lucide-react';

function AvisContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  const source = searchParams.get('source') || 'website';
  const clientEmail = searchParams.get('email');
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showGoogleRedirect, setShowGoogleRedirect] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState(clientEmail || '');

  useEffect(() => {
    if (reservationId) {
      fetchReservationData();
    }
  }, [reservationId]);

  const fetchReservationData = async () => {
    try {
      const response = await fetch(`/api/reviews/collect?reservationId=${reservationId}`);
      if (response.ok) {
        const data = await response.json();
        setReservationData(data);
        if (data.clientName) setClientName(data.clientName);
        if (data.clientEmail) setEmail(data.clientEmail);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    try {
      const reviewData = {
        rating,
        comment,
        source,
        reservationId,
        clientEmail: email,
        clientName,
        serviceName: reservationData?.serviceName,
        photosBase64: photos
      };

      const response = await fetch('/api/reviews/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setSubmitted(true);
        
        // Si la note est 5 étoiles, proposer de laisser un avis Google
        if (rating === 5) {
          setTimeout(() => {
            setShowGoogleRedirect(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avis:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const googleReviewUrl = "https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review";

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ThumbsUp className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Merci pour votre avis !
          </h2>
          
          <p className="text-gray-600 mb-6">
            Votre retour est précieux et nous aide à améliorer nos services.
          </p>

          {showGoogleRedirect && rating === 5 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-gray-700 mb-4">
                Nous sommes ravis que vous ayez apprécié votre expérience !
                Partageriez-vous votre avis sur Google pour aider d'autres clients ?
              </p>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Laisser un avis Google ⭐
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d4b5a0] to-[#b59788] rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Partagez votre expérience
            </h1>
            <p className="text-gray-600">
              Votre avis nous aide à améliorer nos services
            </p>
            {reservationData?.serviceName && (
              <p className="mt-2 text-sm text-[#d4b5a0] font-medium">
                Service: {reservationData.serviceName}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations client si non connecté */}
            {!reservationId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre nom
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {/* Notation par étoiles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quelle note donneriez-vous à votre expérience ?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        value <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  {rating === 5 && "Excellent ! 🌟"}
                  {rating === 4 && "Très bien ! 😊"}
                  {rating === 3 && "Bien 👍"}
                  {rating === 2 && "Moyen 😐"}
                  {rating === 1 && "Décevant 😞"}
                </p>
              )}
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partagez votre expérience (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent resize-none"
                placeholder="Qu'avez-vous apprécié ? Qu'est-ce qui pourrait être amélioré ?"
              />
            </div>

            {/* Upload de photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ajouter des photos (optionnel)
              </label>
              
              {/* Photos ajoutées */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton d'upload */}
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] transition-colors cursor-pointer">
                <Camera className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Ajouter des photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Avantages */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Pourquoi laisser un avis ?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
                  <span>Gagnez 50 points de fidélité instantanément</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
                  <span>Aidez d'autres clients à découvrir nos services</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#d4b5a0] mt-0.5 flex-shrink-0" />
                  <span>Recevez une réponse personnalisée de notre équipe</span>
                </li>
              </ul>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#d4b5a0] to-[#b59788] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Envoyer mon avis
            </button>
          </form>
        </div>

        {/* Badges de confiance */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Vos données sont protégées et confidentielles</p>
          <p className="mt-1">✅ Avis vérifiés et authentiques uniquement</p>
        </div>
      </div>
    </div>
  );
}

export default function AvisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <AvisContent />
    </Suspense>
  );
}