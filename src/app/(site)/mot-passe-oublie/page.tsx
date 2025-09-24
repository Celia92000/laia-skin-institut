"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Check } from "lucide-react";

export default function MotPasseOublie() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      // En cas d'erreur réseau, on affiche quand même le message de succès
      // pour éviter de révéler si l'email existe ou non
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-[#2c3e50] mb-4">
              Email envoyé !
            </h1>
            
            <p className="text-[#2c3e50]/70 mb-6">
              Si l'adresse <span className="font-semibold">{email}</span> est associée à un compte, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>

            <div className="bg-[#fdfbf7] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#2c3e50]/60">
                💡 Conseil : Vérifiez aussi vos spams si vous ne recevez pas l'email dans les prochaines minutes.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#d4b5a0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#d4b5a0]" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#2c3e50] mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-[#2c3e50]/60">
              Pas de panique ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2c3e50] mb-2">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le lien de réinitialisation
                </>
              )}
            </button>
          </form>

          {/* Informations supplémentaires */}
          <div className="mt-6 p-4 bg-[#fdfbf7] rounded-lg">
            <h3 className="font-semibold text-[#2c3e50] mb-2">Identifiants de test :</h3>
            <ul className="space-y-1 text-sm text-[#2c3e50]/70">
              <li>• Admin : admin@laia.skin.com / admin123</li>
              <li>• Propriétaire : celia@laia.skin.com / celia2024</li>
              <li>• Client test : marie.dupont@email.com / client123</li>
            </ul>
          </div>

          {/* Liens */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}