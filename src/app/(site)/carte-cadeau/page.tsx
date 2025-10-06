"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Gift, CreditCard, User, Mail, Phone, Check,
  ChevronRight, Sparkles, Heart, Star, Search, Calendar
} from "lucide-react";

export default function CarteCadeau() {
  const [mode, setMode] = useState<'buy' | 'use'>('buy'); // buy = acheter, use = utiliser
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardData, setGiftCardData] = useState<any>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    recipientName: "",
    recipientEmail: "",
    message: "",
    senderName: "",
    senderEmail: "",
    senderPhone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedAmounts = [50, 75, 100, 150, 200, 300];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    setCustomAmount(numValue);
    if (numValue) {
      setSelectedAmount(parseInt(numValue));
    } else {
      setSelectedAmount(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setRecipientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTotalAmount = () => {
    return selectedAmount || 0;
  };

  const checkGiftCardCode = async () => {
    if (!giftCardCode.trim()) {
      setCodeError("Veuillez entrer un code");
      return;
    }

    setIsCheckingCode(true);
    setCodeError("");
    setGiftCardData(null);

    try {
      const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(giftCardCode.toUpperCase())}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setGiftCardData(data);
      } else {
        setCodeError(data.error || "Code invalide");
      }
    } catch (error) {
      setCodeError("Erreur lors de la vérification du code");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleUseGiftCard = () => {
    // Redirection vers /reservation avec le code pré-rempli
    window.location.href = `/reservation?giftCard=${giftCardCode.toUpperCase()}`;
  };

  const canProceedToNextStep = () => {
    if (step === 1) {
      return selectedAmount && selectedAmount >= 20;
    }
    if (step === 2) {
      return recipientInfo.recipientName &&
             recipientInfo.recipientEmail &&
             recipientInfo.senderName &&
             recipientInfo.senderEmail &&
             recipientInfo.senderPhone;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!canProceedToNextStep()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Soumission finale
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getTotalAmount(),
          ...recipientInfo,
          paymentMethod
        })
      });

      if (response.ok) {
        // Redirection vers une page de confirmation ou traitement du paiement
        window.location.href = '/confirmation-carte-cadeau';
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat de la carte cadeau:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-white to-secondary">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-primary mb-4">
              Cartes Cadeaux
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Offrez ou utilisez une carte cadeau pour profiter de nos soins.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setMode('buy')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                mode === 'buy'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:shadow-md'
              }`}
            >
              <Gift className="inline mr-2" size={20} />
              Acheter une carte
            </button>
            <button
              onClick={() => setMode('use')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                mode === 'use'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:shadow-md'
              }`}
            >
              <Search className="inline mr-2" size={20} />
              Utiliser ma carte
            </button>
          </div>

          {/* Use Gift Card Mode */}
          {mode === 'use' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Search className="mr-3 text-primary" />
                Vérifier mon solde
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Entrez votre code carte cadeau
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => {
                      setGiftCardCode(e.target.value.toUpperCase());
                      setCodeError("");
                      setGiftCardData(null);
                    }}
                    placeholder="GIFT-XXXX-XXXX"
                    className="flex-1 p-4 border border-gray-300 rounded-lg focus:border-primary focus:outline-none uppercase"
                    maxLength={14}
                  />
                  <button
                    onClick={checkGiftCardCode}
                    disabled={isCheckingCode}
                    className="px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300"
                  >
                    {isCheckingCode ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>
                {codeError && (
                  <p className="text-red-500 text-sm mt-2">{codeError}</p>
                )}
              </div>

              {giftCardData && (
                <div className="bg-gradient-to-br from-primary/10 to-secondary/20 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">
                        {giftCardData.code}
                      </h3>
                      <p className="text-sm text-muted">
                        Valide jusqu'au {new Date(giftCardData.expiryDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Solde disponible</p>
                      <p className="text-3xl font-bold text-primary">
                        {giftCardData.balance}€
                      </p>
                    </div>
                  </div>

                  {giftCardData.balance !== giftCardData.initialAmount && (
                    <div className="mb-4 p-3 bg-white/50 rounded-lg">
                      <p className="text-sm text-muted">
                        Montant initial: <strong>{giftCardData.initialAmount}€</strong>
                      </p>
                      <p className="text-sm text-muted">
                        Montant utilisé: <strong>{giftCardData.initialAmount - giftCardData.balance}€</strong>
                      </p>
                    </div>
                  )}

                  {giftCardData.reservations && giftCardData.reservations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-sm">Historique d'utilisation:</h4>
                      <div className="space-y-2">
                        {giftCardData.reservations.map((res: any) => (
                          <div key={res.id} className="bg-white/50 rounded-lg p-3 text-sm">
                            <div className="flex justify-between">
                              <span>{new Date(res.date).toLocaleDateString('fr-FR')} - {res.time}</span>
                              <span className="font-semibold text-primary">-{res.giftCardUsedAmount}€</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {giftCardData.balance > 0 && (
                    <button
                      onClick={handleUseGiftCard}
                      className="w-full py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center"
                    >
                      <Calendar className="mr-2" size={20} />
                      Réserver un soin avec cette carte
                    </button>
                  )}

                  {giftCardData.balance === 0 && (
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <p className="text-muted">Cette carte a été entièrement utilisée</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buy Mode - Progress Indicator */}
          {mode === 'buy' && (
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <Check size={20} /> : '1'}
              </div>
              <div className={`w-24 h-1 ${step > 1 ? 'bg-primary' : 'bg-gray-200'}`} />

              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 2 ? <Check size={20} /> : '2'}
              </div>
              <div className={`w-24 h-1 ${step > 2 ? 'bg-primary' : 'bg-gray-200'}`} />

              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>
          )}

          {/* Buy Mode - Step Content */}
          {mode === 'buy' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Gift className="mr-3 text-primary" />
                  Choisissez le montant
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedAmount === amount
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <p className="text-2xl font-bold text-primary">{amount}€</p>
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Ou entrez un montant personnalisé (minimum 20€)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="Montant personnalisé"
                      className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold">
                      €
                    </span>
                  </div>
                </div>

                {selectedAmount && selectedAmount < 20 && (
                  <p className="text-red-500 text-sm mb-4">
                    Le montant minimum est de 20€
                  </p>
                )}

                {/* Suggestions */}
                <div className="bg-secondary/20 rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Sparkles className="mr-2 text-primary" size={18} />
                    Suggestions de soins
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Éclat Suprême</span>
                      <span className="font-medium">65€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LAIA Hydro'Cleaning</span>
                      <span className="font-medium">70€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LAIA Renaissance</span>
                      <span className="font-medium">120€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BB Glow</span>
                      <span className="font-medium">150€</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <User className="mr-3 text-primary" />
                  Informations
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Pour qui est cette carte cadeau ?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nom du bénéficiaire *
                        </label>
                        <input
                          type="text"
                          value={recipientInfo.recipientName}
                          onChange={(e) => handleInputChange('recipientName', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          placeholder="Prénom Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email du bénéficiaire *
                        </label>
                        <input
                          type="email"
                          value={recipientInfo.recipientEmail}
                          onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message personnalisé (optionnel)
                    </label>
                    <textarea
                      value={recipientInfo.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      rows={4}
                      placeholder="Votre message personnel..."
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Vos informations</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Votre nom *
                        </label>
                        <input
                          type="text"
                          value={recipientInfo.senderName}
                          onChange={(e) => handleInputChange('senderName', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          placeholder="Prénom Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Votre email *
                        </label>
                        <input
                          type="email"
                          value={recipientInfo.senderEmail}
                          onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">
                        Votre téléphone *
                      </label>
                      <input
                        type="tel"
                        value={recipientInfo.senderPhone}
                        onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <CreditCard className="mr-3 text-primary" />
                  Récapitulatif et paiement
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-medium mb-4">Récapitulatif de votre commande</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Carte cadeau</span>
                      <span className="font-semibold">{getTotalAmount()}€</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">{getTotalAmount()}€</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm">
                    <p><strong>Bénéficiaire:</strong> {recipientInfo.recipientName}</p>
                    <p><strong>Email:</strong> {recipientInfo.recipientEmail}</p>
                    {recipientInfo.message && (
                      <p><strong>Message:</strong> {recipientInfo.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Mode de paiement</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="mr-3 text-primary" size={20} />
                      <span>Carte bancaire</span>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Star className="mr-2 text-primary" size={18} />
                    Conditions d'utilisation
                  </h4>
                  <ul className="text-sm space-y-1 text-muted">
                    <li>• Carte valable 1 an à compter de la date d'achat</li>
                    <li>• Utilisable en une ou plusieurs fois</li>
                    <li>• Non remboursable et non échangeable contre espèces</li>
                    <li>• Valable sur tous nos soins et produits</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canProceedToNextStep() || isSubmitting}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center ml-auto ${
                  canProceedToNextStep() && !isSubmitting
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {step < 3 ? (
                  <>
                    Continuer
                    <ChevronRight className="ml-2" size={20} />
                  </>
                ) : isSubmitting ? (
                  'Traitement...'
                ) : (
                  <>
                    <CreditCard className="mr-2" size={20} />
                    Payer {getTotalAmount()}€
                  </>
                )}
              </button>
            </div>
          </div>
          )}

          {/* Features */}
          {mode === 'buy' && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Envoi immédiat</h3>
              <p className="text-sm text-muted">
                La carte cadeau est envoyée par email dès validation du paiement
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Personnalisable</h3>
              <p className="text-sm text-muted">
                Ajoutez un message personnel pour rendre votre cadeau unique
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Flexibilité totale</h3>
              <p className="text-sm text-muted">
                Utilisable sur tous nos soins, en une ou plusieurs fois
              </p>
            </div>
          </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}