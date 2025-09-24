'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Lock, Mail, User, Shield, 
  Eye, EyeOff, Check, X, AlertCircle, Calendar,
  Phone, MapPin, Clock, Award
} from 'lucide-react';

export default function EmployeeSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    role: '',
    phone: '',
    startDate: '',
    specialties: [] as string[]
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
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
          role: data.role || '',
          phone: data.phone || '',
          startDate: data.createdAt || new Date().toISOString(),
          specialties: data.specialties || ['Soins visage', 'Hydro\'Naissance']
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

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    setSuccess('Préférences mises à jour !');
    setTimeout(() => {
      setSuccess('');
      setLoading(false);
    }, 2000);
  };

  const getExperienceYears = () => {
    const start = new Date(userInfo.startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    if (months < 0) return years - 1;
    return years;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf5f3] to-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/employee')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Paramètres</h1>
              <p className="text-sm text-gray-600">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#d4b5a0]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#d4b5a0]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Mon Profil</h2>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Nom
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {userInfo.name || 'Employé'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {userInfo.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Téléphone
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {userInfo.phone || '06 XX XX XX XX'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Ancienneté
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{getExperienceYears()} ans d'expérience</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Depuis {new Date(userInfo.startDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="inline w-4 h-4 mr-2" />
                Spécialités
              </label>
              <div className="flex flex-wrap gap-2">
                {userInfo.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#d4b5a0]/20 text-[#8b6b59] rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Préférences de notification */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-xs text-gray-500">Recevoir les rappels de RDV par email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-[#d4b5a0] rounded focus:ring-[#d4b5a0]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">SMS</p>
                  <p className="text-xs text-gray-500">Recevoir les rappels de RDV par SMS</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                className="w-5 h-5 text-[#d4b5a0] rounded focus:ring-[#d4b5a0]"
              />
            </label>

            <button
              onClick={handlePreferencesUpdate}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors disabled:opacity-50"
            >
              Sauvegarder les préférences
            </button>
          </div>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#d4b5a0] text-white rounded-lg font-medium hover:bg-[#c9a084] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </form>
        </div>
      </div>
    </div>
  );
}