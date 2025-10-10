'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Gift, Clock, CheckCircle, XCircle, ArrowRight, History } from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface Discount {
  id: string;
  type: string;
  amount: number;
  status: string;
  originalReason: string;
  createdAt: string;
  usedAt?: string;
  expiresAt?: string;
  postponedTo?: string;
  postponedReason?: string;
  usedForReservation?: string;
}

interface DiscountHistoryProps {
  userId: string;
  isAdmin?: boolean;
}

export function DiscountHistory({ userId, isAdmin = false }: DiscountHistoryProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [postponeReason, setPostponeReason] = useState('');
  const [postponeDate, setPostponeDate] = useState('');
  const [showPostponeModal, setShowPostponeModal] = useState(false);

  useEffect(() => {
    loadDiscounts();
  }, [userId]);

  const loadDiscounts = async () => {
    try {
      const response = await fetch(`/api/discounts/history?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error('Erreur chargement historique réductions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostpone = async (discount: Discount) => {
    setSelectedDiscount(discount);
    setShowPostponeModal(true);
    // Définir la date par défaut au mois suivant
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setPostponeDate(formatDateLocal(nextMonth));
  };

  const confirmPostpone = async () => {
    if (!selectedDiscount || !postponeDate) return;

    try {
      const response = await fetch('/api/discounts/postpone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountId: selectedDiscount.id,
          postponeTo: postponeDate,
          reason: postponeReason
        })
      });

      if (response.ok) {
        await loadDiscounts();
        setShowPostponeModal(false);
        setSelectedDiscount(null);
        setPostponeReason('');
      }
    } catch (error) {
      console.error('Erreur report réduction:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      available: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      used: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
      expired: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
      postponed: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> }
    };

    const badge = badges[status as keyof typeof badges] || badges.available;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {status === 'available' && 'Disponible'}
        {status === 'used' && 'Utilisée'}
        {status === 'expired' && 'Expirée'}
        {status === 'postponed' && 'Reportée'}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      service_5: '5ème soin',
      package_9: '9ème séance',
      birthday: 'Anniversaire',
      referral: 'Parrainage',
      postponed: 'Report'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 mb-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-[#d4b5a0]" />
          Historique des réductions
        </h3>
        <div className="text-sm text-gray-500">
          {discounts.filter(d => d.status === 'available').length} réduction(s) disponible(s)
        </div>
      </div>

      {discounts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Aucune réduction pour le moment</p>
          <p className="text-sm text-gray-500 mt-1">
            Continuez vos soins pour débloquer des réductions !
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#d4b5a0]">
                      -{discount.amount}€
                    </span>
                    {getStatusBadge(discount.status)}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {discount.originalReason}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Créée le {new Date(discount.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    
                    {discount.usedAt && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Utilisée le {new Date(discount.usedAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    
                    {discount.expiresAt && discount.status === 'available' && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Clock className="w-3 h-3" />
                        Expire le {new Date(discount.expiresAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    
                    {discount.postponedTo && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <ArrowRight className="w-3 h-3" />
                        Reportée au {new Date(discount.postponedTo).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  
                  {discount.postponedReason && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Raison du report: {discount.postponedReason}
                    </p>
                  )}
                </div>
                
                {isAdmin && discount.status === 'available' && (
                  <button
                    onClick={() => handlePostpone(discount)}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Reporter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de report */}
      {showPostponeModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reporter la réduction</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Réduction: <span className="font-bold text-[#d4b5a0]">-{selectedDiscount.amount}€</span>
                </p>
                <p className="text-sm text-gray-600">
                  {selectedDiscount.originalReason}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporter jusqu'au
                </label>
                <input
                  type="date"
                  value={postponeDate}
                  onChange={(e) => setPostponeDate(e.target.value)}
                  min={formatDateLocal(new Date())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison du report (optionnel)
                </label>
                <textarea
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="Ex: Client en vacances, report à sa demande..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowPostponeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmPostpone}
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
                >
                  Confirmer le report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}