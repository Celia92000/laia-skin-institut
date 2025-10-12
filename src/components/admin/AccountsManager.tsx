"use client";

import { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook, FaTiktok, FaWhatsapp, FaEnvelope, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Account {
  id: string;
  accountName?: string;
  platform?: string;
  email?: string;
  phoneNumber?: string;
  enabled: boolean;
  isDefault: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function AccountsManager() {
  const [activeTab, setActiveTab] = useState<'social' | 'whatsapp' | 'email'>('social');
  const [accounts, setAccounts] = useState<{
    social: Account[];
    whatsapp: Account[];
    email: Account[];
  }>({
    social: [],
    whatsapp: [],
    email: []
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts({
          social: data.social || [],
          whatsapp: data.whatsapp || [],
          email: data.email || []
        });
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <FaInstagram className="text-pink-600" />;
      case 'facebook': return <FaFacebook className="text-blue-600" />;
      case 'tiktok': return <FaTiktok className="text-gray-900" />;
      default: return null;
    }
  };

  const isTokenExpiring = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 7;
  };

  const formatExpiryDate = (expiresAt?: string) => {
    if (!expiresAt) return 'Jamais';
    const date = new Date(expiresAt);
    const daysUntilExpiry = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return '⚠️ Expiré';
    if (daysUntilExpiry === 0) return '⚠️ Aujourd\'hui';
    if (daysUntilExpiry < 7) return `⚠️ Dans ${daysUntilExpiry} jours`;
    return `Dans ${daysUntilExpiry} jours`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
            🔗 Gérer mes comptes
          </h1>
          <p className="text-white/80 text-lg">
            Connectez vos réseaux sociaux, WhatsApp et emails en toute simplicité
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-lg border-2 ${
              activeTab === 'social'
                ? 'bg-white/20 border-white/40 text-white shadow-xl scale-105'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            📱 Réseaux Sociaux ({accounts.social.length})
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-lg border-2 ${
              activeTab === 'whatsapp'
                ? 'bg-white/20 border-white/40 text-white shadow-xl scale-105'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaWhatsapp className="inline mr-2" />
            WhatsApp ({accounts.whatsapp.length})
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-lg border-2 ${
              activeTab === 'email'
                ? 'bg-white/20 border-white/40 text-white shadow-xl scale-105'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaEnvelope className="inline mr-2" />
            Email ({accounts.email.length})
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full mb-6 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-bold text-white hover:shadow-2xl transition-all hover:scale-105"
        >
          <FaPlus className="inline mr-2" />
          Ajouter un compte {activeTab === 'social' ? 'social' : activeTab === 'whatsapp' ? 'WhatsApp' : 'email'}
        </button>

        {/* Accounts list */}
        <div className="space-y-4">
          {loading ? (
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Chargement...</p>
            </div>
          ) : accounts[activeTab].length === 0 ? (
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
              <p className="text-white/80 text-lg">
                Aucun compte configuré. Ajoutez-en un pour commencer !
              </p>
            </div>
          ) : (
            accounts[activeTab].map((account) => (
              <div
                key={account.id}
                className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {activeTab === 'social' && (
                      <div className="text-4xl">{getPlatformIcon(account.platform!)}</div>
                    )}
                    {activeTab === 'whatsapp' && (
                      <FaWhatsapp className="text-4xl text-green-500" />
                    )}
                    {activeTab === 'email' && (
                      <FaEnvelope className="text-4xl text-blue-500" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">
                          {account.accountName || account.email || account.phoneNumber || 'Sans nom'}
                        </h3>
                        {account.isDefault && (
                          <span className="px-3 py-1 bg-yellow-500/30 text-yellow-200 rounded-full text-xs font-bold border border-yellow-400/50">
                            Par défaut
                          </span>
                        )}
                        {account.enabled ? (
                          <FaCheckCircle className="text-green-400" title="Activé" />
                        ) : (
                          <FaTimesCircle className="text-red-400" title="Désactivé" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                        {activeTab === 'social' && (
                          <span className="capitalize">{account.platform}</span>
                        )}
                        {account.email && <span>{account.email}</span>}
                        {account.phoneNumber && <span>{account.phoneNumber}</span>}

                        {account.expiresAt && (
                          <span className={isTokenExpiring(account.expiresAt) ? 'text-orange-400 font-bold' : ''}>
                            🕐 Token expire: {formatExpiryDate(account.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {/* TODO: Edit account */}}
                      className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-xl text-white transition-all"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {/* TODO: Delete account */}}
                      className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-xl text-white transition-all"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info box */}
        <div className="mt-8 backdrop-blur-lg bg-blue-500/20 rounded-2xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-bold text-white mb-3">💡 Informations</h3>
          <ul className="text-white/80 space-y-2 text-sm">
            <li>• Vous pouvez connecter plusieurs comptes par plateforme</li>
            <li>• Définissez un compte par défaut pour l'utiliser automatiquement</li>
            <li>• Les tokens expirent après 60 jours - pensez à les renouveler</li>
            <li>• Chaque utilisateur admin a ses propres comptes isolés</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
