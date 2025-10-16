"use client";

import { useState, useEffect } from 'react';
import { Instagram, Facebook, Music, Plus, Edit, Trash, Check, X, Key, RefreshCw, AlertCircle, ExternalLink, Linkedin, Ghost } from 'lucide-react';
import { FaTiktok, FaSnapchat } from 'react-icons/fa';

interface SocialAccount {
  id: string;
  platform: string;
  accountName?: string;
  accountId?: string;
  pageId?: string;
  enabled: boolean;
  isDefault: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function SocialMediaAPISync() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);

  const [formData, setFormData] = useState({
    platform: 'instagram',
    accountName: '',
    accountId: '',
    pageId: '',
    accessToken: '',
    refreshToken: '',
    appId: '',
    appSecret: '',
    expiresAt: '',
    enabled: true,
    autoPublish: false,
    isDefault: false
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts?type=social', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.social || []);
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingAccount ? 'PUT' : 'POST';
      const body = editingAccount
        ? { ...formData, id: editingAccount.id, type: 'social' }
        : { ...formData, type: 'social' };

      const response = await fetch('/api/admin/accounts', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(editingAccount ? 'Compte modifié !' : 'Compte ajouté !');
        setShowAddModal(false);
        setEditingAccount(null);
        resetForm();
        loadAccounts();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce compte ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/accounts?id=${id}&type=social`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Compte supprimé');
        loadAccounts();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'instagram',
      accountName: '',
      accountId: '',
      pageId: '',
      accessToken: '',
      refreshToken: '',
      appId: '',
      appSecret: '',
      expiresAt: '',
      enabled: true,
      autoPublish: false,
      isDefault: false
    });
  };

  const openEditModal = (account: SocialAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      accountName: account.accountName || '',
      accountId: account.accountId || '',
      pageId: account.pageId || '',
      accessToken: '',
      refreshToken: '',
      appId: '',
      appSecret: '',
      expiresAt: account.expiresAt || '',
      enabled: account.enabled,
      autoPublish: false,
      isDefault: account.isDefault
    });
    setShowAddModal(true);
  };

  const handleConnectInstagram = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/instagram/connect', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Ouvrir la fenêtre d'autorisation Meta/Instagram
        window.location.href = data.authUrl;
      } else {
        alert('Erreur lors de la génération de l\'URL d\'autorisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la connexion à Instagram');
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-8 h-8 text-pink-600" />;
      case 'facebook':
        return <Facebook className="w-8 h-8 text-blue-600" />;
      case 'tiktok':
        return <FaTiktok className="w-8 h-8 text-gray-900" />;
      case 'linkedin':
        return <Linkedin className="w-8 h-8 text-blue-700" />;
      case 'snapchat':
        return <FaSnapchat className="w-8 h-8 text-yellow-500" />;
      default:
        return <Music className="w-8 h-8 text-gray-600" />;
    }
  };

  const getAccountsByPlatform = (platform: string) => {
    return accounts.filter(acc => acc.platform.toLowerCase() === platform.toLowerCase());
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-500" />
                Synchronisation API Réseaux Sociaux
              </h2>
              <p className="text-gray-600 mt-1">
                Gérez vos comptes Instagram, Facebook, TikTok, LinkedIn et Snapchat
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConnectInstagram}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 shadow-md"
              >
                <Instagram className="w-4 h-4" />
                Connecter Instagram (OAuth)
              </button>
              <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter manuellement
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Instagram Accounts */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Instagram className="w-5 h-5 text-pink-600" />
                Instagram ({getAccountsByPlatform('instagram').length})
              </h3>
              {getAccountsByPlatform('instagram').length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">Aucun compte Instagram configuré</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getAccountsByPlatform('instagram').map((account) => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {account.accountName || 'Sans nom'}
                              </h4>
                              {account.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                  Par défaut
                                </span>
                              )}
                              {account.enabled ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">ID: {account.accountId}</p>
                            {account.expiresAt && (
                              <p className={`text-xs mt-1 ${isTokenExpiring(account.expiresAt) ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                                🕐 Token expire: {formatExpiryDate(account.expiresAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(account)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Facebook Accounts */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Facebook className="w-5 h-5 text-blue-600" />
                Facebook ({getAccountsByPlatform('facebook').length})
              </h3>
              {getAccountsByPlatform('facebook').length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">Aucun compte Facebook configuré</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getAccountsByPlatform('facebook').map((account) => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {account.accountName || 'Sans nom'}
                              </h4>
                              {account.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                  Par défaut
                                </span>
                              )}
                              {account.enabled ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Page ID: {account.pageId}</p>
                            {account.expiresAt && (
                              <p className={`text-xs mt-1 ${isTokenExpiring(account.expiresAt) ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                                🕐 Token expire: {formatExpiryDate(account.expiresAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(account)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TikTok Accounts */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <FaTiktok className="w-5 h-5 text-gray-900" />
                TikTok ({getAccountsByPlatform('tiktok').length})
              </h3>
              {getAccountsByPlatform('tiktok').length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">Aucun compte TikTok configuré</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getAccountsByPlatform('tiktok').map((account) => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {account.accountName || 'Sans nom'}
                              </h4>
                              {account.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                  Par défaut
                                </span>
                              )}
                              {account.enabled ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">ID: {account.accountId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(account)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LinkedIn Accounts */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Linkedin className="w-5 h-5 text-blue-700" />
                LinkedIn ({getAccountsByPlatform('linkedin').length})
              </h3>
              {getAccountsByPlatform('linkedin').length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">Aucun compte LinkedIn configuré</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getAccountsByPlatform('linkedin').map((account) => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {account.accountName || 'Sans nom'}
                              </h4>
                              {account.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                  Par défaut
                                </span>
                              )}
                              {account.enabled ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">ID: {account.accountId}</p>
                            {account.expiresAt && (
                              <p className={`text-xs mt-1 ${isTokenExpiring(account.expiresAt) ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                                🕐 Token expire: {formatExpiryDate(account.expiresAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(account)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Snapchat Accounts */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <FaSnapchat className="w-5 h-5 text-yellow-500" />
                Snapchat ({getAccountsByPlatform('snapchat').length})
              </h3>
              {getAccountsByPlatform('snapchat').length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">Aucun compte Snapchat configuré</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getAccountsByPlatform('snapchat').map((account) => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {account.accountName || 'Sans nom'}
                              </h4>
                              {account.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                  Par défaut
                                </span>
                              )}
                              {account.enabled ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">ID: {account.accountId}</p>
                            {account.expiresAt && (
                              <p className={`text-xs mt-1 ${isTokenExpiring(account.expiresAt) ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                                🕐 Token expire: {formatExpiryDate(account.expiresAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(account)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-bold mb-2">💡 Configuration Meta (Instagram + Facebook) :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Créez une app Meta sur <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline inline-flex items-center gap-1">developers.facebook.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Ajoutez "Instagram Graph API" et "Facebook Login"</li>
                <li>Obtenez un Page Access Token (60 jours)</li>
                <li>Convertissez-le en Long-Lived Token via l'outil Meta</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingAccount ? 'Modifier le compte' : 'Ajouter un compte'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plateforme *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    disabled={!!editingAccount}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="snapchat">Snapchat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du compte *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Ex: @laia.skin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {formData.platform === 'instagram' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram Account ID *
                      </label>
                      <input
                        type="text"
                        value={formData.accountId}
                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                        placeholder="17841465917006851"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook Page ID *
                      </label>
                      <input
                        type="text"
                        value={formData.pageId}
                        onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                        placeholder="752355921291358"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                )}

                {formData.platform === 'facebook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook Page ID *
                    </label>
                    <input
                      type="text"
                      value={formData.pageId}
                      onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                      placeholder="752355921291358"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {(formData.platform === 'tiktok' || formData.platform === 'linkedin' || formData.platform === 'snapchat') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.platform === 'linkedin' ? 'LinkedIn Organization ID' : formData.platform === 'snapchat' ? 'Snapchat Ad Account ID' : 'TikTok Account ID'} *
                    </label>
                    <input
                      type="text"
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      placeholder={formData.platform === 'linkedin' ? 'urn:li:organization:123456' : formData.platform === 'snapchat' ? 'xxxx-xxxx-xxxx-xxxx' : '1234567890'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token (60 jours) *
                  </label>
                  <textarea
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="EAAE..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App ID Meta
                    </label>
                    <input
                      type="text"
                      value={formData.appId}
                      onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                      placeholder="24084077607882068"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App Secret
                    </label>
                    <input
                      type="password"
                      value={formData.appSecret}
                      onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration du token
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Les tokens Meta expirent après 60 jours</p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Compte activé</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoPublish}
                      onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Publication auto</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Par défaut</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingAccount(null); }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
                  >
                    {editingAccount ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
