'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Users, Copy, Check, Star } from 'lucide-react';
import Confetti from 'react-confetti';

interface ReferralSystemProps {
  clientId: string;
  clientName: string;
  onClose?: () => void;
}

export function ReferralSystem({ clientId, clientName, onClose }: ReferralSystemProps) {
  const [referralCode, setReferralCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [referralStats, setReferralStats] = useState({ referred: 0, rewards: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Générer le code de parrainage unique
    const code = `LAIA${clientName.slice(0, 3).toUpperCase()}${clientId.slice(-4).toUpperCase()}`;
    setReferralCode(code);
    
    // Charger les stats de parrainage
    loadReferralStats();
  }, [clientId, clientName]);

  const loadReferralStats = async () => {
    try {
      const response = await fetch(`/api/referral/stats?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data);
      }
    } catch (error) {
      console.error('Erreur chargement stats parrainage:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un code de parrainage' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          clientId: clientId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowConfetti(true);
        setMessage({ 
          type: 'success', 
          text: `🎉 Code validé ! Vous et votre parrain bénéficiez chacun de 15€ de réduction !` 
        });
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Code invalide' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la validation du code' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-[#d4b5a0] to-[#c4a590] p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Gift className="w-7 h-7" />
                Programme de Parrainage
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats de parrainage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Amis parrainés</p>
                    <p className="text-2xl font-bold text-purple-600">{referralStats.referred}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-600">Récompenses gagnées</p>
                    <p className="text-2xl font-bold text-emerald-600">{referralStats.rewards}€</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mon code de parrainage */}
            <div className="bg-gradient-to-r from-[#f9f5f2] to-[#fef8f3] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-[#8b6f5c]">
                📤 Partager mon code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Partagez ce code avec vos amis. Ils bénéficieront de 15€ de réduction sur leur premier soin,
                et vous recevrez 15€ de réduction après leur première visite !
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-lg px-4 py-3 font-mono text-lg font-bold text-[#d4b5a0] border-2 border-[#d4b5a0]">
                  {referralCode}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              
              {/* Boutons de partage */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    const text = `Découvrez LAIA SKIN Institut ! Utilisez mon code ${referralCode} pour bénéficier de 15€ de réduction sur votre premier soin. 🌟`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Partager sur WhatsApp
                </button>
                <button
                  onClick={() => {
                    const text = `Je recommande @laiaskin_institut ! Code promo: ${referralCode} pour -15€ sur votre premier soin ✨`;
                    window.open(`https://www.instagram.com/`, '_blank');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
                >
                  Partager sur Instagram
                </button>
              </div>
            </div>

            {/* Utiliser un code de parrainage */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">
                📥 J'ai un code de parrainage
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Entrez le code de parrainage de votre ami pour bénéficier de 15€ de réduction
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Entrez le code ici"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSubmitCode}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Validation...' : 'Valider'}
                </button>
              </div>
            </div>

            {/* Message de feedback */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* Comment ça marche */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Comment ça marche ?</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <p className="font-medium">Partagez votre code</p>
                    <p className="text-sm text-gray-600">Donnez votre code personnel à vos amis</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <p className="font-medium">Ils profitent de -15€</p>
                    <p className="text-sm text-gray-600">Sur leur premier soin chez LAIA SKIN</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <p className="font-medium">Vous gagnez -15€</p>
                    <p className="text-sm text-gray-600">Après leur première visite</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}