"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Edit, Trash, Check, X, Key, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

interface WhatsAppAccount {
  id: string;
  accountName?: string;
  phoneNumber?: string;
  phoneNumberId?: string;
  enabled: boolean;
  isDefault: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function WhatsAppAPISync() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WhatsAppAccount | null>(null);

  const [formData, setFormData] = useState({
    accountName: '',
    phoneNumber: '',
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    appId: '',
    appSecret: '',
    webhookVerifyToken: '',
    expiresAt: '',
    enabled: true,
    isDefault: false
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts?type=whatsapp', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.whatsapp || []);
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
        ? { ...formData, id: editingAccount.id, type: 'whatsapp' }
        : { ...formData, type: 'whatsapp' };

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
      const response = await fetch(`/api/admin/accounts?id=${id}&type=whatsapp`, {
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
      accountName: '',
      phoneNumber: '',
      phoneNumberId: '',
      businessAccountId: '',
      accessToken: '',
      appId: '',
      appSecret: '',
      webhookVerifyToken: '',
      expiresAt: '',
      enabled: true,
      isDefault: false
    });
  };

  const openEditModal = (account: WhatsAppAccount) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName || '',
      phoneNumber: account.phoneNumber || '',
      phoneNumberId: account.phoneNumberId || '',
      businessAccountId: '',
      accessToken: '',
      appId: '',
      appSecret: '',
      webhookVerifyToken: '',
      expiresAt: account.expiresAt || '',
      enabled: account.enabled,
      isDefault: account.isDefault
    });
    setShowAddModal(true);
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
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-6 h-6 text-green-500" />
                Synchronisation API WhatsApp
              </h2>
              <p className="text-gray-600 mt-1">
                Gérez vos comptes WhatsApp Business API
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un compte
            </button>
          </div>
        </div>

        {/* Accounts list */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Aucun compte configuré</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Ajouter votre premier compte
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <MessageCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {account.accountName || account.phoneNumber || 'Sans nom'}
                        </h3>
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
                      <p className="text-sm text-gray-600">{account.phoneNumber}</p>
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

        {/* Info box */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-bold mb-2">💡 Pour configurer WhatsApp Business API :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Créez une app Meta sur <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-green-700 underline inline-flex items-center gap-1">developers.facebook.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Activez "WhatsApp Business API"</li>
                <li>Obtenez votre Phone Number ID et Access Token (60 jours)</li>
                <li>Configurez votre webhook pour recevoir les messages</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingAccount ? 'Modifier le compte' : 'Ajouter un compte WhatsApp'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du compte (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Ex: WhatsApp Laia Skin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+33612345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number ID *
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumberId}
                      onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                      placeholder="123456789012345"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token (60 jours) *
                  </label>
                  <textarea
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="EAAE..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
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
                      placeholder="123456789012345"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Account ID
                    </label>
                    <input
                      type="text"
                      value={formData.businessAccountId}
                      onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                      placeholder="123456789012345"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration du token
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Les tokens expirent après 60 jours</p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Compte activé</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Définir par défaut</span>
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
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
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
