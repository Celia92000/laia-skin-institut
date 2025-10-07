"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, Send, CheckCircle } from "lucide-react";

function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const reservationId = searchParams.get("reservation");
  const serviceParam = searchParams.get("service");

  useEffect(() => {
    if (serviceParam) {
      setServiceName(decodeURIComponent(serviceParam));
    }
  }, [serviceParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          serviceName,
          rating,
          comment,
          source: "email"
        })
      });

      if (response.ok) {
        setSubmitted(true);
        // Rediriger après 3 secondes
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avis:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-playfair text-[#2c3e50] mb-4">
            Merci pour votre avis !
          </h1>
          <p className="text-[#2c3e50]/70">
            Votre retour est précieux et m'aide à améliorer mes services.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-playfair text-[#2c3e50] mb-2">
            Votre avis compte !
          </h1>
          <p className="text-[#2c3e50]/70 mb-8">
            Comment s'est passé votre {serviceName || "soin"} ?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notation par étoiles */}
            <div>
              <label className="block text-[#2c3e50] font-semibold mb-3">
                Votre note
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-[#d4b5a0] text-[#d4b5a0]"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#2c3e50]/60 mt-2">
                {rating === 5 && "Excellent ! 🌟"}
                {rating === 4 && "Très bien ! 😊"}
                {rating === 3 && "Bien 👍"}
                {rating === 2 && "Moyen 😐"}
                {rating === 1 && "Décevant 😔"}
              </p>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-[#2c3e50] font-semibold mb-3">
                Votre commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience... Qu'est-ce qui vous a plu ? Qu'est-ce qui pourrait être amélioré ?"
                className="w-full px-4 py-3 border border-[#d4b5a0]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] transition-all"
                rows={5}
                required
              />
              <p className="text-xs text-[#2c3e50]/60 mt-1">
                Minimum 20 caractères
              </p>
            </div>

            {/* Suggestions de commentaires */}
            {rating >= 4 && (
              <div className="bg-[#d4b5a0]/10 rounded-xl p-4">
                <p className="text-sm text-[#2c3e50] mb-2">
                  💡 Suggestions pour votre avis :
                </p>
                <ul className="text-sm text-[#2c3e50]/70 space-y-1">
                  <li>• Décrivez les résultats obtenus</li>
                  <li>• Mentionnez l'accueil et le professionnalisme</li>
                  <li>• Parlez de l'ambiance et du cadre</li>
                  <li>• Recommanderiez-vous ce soin ?</li>
                </ul>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading || comment.length < 20}
              className="w-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer mon avis
                </>
              )}
            </button>

          </form>
        </div>

        {/* Invitation Google */}
        {rating >= 4 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-[#2c3e50] mb-3">
              Votre expérience vous a plu ? Aidez d'autres personnes à découvrir l'institut !
            </p>
            <a
              href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Laisser un avis Google
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ReviewForm />
    </Suspense>
  );
}