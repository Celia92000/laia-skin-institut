'use client';

import { useState, useEffect } from 'react';
import { Gift, Star, Award, TrendingUp, Calendar, User, CheckCircle, Euro, Cake, Heart, Users, AlertCircle, Download, Plus, Edit2, X, Settings, Save } from 'lucide-react';

interface LoyaltyProfile {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    birthDate?: string;
  };
  individualServicesCount: number;
  packagesCount: number;
  totalSpent: number;
  lastVisit?: Date;
}

interface AdminLoyaltyTabProps {
  clients: any[];
  reservations: any[];
  loyaltyProfiles: LoyaltyProfile[];
  onPointsAdd?: (clientId: string, points: number) => void;
  onServicesModify?: (profileId: string, delta: number) => void;
  onPackagesModify?: (profileId: string, delta: number) => void;
}

export default function AdminLoyaltyTab({ clients, reservations, loyaltyProfiles, onPointsAdd, onServicesModify, onPackagesModify }: AdminLoyaltyTabProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [bonusReason, setBonusReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'birthday'>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState({
    serviceThreshold: 6,
    serviceDiscount: 20,
    packageThreshold: 4, 
    packageDiscount: 40,
    birthdayDiscount: 10,
    referralBonus: 1,
    reviewBonus: 1
  });
  const [editingSettings, setEditingSettings] = useState(false);

  // Charger les paramètres de fidélité au montage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/loyalty-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const settings = await response.json();
          setLoyaltySettings(settings);
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      }
    };
    loadSettings();
  }, []);

  // Calcul des statistiques globales
  const stats = {
    totalClients: loyaltyProfiles.length,
    activeClients: loyaltyProfiles.filter(p => p.lastVisit && new Date(p.lastVisit) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length,
    readyFor6thService: loyaltyProfiles.filter(p => p.individualServicesCount === 5).length,
    readyFor4thPackage: loyaltyProfiles.filter(p => p.packagesCount === 3).length,
    birthdaysThisMonth: clients.filter(c => {
      if (!c.birthdate) return false;
      const birthMonth = new Date(c.birthdate).getMonth();
      return birthMonth === new Date().getMonth();
    }).length
  };

  // Clients avec réductions disponibles
  const getClientsWithRewards = () => {
    return loyaltyProfiles.filter(profile => {
      const isReady6thService = profile.individualServicesCount === (loyaltySettings.serviceThreshold - 1);
      const isReady4thPackage = profile.packagesCount === (loyaltySettings.packageThreshold - 1);
      const hasBirthday = profile.user.birthDate && 
        new Date(profile.user.birthDate).getMonth() === new Date().getMonth();
      
      if (filter === 'ready') return isReady6thService || isReady4thPackage;
      if (filter === 'birthday') return hasBirthday;
      return isReady6thService || isReady4thPackage || hasBirthday;
    });
  };

  const clientsWithRewards = getClientsWithRewards();

  // Fonction pour obtenir le niveau de fidélité
  const getLoyaltyLevel = (profile: LoyaltyProfile) => {
    const total = profile.individualServicesCount + (profile.packagesCount * 3);
    if (total >= 20) return { level: 'VIP', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '⭐' };
    if (total >= 10) return { level: 'Premium', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '💎' };
    if (total >= 5) return { level: 'Fidèle', color: 'text-green-600', bgColor: 'bg-green-100', icon: '❤️' };
    return { level: 'Nouveau', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '👋' };
  };

  const handleAddBonus = () => {
    if (selectedClient && bonusPoints > 0) {
      onPointsAdd?.(selectedClient, bonusPoints);
      setShowAddPointsModal(false);
      setBonusPoints(0);
      setBonusReason('');
      setSelectedClient(null);
    }
  };

  const handleModifyServices = async (profileId: string, delta: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/loyalty/${profileId}/services`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delta })
      });
      
      if (response.ok) {
        // Actualiser les données
        onServicesModify?.(profileId, delta);
      }
    } catch (error) {
      console.error('Erreur modification soins:', error);
    }
  };

  const handleModifyPackages = async (profileId: string, delta: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/loyalty/${profileId}/packages`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delta })
      });
      
      if (response.ok) {
        // Actualiser les données
        onPackagesModify?.(profileId, delta);
      }
    } catch (error) {
      console.error('Erreur modification forfaits:', error);
    }
  };

  const handleApplyDiscount = async (profile: LoyaltyProfile, discountType: 'service' | 'package' | 'birthday', amount: number) => {
    try {
      const token = localStorage.getItem('token');
      
      // Créer une note de réduction dans le profil du client
      const response = await fetch('/api/admin/loyalty/apply-discount', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: profile.userId,
          discountType,
          amount,
          description: discountType === 'service' ? `Réduction 6ème soin: -${amount}€` :
                       discountType === 'package' ? `Réduction 4ème forfait: -${amount}€` :
                       `Réduction anniversaire: -${amount}€`
        })
      });

      if (response.ok) {
        // Réinitialiser le compteur si nécessaire
        if (discountType === 'service') {
          await handleModifyServices(profile.id, -6); // Reset à 0
        } else if (discountType === 'package') {
          await handleModifyPackages(profile.id, -4); // Reset à 0
        }
        
        alert(`✅ Réduction de ${amount}€ appliquée pour ${profile.user.name}\n\nLa réduction sera automatiquement déduite lors de la prochaine réservation.`);
      } else {
        alert('❌ Erreur lors de l\'application de la réduction');
      }
    } catch (error) {
      console.error('Erreur application réduction:', error);
      alert('❌ Erreur lors de l\'application de la réduction');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-[#2c3e50]">
          Programme de Fidélité
        </h2>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Gérer les réductions
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{stats.totalClients}</span>
          </div>
          <p className="text-sm text-blue-700">Clients inscrits</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{stats.activeClients}</span>
          </div>
          <p className="text-sm text-green-700">Actifs (90 jours)</p>
        </div>

        <div className="bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-8 h-8 text-[#d4b5a0]" />
            <span className="text-2xl font-bold text-[#2c3e50]">{stats.readyFor6thService}</span>
          </div>
          <p className="text-sm text-[#2c3e50]/80">Prêts pour -20€</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{stats.readyFor4thPackage}</span>
          </div>
          <p className="text-sm text-purple-700">Prêts pour -40€</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Cake className="w-8 h-8 text-pink-600" />
            <span className="text-2xl font-bold text-pink-900">{stats.birthdaysThisMonth}</span>
          </div>
          <p className="text-sm text-pink-700">Anniversaires</p>
        </div>
      </div>

      {/* Alertes pour réductions disponibles */}
      {clientsWithRewards.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertCircle className="w-6 h-6 text-yellow-600 animate-pulse" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {clientsWithRewards.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#2c3e50]">
                Clients avec réductions disponibles !
              </h3>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-[#d4b5a0] text-white' : 'bg-white text-gray-600'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'ready' ? 'bg-[#d4b5a0] text-white' : 'bg-white text-gray-600'}`}
              >
                Fidélité
              </button>
              <button
                onClick={() => setFilter('birthday')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'birthday' ? 'bg-[#d4b5a0] text-white' : 'bg-white text-gray-600'}`}
              >
                Anniversaires
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {clientsWithRewards.map(profile => {
              const isReady6th = profile.individualServicesCount === 5;
              const isReady4th = profile.packagesCount === 3;
              const hasBirthday = profile.user.birthDate && 
                new Date(profile.user.birthDate).getMonth() === new Date().getMonth();

              return (
                <div key={profile.id} className="bg-white rounded-lg p-4 flex justify-between items-center border border-yellow-200">
                  <div className="flex-1">
                    <p className="font-semibold text-[#2c3e50]">{profile.user.name}</p>
                    <p className="text-sm text-[#2c3e50]/60">{profile.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      {isReady6th && (
                        <span className="px-2 py-1 bg-[#d4b5a0]/20 text-[#2c3e50] rounded-full text-xs font-bold">
                          5 soins ✓ → 6ème = -20€
                        </span>
                      )}
                      {isReady4th && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          3 forfaits ✓ → 4ème = -40€
                        </span>
                      )}
                      {hasBirthday && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                          🎂 Anniversaire ce mois
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isReady6th && (
                      <button
                        onClick={() => handleApplyDiscount(profile, 'service', 20)}
                        className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Euro className="w-4 h-4" />
                        -20€
                      </button>
                    )}
                    {isReady4th && (
                      <button
                        onClick={() => handleApplyDiscount(profile, 'package', 40)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Euro className="w-4 h-4" />
                        -40€
                      </button>
                    )}
                    {hasBirthday && (
                      <button
                        onClick={() => handleApplyDiscount(profile, 'birthday', 10)}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Cake className="w-4 h-4" />
                        -10€
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cartes de fidélité visuelles */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Carte Soins Individuels */}
        <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-4">
            <Gift className="w-12 h-12 mx-auto mb-2 text-white/80" />
            <h3 className="text-xl font-bold">Carte Soins Individuels</h3>
            <p className="text-lg">6ème soin = -20€</p>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4">
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div 
                  key={num}
                  className="aspect-square rounded-lg bg-white/30 flex items-center justify-center text-lg font-bold text-white"
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-center mt-3 text-white/90">
              Validez à chaque soin, -20€ au 6ème !
            </p>
          </div>
        </div>

        {/* Carte Forfaits */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-4">
            <Star className="w-12 h-12 mx-auto mb-2 text-white/80" />
            <h3 className="text-xl font-bold">Carte Forfaits Premium</h3>
            <p className="text-lg">4ème forfait = -40€</p>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className="aspect-square rounded-lg bg-white/30 flex items-center justify-center text-xl font-bold text-white"
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-center mt-3 text-white/90">
              Validez à chaque forfait, -40€ au 4ème !
            </p>
          </div>
        </div>
      </div>

      {/* Liste complète des clients */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#2c3e50]">Tous les profils de fidélité</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Soins</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Forfaits</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total dépensé</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière visite</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loyaltyProfiles.map(profile => {
                const level = getLoyaltyLevel(profile);
                const progress6 = (profile.individualServicesCount % 6) / 6 * 100;
                const progress4 = (profile.packagesCount % 4) / 4 * 100;
                
                return (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-[#2c3e50]">{profile.user.name}</p>
                        <p className="text-xs text-gray-500">{profile.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${level.bgColor} ${level.color}`}>
                        {level.icon} {level.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModifyServices(profile.id, -1)}
                          className="w-6 h-6 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center justify-center"
                          title="Retirer un soin"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium min-w-[20px] text-center">{profile.individualServicesCount}</span>
                        <button
                          onClick={() => handleModifyServices(profile.id, 1)}
                          className="w-6 h-6 bg-green-100 text-green-600 rounded-full hover:bg-green-200 flex items-center justify-center"
                          title="Ajouter un soin"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#d4b5a0] h-2 rounded-full transition-all"
                            style={{ width: `${progress6}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {6 - (profile.individualServicesCount % 6)} restants
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModifyPackages(profile.id, -1)}
                          className="w-6 h-6 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center justify-center"
                          title="Retirer un forfait"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium min-w-[20px] text-center">{profile.packagesCount}</span>
                        <button
                          onClick={() => handleModifyPackages(profile.id, 1)}
                          className="w-6 h-6 bg-green-100 text-green-600 rounded-full hover:bg-green-200 flex items-center justify-center"
                          title="Ajouter un forfait"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress4}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {4 - (profile.packagesCount % 4)} restants
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#2c3e50]">{profile.totalSpent}€</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.lastVisit 
                        ? new Date(profile.lastVisit).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedClient(profile.userId);
                          setShowAddPointsModal(true);
                        }}
                        className="text-[#d4b5a0] hover:text-[#c9a084]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de configuration des réductions */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2c3e50]">Configuration des Réductions</h3>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setEditingSettings(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Carte Soins Individuels */}
              <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-5">
                <h4 className="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#d4b5a0]" />
                  Carte Soins Individuels
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Nombre de soins requis
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.serviceThreshold}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, serviceThreshold: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Montant de la réduction (€)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.serviceDiscount}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, serviceDiscount: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <p className="text-sm text-[#2c3e50]/60 mt-2">
                  Actuellement : {loyaltySettings.serviceThreshold}ème soin = -{loyaltySettings.serviceDiscount}€
                </p>
              </div>

              {/* Carte Forfaits */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                <h4 className="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Carte Forfaits Premium
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Nombre de forfaits requis
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.packageThreshold}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, packageThreshold: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Montant de la réduction (€)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.packageDiscount}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, packageDiscount: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <p className="text-sm text-[#2c3e50]/60 mt-2">
                  Actuellement : {loyaltySettings.packageThreshold}ème forfait = -{loyaltySettings.packageDiscount}€
                </p>
              </div>

              {/* Réductions spéciales */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5">
                <h4 className="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-600" />
                  Réductions Spéciales
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Réduction anniversaire (€)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.birthdayDiscount}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, birthdayDiscount: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Bonus parrainage (soins gratuits)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.referralBonus}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, referralBonus: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                      Bonus avis Google (soins gratuits)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.reviewBonus}
                      onChange={(e) => setLoyaltySettings({...loyaltySettings, reviewBonus: parseInt(e.target.value)})}
                      disabled={!editingSettings}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {!editingSettings ? (
                  <button
                    onClick={() => setEditingSettings(true)}
                    className="px-6 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingSettings(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch('/api/admin/loyalty-settings', {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(loyaltySettings)
                          });
                          
                          if (response.ok) {
                            alert('✅ Paramètres de fidélité mis à jour avec succès !');
                            setEditingSettings(false);
                          } else {
                            alert('❌ Erreur lors de la sauvegarde des paramètres');
                          }
                        } catch (error) {
                          console.error('Erreur sauvegarde:', error);
                          alert('❌ Erreur lors de la sauvegarde des paramètres');
                        }
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout de points bonus */}
      {showAddPointsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2c3e50]">Ajouter un bonus</h3>
              <button
                onClick={() => {
                  setShowAddPointsModal(false);
                  setBonusPoints(0);
                  setBonusReason('');
                  setSelectedClient(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Nombre de soins/forfaits
                </label>
                <input
                  type="number"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder="Ex: 1 pour un soin gratuit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Raison
                </label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder="Ex: Parrainage, compensation..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddPointsModal(false);
                    setBonusPoints(0);
                    setBonusReason('');
                    setSelectedClient(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBonus}
                  className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}