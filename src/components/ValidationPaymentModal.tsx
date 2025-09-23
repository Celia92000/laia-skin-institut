"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, CreditCard, Euro, Calendar } from "lucide-react";

interface ValidationPaymentModalProps {
  reservation: any;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (data: any) => void;
  loyaltyProfile?: any;
}

export default function ValidationPaymentModal({
  reservation,
  isOpen,
  onClose,
  onValidate,
  loyaltyProfile
}: ValidationPaymentModalProps) {
  const [clientPresent, setClientPresent] = useState<boolean | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(reservation?.totalPrice || 0);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [applyLoyaltyDiscount, setApplyLoyaltyDiscount] = useState(false);
  const [applyReferralDiscount, setApplyReferralDiscount] = useState(false);
  
  // Calculer les réductions disponibles
  const nextSessionNumber = (loyaltyProfile?.individualServicesCount || 0) + 1;
  const isLoyaltyEligible = nextSessionNumber % 6 === 0;
  const loyaltyDiscount = isLoyaltyEligible ? 30 : 0;
  const referralDiscount = 20; // Réduction parrainage fixe
  
  // Calculer le montant final avec réductions
  const calculateFinalAmount = () => {
    let amount = reservation?.totalPrice || 0;
    if (applyLoyaltyDiscount && isLoyaltyEligible) {
      amount -= loyaltyDiscount;
    }
    if (applyReferralDiscount) {
      amount -= referralDiscount;
    }
    return Math.max(0, amount); // Ne pas aller en négatif
  };

  if (!isOpen) return null;

  const hasModifications = clientPresent !== null || paymentStatus !== null || paymentNotes !== '';

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Si on clique sur le fond (pas sur le modal lui-même)
    if (e.target === e.currentTarget) {
      if (hasModifications) {
        if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?')) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  const handleSubmit = () => {
    if (clientPresent === null) {
      alert('Veuillez indiquer si le client était présent');
      return;
    }

    if (paymentStatus === null) {
      alert('Veuillez indiquer si un paiement a été effectué');
      return;
    }

    const data: any = {
      status: clientPresent ? 'completed' : 'no_show'
    };

    if (paymentStatus === 'paid') {
      // Paiement effectué (client présent ou acompte si absent)
      data.paymentStatus = clientPresent ? 'paid' : 'partial';
      data.paymentAmount = paymentAmount;
      data.paymentMethod = paymentMethod;
      data.paymentDate = new Date().toISOString();
      
      // Ajouter les informations sur les réductions appliquées
      const discounts = [];
      if (applyLoyaltyDiscount && isLoyaltyEligible) {
        discounts.push(`Fidélité 6ème séance: -${loyaltyDiscount}€`);
        data.loyaltyDiscountApplied = true;
      }
      if (applyReferralDiscount) {
        discounts.push(`Parrainage: -${referralDiscount}€`);
        data.referralDiscountApplied = true;
      }
      
      let notes = paymentNotes;
      if (discounts.length > 0) {
        notes = `Réductions appliquées: ${discounts.join(', ')}${notes ? ' | ' + notes : ''}`;
      }
      if (!clientPresent && !notes) {
        notes = `Acompte reçu - Client absent`;
      }
      if (notes) {
        data.paymentNotes = notes;
      }
    } else if (paymentStatus === 'unpaid') {
      // Pas de paiement
      if (!clientPresent) {
        data.paymentStatus = 'no_show';
        data.paymentAmount = 0;
        data.paymentDate = new Date().toISOString();
        data.paymentNotes = paymentNotes || 'Client absent - Aucun paiement';
      } else {
        data.paymentStatus = 'unpaid';
        data.paymentAmount = 0;
        data.paymentDate = new Date().toISOString();
        if (paymentNotes) data.paymentNotes = paymentNotes;
      }
    }

    onValidate(data);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header fixe */}
        <div className="p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-serif font-medium text-[#2c3e50]">
            Validation du rendez-vous
          </h2>
          <button 
            onClick={() => {
              if (hasModifications) {
                if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informations de la réservation - Toujours visible */}
        <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] rounded-lg p-4 mb-6 border border-[#d4b5a0]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-[#2c3e50]">{reservation.userName}</span>
            <span className="text-[#d4b5a0] font-bold">{reservation.totalPrice}€</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#2c3e50]/70">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(reservation.date).toLocaleDateString('fr-FR')}
            </span>
            <span>{reservation.time}</span>
          </div>
          {reservation.services && (
            <div className="mt-2 pt-2 border-t border-[#d4b5a0]/10">
              <p className="text-xs text-[#2c3e50]/60">
                Services: {typeof reservation.services === 'string' 
                  ? reservation.services 
                  : Array.isArray(reservation.services) 
                    ? reservation.services.join(', ')
                    : 'Service non spécifié'}
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pt-0">
        {/* Étape 1 : Le client est-il venu ? */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#2c3e50] mb-3">
            1. Le client est-il venu au rendez-vous ?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setClientPresent(true);
                if (reservation.paymentStatus === 'paid') {
                  setPaymentStatus('paid');
                }
              }}
              className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                clientPresent === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-green-400 text-gray-600'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Oui, présent
            </button>
            <button
              onClick={() => {
                setClientPresent(false);
                setPaymentStatus(null);
              }}
              className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                clientPresent === false
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 hover:border-orange-400 text-gray-600'
              }`}
            >
              <XCircle className="w-5 h-5" />
              Non, absent
            </button>
          </div>
        </div>

        {/* Étape 2 : Paiement */}
        {clientPresent !== null && (
          <div className="mb-6 animate-fadeIn">
            <h3 className="text-sm font-medium text-[#2c3e50] mb-3">
              2. {clientPresent ? 'Le client a-t-il payé ?' : 'Un acompte a-t-il été versé ?'}
            </h3>
            
            {reservation.paymentStatus === 'paid' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Déjà payé ({reservation.paymentAmount}€ - {reservation.paymentMethod})
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setPaymentStatus('paid')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      paymentStatus === 'paid'
                        ? 'border-[#d4b5a0] bg-[#d4b5a0]/10 text-[#d4b5a0]'
                        : 'border-gray-300 hover:border-[#d4b5a0] text-gray-600'
                    }`}
                  >
                    <Euro className="w-5 h-5" />
                    Oui, payé
                  </button>
                  <button
                    onClick={() => setPaymentStatus('unpaid')}
                    className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      paymentStatus === 'unpaid'
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                    }`}
                  >
                    Non payé
                  </button>
                </div>

                {/* Détails du paiement */}
                {paymentStatus === 'paid' && (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Section des réductions */}
                    <div className="bg-gradient-to-r from-[#fdfbf7] to-[#f8f6f0] rounded-lg p-4 border border-[#d4b5a0]/20">
                      <h4 className="text-sm font-semibold text-[#2c3e50] mb-3">Réductions disponibles</h4>
                      
                      {/* Réduction fidélité */}
                      {isLoyaltyEligible && (
                        <label className="flex items-center justify-between mb-2 cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-all">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={applyLoyaltyDiscount}
                              onChange={(e) => {
                                setApplyLoyaltyDiscount(e.target.checked);
                                setPaymentAmount(e.target.checked 
                                  ? paymentAmount - loyaltyDiscount 
                                  : paymentAmount + loyaltyDiscount);
                              }}
                              className="w-5 h-5 text-[#d4b5a0] border-[#d4b5a0]/30 rounded focus:ring-[#d4b5a0]"
                            />
                            <div>
                              <p className="text-sm font-medium text-[#2c3e50]">
                                🎁 Fidélité - 6ème séance
                              </p>
                              <p className="text-xs text-[#2c3e50]/60">
                                Séance n°{nextSessionNumber} - Réduction automatique
                              </p>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold">-{loyaltyDiscount}€</span>
                        </label>
                      )}
                      
                      {/* Réduction parrainage */}
                      <label className="flex items-center justify-between cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-all">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={applyReferralDiscount}
                            onChange={(e) => {
                              setApplyReferralDiscount(e.target.checked);
                              setPaymentAmount(e.target.checked 
                                ? paymentAmount - referralDiscount 
                                : paymentAmount + referralDiscount);
                            }}
                            className="w-5 h-5 text-[#d4b5a0] border-[#d4b5a0]/30 rounded focus:ring-[#d4b5a0]"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#2c3e50]">
                              👥 Parrainage
                            </p>
                            <p className="text-xs text-[#2c3e50]/60">
                              Client parrainé ou parrain
                            </p>
                          </div>
                        </div>
                        <span className="text-green-600 font-bold">-{referralDiscount}€</span>
                      </label>
                      
                      {!isLoyaltyEligible && (
                        <p className="text-xs text-[#2c3e50]/60 mt-2 pl-2">
                          💡 Prochaine réduction fidélité dans {6 - (nextSessionNumber % 6)} séance(s)
                        </p>
                      )}
                    </div>
                    
                    {/* Montant à payer */}
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                        Montant à payer
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 pr-8 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        </div>
                        {(applyLoyaltyDiscount || applyReferralDiscount) && (
                          <div className="text-sm">
                            <span className="text-gray-400 line-through">{reservation.totalPrice}€</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                        Méthode de paiement
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      >
                        <option value="CB">Carte Bancaire</option>
                        <option value="Espèces">Espèces</option>
                        <option value="Virement">Virement</option>
                        <option value="Chèque">Chèque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                        Notes (optionnel)
                      </label>
                      <textarea
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder="Ex: Acompte, reste à payer..."
                        className="w-full px-3 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>

        {/* Boutons d'action - fixés en bas */}
        <div className="p-6 pt-0 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (hasModifications) {
                if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={clientPresent === null || paymentStatus === null}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Valider
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}