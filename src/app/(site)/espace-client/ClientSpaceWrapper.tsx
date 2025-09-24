"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight, Mail } from "lucide-react";

interface ClientSpaceWrapperProps {
  children: React.ReactNode;
}

export default function ClientSpaceWrapper({ children }: ClientSpaceWrapperProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erreur de vérification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        window.location.reload(); // Recharger pour mettre à jour le header
      } else {
        const data = await response.json();
        setError(data.error || "Identifiants incorrects");
      }
    } catch (error) {
      setError("Erreur de connexion");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      setError("Erreur lors de l'inscription");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto mb-4"></div>
          <p className="text-[#2c3e50]/60">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
                {isRegistering ? "Créer un compte" : "Espace Client"}
              </h1>
              <p className="text-gray-600">
                {isRegistering 
                  ? "Inscrivez-vous pour accéder à votre espace personnel"
                  : "Connectez-vous pour accéder à vos réservations"
                }
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="text-right">
                  <Link href="/mot-passe-oublie" className="text-sm text-[#d4b5a0] hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Créer mon compte
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                  setFormData({ email: "", password: "", name: "", phone: "" });
                }}
                className="w-full text-center text-sm text-gray-600 hover:text-[#d4b5a0] transition-colors"
              >
                {isRegistering ? (
                  <>Déjà inscrit ? <span className="font-semibold">Se connecter</span></>
                ) : (
                  <>Pas encore de compte ? <span className="font-semibold">S'inscrire</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}