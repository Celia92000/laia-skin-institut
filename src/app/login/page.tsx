"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Connexion
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
          
          // Redirection basée sur le rôle
          if (data.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            // Rediriger vers la page de réservation
            window.location.href = '/reservation';
          }
        } else {
          alert('Email ou mot de passe incorrect');
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur de connexion');
      }
    } else {
      // Inscription
      if (formData.password !== formData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }
      
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
          window.location.href = '/reservation';
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de l\'inscription');
        }
      } catch (error) {
        console.error('Erreur d\'inscription:', error);
        alert('Erreur lors de l\'inscription');
      }
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-serif text-center mb-8 text-primary">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h1>

            {/* Toggle Login/Register */}
            <div className="flex mb-8 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  isLogin
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  !isLogin
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                    <input
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="text-right mb-4">
                  <Link
                    href="/mot-passe-oublie"
                    className="text-sm text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!isLogin}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-muted">Se souvenir de moi</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                {isLogin ? "Se connecter" : "Créer mon compte"}
                <ArrowRight className="ml-2" size={20} />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted">ou</span>
              </div>
            </div>

            {/* Admin Link */}
            <div className="text-center">
              <p className="text-sm text-muted mb-2">Vous êtes administrateur ?</p>
              <p className="text-xs text-muted mt-2">
                Utilisez vos identifiants administrateur ci-dessus
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 text-center">
            <h3 className="font-semibold mb-4">Avantages de votre compte client</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>✨ Réservez vos soins en quelques clics</li>
              <li>📅 Consultez votre historique de rendez-vous</li>
              <li>🎁 Accédez à des offres exclusives</li>
              <li>💎 Cumulez des points de fidélité</li>
            </ul>
          </div>
        </div>
      </main>
  );
}