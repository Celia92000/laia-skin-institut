"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Calculator, Briefcase, GraduationCap, Info, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

export default function SecureLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: "",
    referralCode: ""
  });

  // Charger seulement l'email sauvegardé au chargement (jamais le mot de passe)
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
      // Supprimer tout mot de passe potentiellement stocké
      localStorage.removeItem('rememberedPassword');
    }
  });

  // Comptes de démonstration désactivés pour la sécurité
  const demoAccounts = false ? [
    {
      role: "Admin",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      email: "admin@laiaskin.com",
      access: "Accès complet au système",
      features: ["Gestion complète", "Statistiques", "Configuration", "Utilisateurs"]
    },
    {
      role: "Comptable",
      icon: Calculator,
      color: "from-green-500 to-green-600",
      email: "comptable@laiaskin.com",
      access: "Accès financier",
      features: ["Finances", "Factures", "Statistiques", "Rapports"]
    },
    {
      role: "Employé",
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      email: "employe1@laiaskin.com",
      access: "Gestion des RDV",
      features: ["Planning", "Clients", "Réservations", "Services"]
    },
    {
      role: "Client",
      icon: Users,
      color: "from-laia-primary to-laia-primary-dark",
      email: "marie.dupont@email.com",
      access: "Espace personnel",
      features: ["Mes réservations", "Programme fidélité", "Historique", "Profil"]
    }
  ] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
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
          
          // Gérer "Se souvenir de moi" - sauvegarder uniquement l'email
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          // Ne jamais sauvegarder le mot de passe
          localStorage.removeItem('rememberedPassword');
          
          // Stocker le token de manière sécurisée
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user.role);
          
          // Cookie httpOnly serait mieux en production
          const maxAge = rememberMe ? 2592000 : 604800; // 30 jours si "Se souvenir", sinon 7 jours
          document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Strict`;
          
          // Redirection basée sur le rôle
          const roleRedirects = {
            'ADMIN': '/admin',
            'admin': '/admin',
            'COMPTABLE': '/admin/finances',
            'EMPLOYEE': '/admin/planning',
            'STAGIAIRE': '/admin/planning',
            'CLIENT': '/espace-client',
            'client': '/espace-client'
          };
          
          const redirectPath = roleRedirects[data.user.role as keyof typeof roleRedirects] || '/';
          window.location.href = redirectPath;
          
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Email ou mot de passe incorrect');
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setError('Erreur de connexion. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    } else {
      // Inscription
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
      
      // Validation du mot de passe
      if (formData.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        setLoading(false);
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
            phone: formData.phone,
            referralCode: formData.referralCode
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user.role);
          document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Strict`;
          window.location.href = '/espace-client';
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erreur lors de l\'inscription');
        }
      } catch (error) {
        console.error('Erreur d\'inscription:', error);
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Fonction pour remplir automatiquement avec un compte démo
  const fillDemoAccount = (email: string) => {
    setFormData({
      ...formData,
      email: email,
      password: "" // L'utilisateur doit entrer le mot de passe
    });
    setError("Entrez le mot de passe sécurisé fourni");
  };

  return (
    <main className="pt-24 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-[#8B7355] to-[#6B5D54] p-8 text-white text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-serif mb-2">
              {isLogin ? "Connexion Sécurisée" : "Créer un compte"}
            </h1>
            <p className="text-sm opacity-90">
              {isLogin ? "Accédez à votre espace personnel" : "Rejoignez LAIA SKIN Institut"}
            </p>
          </div>

          <div className="p-8">
            {/* Toggle Login/Register */}
            <div className="flex mb-6 bg-laia-nude rounded-lg p-1">
              <button
                onClick={() => {setIsLogin(true); setError("");}}
                className={`flex-1 py-2.5 rounded-md transition-all font-medium ${
                  isLogin
                    ? "bg-white text-laia-primary shadow-sm"
                    : "text-laia-gray hover:text-laia-primary"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => {setIsLogin(false); setError("");}}
                className={`flex-1 py-2.5 rounded-md transition-all font-medium ${
                  !isLogin
                    ? "bg-white text-laia-primary shadow-sm"
                    : "text-laia-gray hover:text-laia-primary"
                }`}
              >
                Inscription
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-laia-dark">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-laia-gray" size={20} />
                    <input
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-laia-dark">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-laia-gray" size={20} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20"
                    placeholder="votre@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-laia-dark">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-laia-gray" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20"
                    placeholder={isLogin ? "Votre mot de passe" : "Minimum 8 caractères"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-laia-gray hover:text-laia-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-laia-primary rounded border-gray-300 focus:ring-laia-primary"
                    />
                    <span className="text-sm text-laia-gray">Se souvenir de moi</span>
                  </label>
                  <Link href="/mot-passe-oublie" className="text-sm text-laia-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-laia-dark">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-laia-gray" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20"
                        placeholder="Confirmer votre mot de passe"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-laia-dark">
                      Téléphone (optionnel)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-laia-dark">
                      Code de parrainage (optionnel)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.referralCode}
                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20"
                        placeholder="Ex: LAIAMAR1234"
                      />
                      <div className="mt-1 text-xs text-green-600">
                        💝 10€ de réduction sur votre premier soin avec un code valide
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#8B7355] to-[#A0826D] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "S'inscrire"}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Section des types d'accès (environnement de développement uniquement) */}
            {process.env.NODE_ENV === 'development' && isLogin && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="w-full flex items-center justify-between p-3 bg-laia-nude/50 rounded-lg hover:bg-laia-nude transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-laia-primary" />
                    <span className="text-sm font-medium text-laia-dark">
                      Types d'accès disponibles
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-laia-gray transition-transform ${showDemoAccounts ? 'rotate-180' : ''}`} />
                </button>

                {showDemoAccounts && (
                  <div className="mt-4 space-y-3">
                    {demoAccounts.map((account) => {
                      const Icon = account.icon;
                      return (
                        <div
                          key={account.email}
                          className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => fillDemoAccount(account.email)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 bg-gradient-to-r ${account.color} rounded-lg text-white`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-laia-dark group-hover:text-laia-primary transition-colors">
                                {account.role}
                              </h4>
                              <p className="text-xs text-laia-gray mt-1">{account.email}</p>
                              <p className="text-sm text-laia-gray-dark mt-2">{account.access}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {account.features.map((feature) => (
                                  <span
                                    key={feature}
                                    className="text-xs px-2 py-0.5 bg-laia-nude rounded-full text-laia-gray-dark"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Indicateurs de sécurité */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-xs text-laia-gray">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SSL/TLS</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Données chiffrées</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>RGPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}