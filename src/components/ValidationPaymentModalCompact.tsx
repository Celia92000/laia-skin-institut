"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, CreditCard, Euro, Calendar, Gift, ChevronDown, ChevronUp, Banknote, Building2 } from "lucide-react";

interface ValidationPaymentModalProps {
  reservation: any;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (data: any) => void;
  loyaltyProfile?: any;
}

export default function ValidationPaymentModalCompact({
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

  // Discount states
  const [applyLoyaltyDiscount, setApplyLoyaltyDiscount] = useState(false);
  const [applyPackageDiscount, setApplyPackageDiscount] = useState(false);
  const [applyReferralSponsorDiscount, setApplyReferralSponsorDiscount] = useState(false);
  const [applyReferralReferredDiscount, setApplyReferralReferredDiscount] = useState(false);
  const [applyBirthdayDiscount, setApplyBirthdayDiscount] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [showManualDiscountInput, setShowManualDiscountInput] = useState(false);

  // UI states
  const [discountSectionExpanded, setDiscountSectionExpanded] = useState(false);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);

  // Eligibility states
  const [isBirthdayMonth, setIsBirthdayMonth] = useState(false);
  const [referralStatus, setReferralStatus] = useState<{
    isReferred: boolean;
    isSponsor: boolean;
    referredBy?: string;
    hasUsedReferralDiscount?: boolean;
    pendingReferrals?: number;
  }>({ isReferred: false, isSponsor: false });

  // Gift card states
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardData, setGiftCardData] = useState<any>(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [isVerifyingGiftCard, setIsVerifyingGiftCard] = useState(false);
  const [giftCardAmount, setGiftCardAmount] = useState(0);

  // Calculate discounts
  const individualServicesCount = loyaltyProfile?.individualServicesCount || 0;
  const packagesCount = loyaltyProfile?.packagesCount || 0;

  const isLoyaltyEligible = individualServicesCount >= 5;
  const loyaltyDiscount = isLoyaltyEligible ? 20 : 0;

  const isPackageEligible = packagesCount >= 2;
  const packageDiscount = isPackageEligible ? 40 : 0;

  const referralSponsorDiscount = 15;
  const referralReferredDiscount = 10;
  const birthdayDiscount = 10;

  // Auto-apply discounts on mount
  useEffect(() => {
    if (isOpen) {
      if (isLoyaltyEligible && !applyLoyaltyDiscount) {
        setApplyLoyaltyDiscount(true);
      }
      if (isPackageEligible && !applyPackageDiscount) {
        setApplyPackageDiscount(true);
      }
      checkReferralStatus();
      checkBirthdayStatus();
    }
  }, [isOpen, isLoyaltyEligible, isPackageEligible]);

  // Check referral status
  const checkReferralStatus = async () => {
    if (!reservation?.userId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/client-referral-status?userId=${reservation.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralStatus(data);

        if (data.isReferred && !data.hasUsedReferralDiscount) {
          setApplyReferralReferredDiscount(true);
        }
        if (data.isSponsor && data.pendingReferrals > 0) {
          setApplyReferralSponsorDiscount(true);
        }
      }
    } catch (error) {
      console.error('Erreur vérification statut parrainage:', error);
    }
  };

  // Check birthday status
  const checkBirthdayStatus = async () => {
    if (!reservation?.userId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${reservation.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.birthday) {
          const birthday = new Date(userData.birthday);
          const today = new Date();

          if (birthday.getMonth() === today.getMonth()) {
            setIsBirthdayMonth(true);

            const discountResponse = await fetch(`/api/admin/discounts?userId=${reservation.userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (discountResponse.ok) {
              const discounts = await discountResponse.json();
              const hasBirthdayDiscount = discounts.some((d: any) =>
                d.type === 'birthday' &&
                d.status === 'available' &&
                new Date(d.createdAt).getFullYear() === today.getFullYear()
              );

              if (hasBirthdayDiscount) {
                setApplyBirthdayDiscount(true);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur vérification anniversaire:', error);
    }
  };

  // Verify gift card
  const verifyGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setGiftCardError('Veuillez entrer un code');
      return;
    }

    setIsVerifyingGiftCard(true);
    setGiftCardError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gift-cards/verify?code=${giftCardCode.toUpperCase()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setGiftCardData(data.giftCard);
        const maxUsable = Math.min(data.giftCard.balance, calculateFinalAmount());
        setGiftCardAmount(maxUsable);
        setGiftCardError('');
      } else {
        setGiftCardError(data.error || 'Code invalide');
        setGiftCardData(null);
      }
    } catch (error) {
      setGiftCardError('Erreur lors de la vérification');
      setGiftCardData(null);
    } finally {
      setIsVerifyingGiftCard(false);
    }
  };

  // Calculate final amount with discounts
  const calculateFinalAmount = () => {
    let amount = reservation?.totalPrice || 0;
    if (applyLoyaltyDiscount && isLoyaltyEligible) {
      amount -= loyaltyDiscount;
    }
    if (applyPackageDiscount && isPackageEligible) {
      amount -= packageDiscount;
    }
    if (applyReferralSponsorDiscount) {
      amount -= referralSponsorDiscount;
    }
    if (applyReferralReferredDiscount) {
      amount -= referralReferredDiscount;
    }
    if (applyBirthdayDiscount) {
      amount -= birthdayDiscount;
    }
    amount -= manualDiscount;
    return Math.max(0, amount);
  };

  // Update payment amount when discounts change
  useEffect(() => {
    setPaymentAmount(calculateFinalAmount() - giftCardAmount);
  }, [applyLoyaltyDiscount, applyPackageDiscount, applyReferralSponsorDiscount, applyReferralReferredDiscount, applyBirthdayDiscount, manualDiscount, giftCardAmount]);

  // Calculate total discount
  const getTotalDiscount = () => {
    let total = 0;
    if (applyLoyaltyDiscount && isLoyaltyEligible) total += loyaltyDiscount;
    if (applyPackageDiscount && isPackageEligible) total += packageDiscount;
    if (applyReferralSponsorDiscount) total += referralSponsorDiscount;
    if (applyReferralReferredDiscount) total += referralReferredDiscount;
    if (applyBirthdayDiscount) total += birthdayDiscount;
    total += manualDiscount;
    return total;
  };

  // Count active discounts
  const getActiveDiscountCount = () => {
    let count = 0;
    if (applyLoyaltyDiscount && isLoyaltyEligible) count++;
    if (applyPackageDiscount && isPackageEligible) count++;
    if (applyReferralSponsorDiscount) count++;
    if (applyReferralReferredDiscount) count++;
    if (applyBirthdayDiscount) count++;
    if (manualDiscount > 0) count++;
    return count;
  };

  if (!isOpen) return null;

  const hasModifications = clientPresent !== null || paymentStatus !== null || paymentNotes !== '';

  const handleBackdropClick = (e: React.MouseEvent) => {
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
      data.paymentStatus = clientPresent ? 'paid' : 'partial';
      data.paymentAmount = paymentAmount;
      data.paymentMethod = paymentMethod;
      data.paymentDate = new Date().toISOString();

      const discounts = [];
      if (applyLoyaltyDiscount && isLoyaltyEligible) {
        discounts.push(`Fidélité 5 soins: -${loyaltyDiscount}€`);
        data.loyaltyDiscountApplied = true;
        data.resetIndividualServicesCount = true;
      }
      if (applyPackageDiscount && isPackageEligible) {
        discounts.push(`Fidélité 3 forfaits: -${packageDiscount}€`);
        data.packageDiscountApplied = true;
        data.resetPackagesCount = true;
      }
      if (applyReferralSponsorDiscount) {
        discounts.push(`Parrainage Parrain: -${referralSponsorDiscount}€`);
        data.referralSponsorDiscountApplied = true;
      }
      if (applyReferralReferredDiscount) {
        discounts.push(`Parrainage Filleul: -${referralReferredDiscount}€`);
        data.referralReferredDiscountApplied = true;
      }
      if (applyBirthdayDiscount) {
        discounts.push(`Anniversaire: -${birthdayDiscount}€`);
        data.birthdayDiscountApplied = true;
      }
      if (manualDiscount > 0) {
        discounts.push(`Réduction manuelle: -${manualDiscount}€`);
        data.manualDiscount = manualDiscount;
      }
      if (giftCardAmount > 0 && giftCardData) {
        discounts.push(`Carte cadeau ${giftCardData.code}: -${giftCardAmount}€`);
        data.giftCardId = giftCardData.id;
        data.giftCardUsedAmount = giftCardAmount;
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

  const totalDiscount = getTotalDiscount();
  const activeDiscountCount = getActiveDiscountCount();
  const hasAvailableDiscounts = isLoyaltyEligible || isPackageEligible || referralStatus.isReferred || referralStatus.isSponsor || isBirthdayMonth;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-serif font-medium text-[#2c3e50]">
            Validation du RDV
          </h2>
          <button
            onClick={() => {
              if (hasModifications) {
                if (confirm('Modifications non enregistrées. Fermer ?')) {
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Reservation info - Compact */}
          <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] rounded-lg p-3 border border-[#d4b5a0]/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#2c3e50] text-sm">{reservation.userName}</span>
              <div className="flex items-center gap-1 text-xs text-[#2c3e50]/70">
                <Calendar className="w-3 h-3" />
                {new Date(reservation.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} {reservation.time}
              </div>
            </div>
          </div>

          {/* Step 1: Client Present */}
          <div>
            <h3 className="text-sm font-semibold text-[#2c3e50] mb-2">
              1. Le client est-il venu ?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setClientPresent(true);
                  if (reservation.paymentStatus === 'paid') {
                    setPaymentStatus('paid');
                  }
                }}
                className={`py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                  clientPresent === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400 text-gray-600'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Oui
              </button>
              <button
                onClick={() => {
                  setClientPresent(false);
                  setPaymentStatus(null);
                }}
                className={`py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                  clientPresent === false
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-orange-400 text-gray-600'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Non
              </button>
            </div>
          </div>

          {/* Step 2: Payment */}
          {clientPresent !== null && (
            <div className="animate-fadeIn space-y-3">
              <h3 className="text-sm font-semibold text-[#2c3e50]">
                2. {clientPresent ? 'Le client a-t-il payé ?' : 'Un acompte a-t-il été versé ?'}
              </h3>

              {reservation.paymentStatus === 'paid' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Déjà payé ({reservation.paymentAmount}€ - {reservation.paymentMethod})
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentStatus('paid')}
                      className={`py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                        paymentStatus === 'paid'
                          ? 'border-[#d4b5a0] bg-[#d4b5a0]/10 text-[#d4b5a0]'
                          : 'border-gray-300 hover:border-[#d4b5a0] text-gray-600'
                      }`}
                    >
                      <Euro className="w-4 h-4" />
                      Oui, payé
                    </button>
                    <button
                      onClick={() => setPaymentStatus('unpaid')}
                      className={`py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                        paymentStatus === 'unpaid'
                          ? 'border-gray-500 bg-gray-50 text-gray-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-600'
                      }`}
                    >
                      Non payé
                    </button>
                  </div>

                  {/* Payment Details */}
                  {paymentStatus === 'paid' && (
                    <div className="space-y-3 animate-fadeIn">
                      {/* Discount Badge - Collapsible */}
                      {hasAvailableDiscounts && (
                        <button
                          onClick={() => setDiscountSectionExpanded(!discountSectionExpanded)}
                          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">
                              {activeDiscountCount > 0
                                ? `${activeDiscountCount} réduction${activeDiscountCount > 1 ? 's' : ''} (-${totalDiscount}€)`
                                : 'Réductions disponibles'
                              }
                            </span>
                          </div>
                          {discountSectionExpanded ? (
                            <ChevronUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                      )}

                      {/* Expanded Discount Options */}
                      {discountSectionExpanded && (
                        <div className="space-y-2 pl-2 animate-fadeIn">
                          {/* Loyalty discount */}
                          {isLoyaltyEligible && (
                            <label className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-all">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={applyLoyaltyDiscount}
                                  onChange={(e) => setApplyLoyaltyDiscount(e.target.checked)}
                                  className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/30 rounded"
                                />
                                <span className="text-xs font-medium text-[#2c3e50]">
                                  Fidélité 5 soins ({individualServicesCount}/5)
                                </span>
                              </div>
                              <span className="text-xs font-bold text-green-600">-{loyaltyDiscount}€</span>
                            </label>
                          )}

                          {/* Package discount */}
                          {isPackageEligible && (
                            <label className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-all">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={applyPackageDiscount}
                                  onChange={(e) => setApplyPackageDiscount(e.target.checked)}
                                  className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/30 rounded"
                                />
                                <span className="text-xs font-medium text-[#2c3e50]">
                                  Fidélité forfaits ({packagesCount} forfaits)
                                </span>
                              </div>
                              <span className="text-xs font-bold text-green-600">-{packageDiscount}€</span>
                            </label>
                          )}

                          {/* Referral sponsor */}
                          <label className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-all">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={applyReferralSponsorDiscount}
                                onChange={(e) => {
                                  setApplyReferralSponsorDiscount(e.target.checked);
                                  if (e.target.checked) {
                                    setApplyReferralReferredDiscount(false);
                                  }
                                }}
                                className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/30 rounded"
                              />
                              <span className="text-xs font-medium text-[#2c3e50]">Parrainage Parrain</span>
                            </div>
                            <span className="text-xs font-bold text-green-600">-{referralSponsorDiscount}€</span>
                          </label>

                          {/* Referral referred */}
                          <label className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-all">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={applyReferralReferredDiscount}
                                onChange={(e) => {
                                  setApplyReferralReferredDiscount(e.target.checked);
                                  if (e.target.checked) {
                                    setApplyReferralSponsorDiscount(false);
                                  }
                                }}
                                className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/30 rounded"
                              />
                              <span className="text-xs font-medium text-[#2c3e50]">Parrainage Filleul</span>
                            </div>
                            <span className="text-xs font-bold text-green-600">-{referralReferredDiscount}€</span>
                          </label>

                          {/* Birthday discount */}
                          {isBirthdayMonth && (
                            <label className="flex items-center justify-between p-2 rounded-lg bg-pink-50 border border-pink-200 cursor-pointer hover:bg-pink-100 transition-all">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={applyBirthdayDiscount}
                                  onChange={(e) => setApplyBirthdayDiscount(e.target.checked)}
                                  className="w-4 h-4 text-pink-500 border-pink-300 rounded"
                                />
                                <span className="text-xs font-medium text-[#2c3e50]">Anniversaire</span>
                              </div>
                              <span className="text-xs font-bold text-green-600">-{birthdayDiscount}€</span>
                            </label>
                          )}

                          {/* Manual discount */}
                          {!showManualDiscountInput ? (
                            <button
                              onClick={() => setShowManualDiscountInput(true)}
                              className="text-xs text-[#d4b5a0] hover:text-[#b89574] font-medium"
                            >
                              + Ajouter réduction manuelle
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={manualDiscount}
                                onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                                placeholder="Montant"
                                className="flex-1 px-2 py-1 text-xs border border-[#d4b5a0]/30 rounded focus:ring-1 focus:ring-[#d4b5a0]"
                              />
                              <span className="text-xs">€</span>
                              <button
                                onClick={() => {
                                  setManualDiscount(0);
                                  setShowManualDiscountInput(false);
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price Display - Prominent */}
                      <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/5 rounded-xl p-4 border-2 border-[#d4b5a0]/30">
                        <div className="text-center">
                          <div className="text-xs text-[#2c3e50]/60 mb-1">Montant à payer</div>
                          <div className="flex items-center justify-center gap-2">
                            {totalDiscount > 0 && (
                              <span className="text-lg text-gray-400 line-through">{reservation.totalPrice}€</span>
                            )}
                            <span className="text-3xl font-bold text-[#d4b5a0]">
                              {calculateFinalAmount() - giftCardAmount}€
                            </span>
                          </div>
                          {totalDiscount > 0 && (
                            <div className="text-xs text-green-600 font-semibold mt-1">
                              Économie: {totalDiscount}€
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Methods - Horizontal Icons */}
                      <div>
                        <label className="block text-xs font-medium text-[#2c3e50] mb-2">
                          Méthode de paiement
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setPaymentMethod('CB')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                              paymentMethod === 'CB'
                                ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                                : 'border-gray-300 hover:border-[#d4b5a0]/50'
                            }`}
                          >
                            <CreditCard className={`w-6 h-6 mb-1 ${paymentMethod === 'CB' ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium">CB</span>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('Espèces')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                              paymentMethod === 'Espèces'
                                ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                                : 'border-gray-300 hover:border-[#d4b5a0]/50'
                            }`}
                          >
                            <Banknote className={`w-6 h-6 mb-1 ${paymentMethod === 'Espèces' ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium">Espèces</span>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('Virement')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                              paymentMethod === 'Virement'
                                ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                                : 'border-gray-300 hover:border-[#d4b5a0]/50'
                            }`}
                          >
                            <Building2 className={`w-6 h-6 mb-1 ${paymentMethod === 'Virement' ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium">Virement</span>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('Chèque')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                              paymentMethod === 'Chèque'
                                ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                                : 'border-gray-300 hover:border-[#d4b5a0]/50'
                            }`}
                          >
                            <Euro className={`w-6 h-6 mb-1 ${paymentMethod === 'Chèque' ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium">Chèque</span>
                          </button>
                        </div>
                      </div>

                      {/* Gift Card - Collapsible */}
                      {!showGiftCardInput ? (
                        <button
                          onClick={() => setShowGiftCardInput(true)}
                          className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                          <Gift className="w-3 h-3" />
                          Utiliser une carte cadeau
                        </button>
                      ) : (
                        <div className="border-2 border-pink-200 rounded-lg p-3 bg-pink-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-pink-900 flex items-center gap-1">
                              <Gift className="w-4 h-4" />
                              Carte cadeau
                            </label>
                            <button
                              onClick={() => {
                                setShowGiftCardInput(false);
                                setGiftCardData(null);
                                setGiftCardCode('');
                                setGiftCardAmount(0);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {!giftCardData ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={giftCardCode}
                                  onChange={(e) => {
                                    setGiftCardCode(e.target.value.toUpperCase());
                                    setGiftCardError('');
                                  }}
                                  placeholder="GIFT-XXXX-XXXX"
                                  className="flex-1 px-2 py-1 text-xs border border-pink-300 rounded focus:ring-1 focus:ring-pink-500 uppercase"
                                  maxLength={14}
                                />
                                <button
                                  onClick={verifyGiftCard}
                                  disabled={isVerifyingGiftCard || !giftCardCode.trim()}
                                  className="px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 disabled:opacity-50"
                                >
                                  {isVerifyingGiftCard ? 'Vérif...' : 'OK'}
                                </button>
                              </div>
                              {giftCardError && (
                                <p className="text-xs text-red-600">{giftCardError}</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="bg-white rounded p-2 border border-pink-300">
                                <p className="text-xs font-mono font-bold text-pink-700">{giftCardData.code}</p>
                                <p className="text-xs text-gray-600">Solde: {giftCardData.balance}€</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={Math.min(giftCardData.balance, calculateFinalAmount())}
                                  value={giftCardAmount}
                                  onChange={(e) => setGiftCardAmount(Math.min(parseFloat(e.target.value) || 0, Math.min(giftCardData.balance, calculateFinalAmount())))}
                                  className="flex-1 px-2 py-1 text-xs border border-pink-300 rounded"
                                />
                                <span className="text-xs">€</span>
                                <button
                                  onClick={() => setGiftCardAmount(Math.min(giftCardData.balance, calculateFinalAmount()))}
                                  className="px-2 py-1 bg-pink-200 text-pink-900 text-xs rounded hover:bg-pink-300"
                                >
                                  Max
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes - Compact */}
                      <div>
                        <label className="block text-xs font-medium text-[#2c3e50] mb-1">
                          Notes (optionnel)
                        </label>
                        <textarea
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Ex: Acompte, reste à payer..."
                          className="w-full px-2 py-1.5 text-xs border border-[#d4b5a0]/30 rounded focus:ring-1 focus:ring-[#d4b5a0] resize-none"
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

        {/* Footer Actions */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={() => {
              if (hasModifications) {
                if (confirm('Modifications non enregistrées. Fermer ?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={clientPresent === null || paymentStatus === null}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white text-sm font-semibold rounded-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
