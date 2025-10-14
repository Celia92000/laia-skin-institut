'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Lock, Mail, User, Shield,
  Eye, EyeOff, Check, X, AlertCircle, Settings as SettingsIcon, Globe, Plug, CreditCard
} from 'lucide-react';
import AdminConfigTab from '@/components/AdminConfigTab';
import IntegrationsTab from '@/components/IntegrationsTab';
import PaymentHistoryTab from '@/components/PaymentHistoryTab';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'site' | 'integrations' | 'payments'>('account');
  
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    role: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          email: data.email || '',
          name: data.name || '',
          role: data.role || ''
        });
      }
    } catch (error) {
      console.error('Erreur récupération infos:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe modifié avec succès !');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-sm text-gray-600">Gérez votre compte et la configuration du site</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 pb-4 px-4 transition relative ${
              activeTab === 'account'
                ? 'text-[#d4b5a0] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            Paramètres du compte
            {activeTab === 'account' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('site')}
            className={`flex items-center gap-2 pb-4 px-4 transition relative ${
              activeTab === 'site'
                ? 'text-[#d4b5a0] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="w-5 h-5" />
            Configuration du site
            {activeTab === 'site' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 pb-4 px-4 transition relative ${
              activeTab === 'integrations'
                ? 'text-[#d4b5a0] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plug className="w-5 h-5" />
            Intégrations
            {activeTab === 'integrations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 pb-4 px-4 transition relative ${
              activeTab === 'payments'
                ? 'text-[#d4b5a0] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Paiements
            {activeTab === 'payments' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'account' ? (
        <div className="max-w-4xl mx-auto grid gap-6">
          {/* Informations du compte */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informations du compte</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {userInfo.email}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Votre email professionnel pour la connexion
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Nom
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {userInfo.name || 'Admin'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline w-4 h-4 mr-2" />
                Rôle
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {userInfo.role === 'ADMIN' ? 'Administrateur' : userInfo.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#d4b5a0]/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#d4b5a0]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <X className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 caractères
              </p>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#d4b5a0] text-white rounded-lg font-medium hover:bg-[#c9a084] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Changer le mot de passe
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Conseils de sécurité :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Utilisez un mot de passe unique pour ce compte</li>
                  <li>Incluez des lettres majuscules, minuscules et des chiffres</li>
                  <li>Changez votre mot de passe régulièrement</li>
                  <li>Ne partagez jamais votre mot de passe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : activeTab === 'site' ? (
        <div className="max-w-7xl mx-auto">
          <AdminConfigTab />
        </div>
      ) : activeTab === 'integrations' ? (
        <div className="max-w-7xl mx-auto">
          <IntegrationsTab />
        </div>
      ) : activeTab === 'payments' ? (
        <div className="max-w-7xl mx-auto">
          <PaymentHistoryTab />
        </div>
      ) : null}
    </div>
  );
}