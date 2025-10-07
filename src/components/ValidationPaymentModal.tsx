"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, CreditCard, Euro, Calendar, Gift } from "lucide-react";

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
  // Pré-cocher automatiquement les réductions de fidélité disponibles
  const [applyLoyaltyDiscount, setApplyLoyaltyDiscount] = useState(false);
  const [applyPackageDiscount, setApplyPackageDiscount] = useState(false);
  const [applyReferralSponsorDiscount, setApplyReferralSponsorDiscount] = useState(false); // Parrain
  const [applyReferralReferredDiscount, setApplyReferralReferredDiscount] = useState(false); // Filleul
  const [applyBirthdayDiscount, setApplyBirthdayDiscount] = useState(false); // Anniversaire
  const [manualDiscount, setManualDiscount] = useState(0);
  const [showManualDiscountInput, setShowManualDiscountInput] = useState(false);
  const [isBirthdayMonth, setIsBirthdayMonth] = useState(false);
  const [referralStatus, setReferralStatus] = useState<{
    isReferred: boolean;
    isSponsor: boolean;
    referredBy?: string;
    hasUsedReferralDiscount?: boolean;
    pendingReferrals?: number;
  }>({ isReferred: false, isSponsor: false });
  const [referralAlertShown, setReferralAlertShown] = useState(false);
  
  // Calculer les réductions disponibles
  const individualServicesCount = loyaltyProfile?.individualServicesCount || 0;
  const packagesCount = loyaltyProfile?.packagesCount || 0;
  
  // 5 soins = -20€ (le client doit avoir 5 soins pour avoir la réduction)
  const isLoyaltyEligible = individualServicesCount >= 5;
  const loyaltyDiscount = isLoyaltyEligible ? 20 : 0;
  
  // Réduction forfaits : disponible dès qu'on a 2 forfaits complétés (8 séances)
  // La réduction s'applique à la 9ème séance (début du 3ème forfait)
  const isPackageEligible = packagesCount >= 2;
  const packageDiscount = isPackageEligible ? 40 : 0;
  
  const referralSponsorDiscount = 15; // Réduction pour le parrain
  const referralReferredDiscount = 10; // Réduction pour le filleul
  const birthdayDiscount = 10; // Réduction anniversaire
  
  // Pré-cocher automatiquement les réductions de fidélité disponibles au montage
  useEffect(() => {
    if (isOpen) {
      // Appliquer automatiquement les réductions de fidélité disponibles
      if (isLoyaltyEligible && !applyLoyaltyDiscount) {
        setApplyLoyaltyDiscount(true);
      }
      if (isPackageEligible && !applyPackageDiscount) {
        setApplyPackageDiscount(true);
      }
      
      // Vérifier le statut de parrainage du client
      checkReferralStatus();
      
      // Vérifier si c'est le mois d'anniversaire du client
      checkBirthdayStatus();
    }
  }, [isOpen, isLoyaltyEligible, isPackageEligible]);

  // Fonction pour vérifier le statut de parrainage
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
        
        // Si le client a un statut de parrainage, pré-cocher automatiquement
        if (data.isReferred && !data.hasUsedReferralDiscount) {
          setApplyReferralReferredDiscount(true);
          if (!referralAlertShown) {
            setReferralAlertShown(true);
          }
        }
        if (data.isSponsor && data.pendingReferrals > 0) {
          setApplyReferralSponsorDiscount(true);
          if (!referralAlertShown) {
            setReferralAlertShown(true);
          }
        }
      }
    } catch (error) {
      console.error('Erreur vérification statut parrainage:', error);
    }
  };
  
  // Fonction pour vérifier si c'est le mois d'anniversaire
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
          
          // Vérifier si on est dans le mois d'anniversaire
          if (birthday.getMonth() === today.getMonth()) {
            setIsBirthdayMonth(true);
            
            // Vérifier si une réduction anniversaire existe déjà
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
  
  // Recalculer le montant à payer quand les réductions changent
  useEffect(() => {
    setPaymentAmount(calculateFinalAmount());
  }, [applyLoyaltyDiscount, applyPackageDiscount, applyReferralSponsorDiscount, applyReferralReferredDiscount, applyBirthdayDiscount, manualDiscount]);
  
  // Calculer le montant final avec réductions
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
        discounts.push(`Fidélité 5 soins: -${loyaltyDiscount}€`);
        data.loyaltyDiscountApplied = true;
        data.resetIndividualServicesCount = true; // Signaler qu'il faut réinitialiser le compteur
      }
      if (applyPackageDiscount && isPackageEligible) {
        discounts.push(`Fidélité 3 forfaits: -${packageDiscount}€`);
        data.packageDiscountApplied = true;
        data.resetPackagesCount = true; // Signaler qu'il faut réinitialiser le compteur
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
        // La création de la réduction anniversaire sera gérée côté serveur
      }
      if (manualDiscount > 0) {
        discounts.push(`Réduction manuelle: -${manualDiscount}€`);
        data.manualDiscount = manualDiscount;
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
        {/* Alerte si des réductions sont disponibles */}
        {(isLoyaltyEligible || isPackageEligible) && (
          <div className="m-4 mb-0 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-800">
                🎉 Réduction de fidélité disponible !
              </p>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {isLoyaltyEligible && `• ${individualServicesCount} soins individuels réalisés → Réduction de 20€ disponible`}
              {isLoyaltyEligible && isPackageEligible && <br />}
              {isPackageEligible && `• ${packagesCount} forfaits complétés (${packagesCount * 4} séances) → Réduction de 40€ disponible`}
            </p>
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✅ Les réductions sont automatiquement appliquées au montant !
            </p>
          </div>
        )}
        
        {/* Alerte de parrainage si détecté */}
        {(referralStatus.isReferred || referralStatus.isSponsor) && (
          <div className="m-4 mb-0 mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <p className="font-semibold text-purple-800">
                👥 Parrainage détecté !
              </p>
            </div>
            <div className="text-sm text-purple-700 mt-1">
              {referralStatus.isReferred && !referralStatus.hasUsedReferralDiscount && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎁</span>
                  <span>
                    <strong>Client parrainé</strong> par {referralStatus.referredBy || 'un parrain'}
                    <br />
                    <span className="text-purple-600 font-bold">→ Réduction de 10€ disponible (premier soin)</span>
                  </span>
                </div>
              )}
              {referralStatus.isSponsor && referralStatus.pendingReferrals && referralStatus.pendingReferrals > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span>
                    <strong>Client parrain</strong> - {referralStatus.pendingReferrals} filleul(s) actif(s)
                    <br />
                    <span className="text-purple-600 font-bold">→ Réduction de 15€ disponible</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-purple-600 mt-2 font-medium bg-purple-100 rounded px-2 py-1">
              ⚠️ Vérifiez ci-dessous que la bonne réduction parrainage est cochée
            </p>
          </div>
        )}
        
        {/* Alerte anniversaire si c'est le mois */}
        {isBirthdayMonth && (
          <div className="m-4 mb-0 mt-2 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-600" />
              <p className="font-semibold text-pink-800">
                🎂 C'est le mois d'anniversaire du client !
              </p>
            </div>
            <div className="text-sm text-pink-700 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <span>
                  <strong>Réduction anniversaire</strong> - Offerte par LAIA SKIN
                  <br />
                  <span className="text-pink-600 font-bold">→ 10€ de réduction sur ce soin</span>
                </span>
              </div>
            </div>
            {applyBirthdayDiscount ? (
              <p className="text-xs text-green-600 mt-2 font-medium bg-green-100 rounded px-2 py-1">
                ✅ Réduction anniversaire déjà créée et appliquée automatiquement
              </p>
            ) : (
              <p className="text-xs text-pink-600 mt-2 font-medium bg-pink-100 rounded px-2 py-1">
                💡 Cochez "Anniversaire" ci-dessous pour créer et appliquer la réduction
              </p>
            )}
          </div>
        )}
        
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
            <div className="flex items-center gap-2">
              {(isLoyaltyEligible || isPackageEligible) && (
                <span className="text-gray-400 line-through text-sm">{reservation.totalPrice}€</span>
              )}
              <span className="text-[#d4b5a0] font-bold">
                {(isLoyaltyEligible || isPackageEligible) 
                  ? `${calculateFinalAmount()}€` 
                  : `${reservation.totalPrice}€`}
              </span>
              {(isLoyaltyEligible || isPackageEligible) && (
                <span className="text-xs text-green-600 font-medium">
                  (-{(applyLoyaltyDiscount ? loyaltyDiscount : 0) + (applyPackageDiscount ? packageDiscount : 0)}€)
                </span>
              )}
            </div>
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
              {/* Indicateur du type de prestation */}
              <div className="mt-2 flex flex-col gap-1">
                {(() => {
                  // Déterminer si c'est un forfait ou un soin individuel
                  const services = typeof reservation.services === 'string' 
                    ? [reservation.services] 
                    : Array.isArray(reservation.services) 
                      ? reservation.services 
                      : [];
                  
                  // Vérifier si c'est un forfait : soit packages est rempli, soit le nom contient "Forfait"
                  const hasPackages = reservation.packages && Object.keys(reservation.packages || {}).length > 0;
                  const hasForfaitInName = services.some((s: string) => 
                    typeof s === 'string' && s.toLowerCase().includes('forfait')
                  );
                  const isPackage = hasPackages || hasForfaitInName;
                  
                  if (isPackage) {
                    // packagesCount = nombre de forfaits COMPLÉTÉS (chaque forfait = 4 séances)
                    // On incrémente le compteur quand on TERMINE un forfait
                    // La réduction est disponible quand on COMMENCE le 3ème forfait (après 2 forfaits complets)
                    
                    return (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                          📦 Forfait détecté (4 séances par forfait) - Programme fidélité forfaits
                        </span>
                        
                        <div className="ml-2 space-y-1">
                          <div className="text-xs text-purple-600">
                            {(() => {
                              // Calculer la position exacte dans le système de forfaits
                              const forfaitsCompletes = packagesCount;
                              const positionDansCycle = forfaitsCompletes % 3;
                              
                              // Messages personnalisés selon la situation exacte
                              if (forfaitsCompletes === 0) {
                                return (
                                  <>
                                    <div className="font-semibold">📍 État actuel: Aucun forfait complété</div>
                                    <div>→ Cette séance fait partie du 1er forfait (en cours)</div>
                                    <div className="text-xs text-gray-600">
                                      Note: Le forfait sera marqué comme complété après 4 séances
                                    </div>
                                    <div className="text-orange-600 font-semibold mt-1">
                                      ⏳ Encore 2 forfaits complets + début du 3ème avant la réduction
                                    </div>
                                    <div className="text-xs text-purple-600">
                                      (Il faut terminer le 1er et le 2ème forfait, puis commencer le 3ème)
                                    </div>
                                  </>
                                );
                              }
                              
                              if (forfaitsCompletes === 1) {
                                return (
                                  <>
                                    <div className="font-semibold">📍 1 forfait complété</div>
                                    <div>→ 2ème forfait en cours</div>
                                    <div className="text-orange-600 font-semibold">
                                      ⏳ -40€ dès le 3ème forfait
                                    </div>
                                  </>
                                );
                              }
                              
                              if (forfaitsCompletes === 2) {
                                return (
                                  <>
                                    <div className="font-semibold text-green-600">✨ État actuel: 2 forfaits déjà complétés</div>
                                    <div className="text-green-600 font-bold animate-pulse">
                                      🎉 Cette séance est la 1ère séance du 3ème forfait !
                                    </div>
                                    <div className="bg-green-100 rounded p-1 mt-1">
                                      <div className="text-green-800 font-bold">
                                        💰 RÉDUCTION DE 40€ APPLICABLE DÈS MAINTENANT !
                                      </div>
                                      <div className="text-xs text-green-700">
                                        La réduction s'applique au début du 3ème forfait
                                      </div>
                                    </div>
                                    <div className="text-xs text-purple-600 mt-1">
                                      → Cette séance compte comme la 1ère/4 du 3ème forfait
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      → Le forfait sera complété après 3 séances supplémentaires
                                    </div>
                                  </>
                                );
                              }
                              
                              if (forfaitsCompletes >= 3) {
                                const nouveauCycle = positionDansCycle;
                                if (nouveauCycle === 0) {
                                  return (
                                    <>
                                      <div className="font-semibold">📍 Nouveau cycle - Aucun forfait dans ce cycle</div>
                                      <div>→ Cette validation compte pour le 1er forfait du nouveau cycle</div>
                                      <div className="text-orange-600 font-semibold mt-1">
                                        ⏳ Encore 2 forfaits complets avant la prochaine réduction de 40€
                                      </div>
                                    </>
                                  );
                                } else if (nouveauCycle === 1) {
                                  return (
                                    <>
                                      <div className="font-semibold">📍 Nouveau cycle - 1 forfait complété</div>
                                      <div>→ Cette validation compte pour le 2ème forfait</div>
                                      <div className="text-orange-600 font-semibold mt-1">
                                        ⏳ Encore 1 forfait complet avant la prochaine réduction de 40€
                                      </div>
                                    </>
                                  );
                                } else {
                                  return (
                                    <>
                                      <div className="font-semibold text-green-600">✨ 2 forfaits dans ce cycle</div>
                                      <div className="text-green-600 font-bold animate-pulse">
                                        🎉 Cette séance fait partie du 3ème forfait !
                                      </div>
                                      <div className="bg-green-100 rounded p-1 mt-1">
                                        <div className="text-green-800 font-bold">
                                          💰 RÉDUCTION DE 40€ APPLICABLE !
                                        </div>
                                      </div>
                                    </>
                                  );
                                }
                              }
                              
                              return null;
                            })()}
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                          ✨ Soin individuel - Programme fidélité soins
                        </span>
                        <span className="text-xs text-blue-600 ml-2">
                          Compteur actuel: {individualServicesCount}/5 soins
                        </span>
                        <span className="text-xs text-blue-600 ml-2">
                          → Après validation: {individualServicesCount + 1}/5 soins
                        </span>
                        {individualServicesCount >= 4 && (
                          <span className="text-xs font-semibold text-green-600 ml-2 animate-pulse">
                            🎉 Prochain soin = -20€ de réduction !
                          </span>
                        )}
                      </>
                    );
                  }
                })()}
              </div>
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
                      <h4 className="text-sm font-semibold text-[#2c3e50] mb-3">Réductions de fidélité</h4>
                      
                      {/* Message d'alerte si des réductions sont disponibles */}
                      {(isLoyaltyEligible || isPackageEligible) && (
                        <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded-lg animate-pulse">
                          <p className="text-sm font-medium text-green-800">
                            ⚠️ ATTENTION : Réduction(s) disponible(s) !
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            {isLoyaltyEligible && `• Réduction de 20€ pour 5 soins réalisés`}
                            {isLoyaltyEligible && isPackageEligible && <br />}
                            {isPackageEligible && `• Réduction de 40€ pour 3 forfaits achetés`}
                          </p>
                        </div>
                      )}
                      
                      {/* Réduction soins individuels */}
                      <label className={`flex items-center justify-between mb-2 p-2 rounded-lg transition-all ${
                        isLoyaltyEligible 
                          ? 'cursor-pointer hover:bg-white/50 bg-green-50 border border-green-200' 
                          : 'cursor-not-allowed opacity-50 bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={applyLoyaltyDiscount}
                            onChange={(e) => {
                              if (isLoyaltyEligible) {
                                setApplyLoyaltyDiscount(e.target.checked);
                              }
                            }}
                            disabled={!isLoyaltyEligible}
                            className={`w-5 h-5 rounded ${
                              isLoyaltyEligible 
                                ? 'text-[#d4b5a0] border-[#d4b5a0]/30 focus:ring-[#d4b5a0]' 
                                : 'text-gray-400 border-gray-300'
                            }`}
                          />
                          <div>
                            <p className={`text-sm font-medium ${isLoyaltyEligible ? 'text-[#2c3e50]' : 'text-gray-500'}`}>
                              ✨ Programme Fidélité SOINS INDIVIDUELS
                            </p>
                            <p className="text-xs text-[#2c3e50]/60">
                              {isLoyaltyEligible 
                                ? `✅ ${individualServicesCount}/5 soins réalisés - Réduction disponible ! (Le compteur sera remis à zéro)`
                                : `⏳ ${individualServicesCount}/5 soins réalisés - Encore ${5 - individualServicesCount} soin(s) avant réduction`}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${isLoyaltyEligible ? 'text-green-600' : 'text-gray-400'}`}>
                          {isLoyaltyEligible ? '-20€' : '🔒'}
                        </span>
                      </label>
                      
                      {/* Réduction forfaits */}
                      <label className={`flex items-center justify-between mb-2 p-2 rounded-lg transition-all ${
                        isPackageEligible 
                          ? 'cursor-pointer hover:bg-white/50 bg-green-50 border border-green-200' 
                          : 'cursor-not-allowed opacity-50 bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={applyPackageDiscount}
                            onChange={(e) => {
                              if (isPackageEligible) {
                                setApplyPackageDiscount(e.target.checked);
                              }
                            }}
                            disabled={!isPackageEligible}
                            className={`w-5 h-5 rounded ${
                              isPackageEligible 
                                ? 'text-[#d4b5a0] border-[#d4b5a0]/30 focus:ring-[#d4b5a0]' 
                                : 'text-gray-400 border-gray-300'
                            }`}
                          />
                          <div>
                            <p className={`text-sm font-medium ${isPackageEligible ? 'text-[#2c3e50]' : 'text-gray-500'}`}>
                              📦 Programme Fidélité FORFAITS
                            </p>
                            <p className="text-xs text-[#2c3e50]/60">
                              {isPackageEligible 
                                ? `✅ ${packagesCount} forfaits complétés (${packagesCount * 4} séances) - Réduction de 40€ disponible !`
                                : `⏳ ${packagesCount} forfait${packagesCount > 1 ? 's' : ''} complété${packagesCount > 1 ? 's' : ''} (${packagesCount * 4}/8 séances) - Encore ${(2 - packagesCount) * 4} séances avant réduction`}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${isPackageEligible ? 'text-green-600' : 'text-gray-400'}`}>
                          {isPackageEligible ? '-40€' : '🔒'}
                        </span>
                      </label>
                      
                      {/* Réduction parrainage - Parrain */}
                      <label className="flex items-center justify-between mb-2 cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-all">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={applyReferralSponsorDiscount}
                            onChange={(e) => {
                              setApplyReferralSponsorDiscount(e.target.checked);
                              // Désactiver l'autre option parrainage si celle-ci est cochée
                              if (e.target.checked) {
                                setApplyReferralReferredDiscount(false);
                              }
                            }}
                            className="w-5 h-5 text-[#d4b5a0] border-[#d4b5a0]/30 rounded focus:ring-[#d4b5a0]"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#2c3e50]">
                              👥 Parrainage - Parrain
                            </p>
                            <p className="text-xs text-[#2c3e50]/60">
                              Ce client a parrainé quelqu'un
                            </p>
                          </div>
                        </div>
                        <span className="text-green-600 font-bold">-{referralSponsorDiscount}€</span>
                      </label>
                      
                      {/* Réduction parrainage - Filleul */}
                      <label className="flex items-center justify-between mb-2 cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-all">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={applyReferralReferredDiscount}
                            onChange={(e) => {
                              setApplyReferralReferredDiscount(e.target.checked);
                              // Désactiver l'autre option parrainage si celle-ci est cochée
                              if (e.target.checked) {
                                setApplyReferralSponsorDiscount(false);
                              }
                            }}
                            className="w-5 h-5 text-[#d4b5a0] border-[#d4b5a0]/30 rounded focus:ring-[#d4b5a0]"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#2c3e50]">
                              👥 Parrainage - Filleul
                            </p>
                            <p className="text-xs text-[#2c3e50]/60">
                              Ce client a été parrainé
                            </p>
                          </div>
                        </div>
                        <span className="text-green-600 font-bold">-{referralReferredDiscount}€</span>
                      </label>
                      
                      {/* Anniversaire - Case à cocher */}
                      {isBirthdayMonth && (
                        <label className="flex justify-between items-center p-3 rounded-lg bg-pink-50 border border-pink-200 hover:bg-pink-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={applyBirthdayDiscount}
                              onChange={(e) => setApplyBirthdayDiscount(e.target.checked)}
                              className="w-5 h-5 text-pink-500 border-pink-300 rounded focus:ring-pink-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-[#2c3e50]">
                                🎂 Anniversaire
                              </p>
                              <p className="text-xs text-[#2c3e50]/60">
                                Réduction offerte pour l'anniversaire
                              </p>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold">-{birthdayDiscount}€</span>
                        </label>
                      )}
                      
                      {/* Réduction manuelle */}
                      <div className="border-t border-[#d4b5a0]/20 pt-2 mt-2">
                        {!showManualDiscountInput ? (
                          <button
                            onClick={() => setShowManualDiscountInput(true)}
                            className="text-sm text-[#d4b5a0] hover:text-[#b89574] transition-colors"
                          >
                            + Ajouter une réduction manuelle
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={manualDiscount}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setManualDiscount(value);
                              }}
                              placeholder="Montant en €"
                              className="flex-1 px-3 py-1 text-sm border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                            />
                            <span className="text-sm text-[#2c3e50]">€</span>
                            <button
                              onClick={() => {
                                setManualDiscount(0);
                                setShowManualDiscountInput(false);
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
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
                        {(applyLoyaltyDiscount || applyPackageDiscount || applyReferralSponsorDiscount || applyReferralReferredDiscount) && (
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