'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, Mail, Phone, Users, Eye, CheckCircle, 
  AlertCircle, Sparkles, Zap, Settings,
  ChevronRight, Copy, Edit, X, Check, Rocket,
  Target, Brain, TrendingUp, Shield, Globe,
  MessageSquare, Activity, BarChart3, Layers
} from 'lucide-react';

interface TestConfig {
  channel: 'both' | 'email' | 'whatsapp';
  segment: string;
  testEmails: string[];
  testPhones: string[];
  variables: Record<string, string>;
}

export default function CampaignTesterModern() {
  const [isTestMode, setIsTestMode] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [animateCard, setAnimateCard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  
  const [config, setConfig] = useState<TestConfig>({
    channel: 'both',
    segment: 'vip',
    testEmails: ['admin@laiaskin.com'],
    testPhones: ['+33612345678'],
    variables: {
      nom: 'Sophie',
      reduction: '30',
      date_limite: '31 décembre',
      code_promo: 'LAIA30',
      nouveau_soin: 'Diamond Glow'
    }
  });

  const segments = [
    { 
      id: 'vip', 
      name: 'Clientes VIP', 
      count: 127, 
      icon: '👑',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      stats: { conversion: 85, revenue: '45K€' }
    },
    { 
      id: 'new', 
      name: 'Nouvelles clientes', 
      count: 89, 
      icon: '🌟',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      stats: { conversion: 62, revenue: '12K€' }
    },
    { 
      id: 'loyal', 
      name: 'Clientes fidèles', 
      count: 234, 
      icon: '💎',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      stats: { conversion: 78, revenue: '67K€' }
    },
    { 
      id: 'birthday', 
      name: 'Anniversaires', 
      count: 45, 
      icon: '🎂',
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      stats: { conversion: 92, revenue: '8K€' }
    },
    { 
      id: 'inactive', 
      name: 'À reconquérir', 
      count: 156, 
      icon: '🔄',
      gradient: 'from-gray-500 via-slate-500 to-zinc-500',
      stats: { conversion: 34, revenue: '23K€' }
    }
  ];

  const emailTemplate = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 30px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div style="padding: 50px 40px;">
          <h1 style="font-size: 42px; background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 30px; font-weight: 800;">
            LAIA SKIN
          </h1>
          <div style="font-size: 24px; color: #333; margin: 30px 0;">
            Bonjour {nom} ✨
          </div>
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); padding: 30px; border-radius: 20px; margin: 30px 0;">
            <p style="color: white; font-size: 48px; font-weight: bold; margin: 0;">-{reduction}%</p>
            <p style="color: white; font-size: 18px; margin: 10px 0;">Sur votre prochain soin</p>
          </div>
          <p style="font-size: 18px; color: #666; line-height: 1.8;">
            Découvrez notre nouveau soin <strong>{nouveau_soin}</strong><br>
            Une expérience unique qui sublime votre peau
          </p>
          <a href="#" style="display: inline-block; margin: 30px 0; padding: 18px 50px; background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 10px 30px rgba(212,181,160,0.4); transition: all 0.3s;">
            Réserver maintenant →
          </a>
          <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 15px;">
            <p style="color: #999; font-size: 14px; margin: 5px 0;">Code: {code_promo}</p>
            <p style="color: #999; font-size: 14px; margin: 5px 0;">Valable jusqu\'au {date_limite}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const whatsappTemplate = `✨ *LAIA SKIN* ✨
━━━━━━━━━━━━━━━

Bonjour {nom} 🌸

🎁 *OFFRE EXCLUSIVE*
▸ *-{reduction}%* sur tous nos soins
▸ Code: *{code_promo}*
▸ Valable jusqu\'au {date_limite}

✨ *NOUVEAU SOIN*
{nouveau_soin}
Une innovation révolutionnaire pour
sublimer votre peau 💎

📱 Réservez: laia-skin.fr
☎️ Appelez: 01 23 45 67 89
📍 2 rue de la Paix, Paris

━━━━━━━━━━━━━━━
*L\'excellence au service de votre beauté*`;

  const replaceVariables = (template: string): string => {
    let result = template;
    Object.entries(config.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  };

  const handleSendTest = async () => {
    setSending(true);
    setAnimateCard(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setSending(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setAnimateCard(false);
    }, 3000);
  };

  const handleSendReal = async () => {
    const segment = segments.find(s => s.id === config.segment);
    if (!confirm(`Lancer la campagne pour ${segment?.count} personnes ?`)) return;
    
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSending(false);
    alert('✅ Campagne lancée avec succès!');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateCard(prev => !prev);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-6">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white font-medium">Centre de Campagnes LAIA SKIN</span>
            <span className="px-2 py-1 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white text-xs font-bold rounded-full">
              PRO
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white mb-4">
            Testez et Envoyez
          </h1>
          <p className="text-purple-200 text-lg">
            Gérez vos campagnes marketing en toute simplicité
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-xl p-1 rounded-2xl border border-white/20">
            <button
              onClick={() => setIsTestMode(true)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isTestMode 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Mode Test
            </button>
            <button
              onClick={() => setIsTestMode(false)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                !isTestMode 
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/25' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Rocket className="w-4 h-4 inline mr-2" />
              Mode Live
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(step => (
              <React.Fragment key={step}>
                <button
                  onClick={() => setActiveStep(step)}
                  className={`w-12 h-12 rounded-full font-bold transition-all transform ${
                    activeStep >= step
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {step}
                </button>
                {step < 3 && (
                  <div className={`w-20 h-0.5 transition-all ${
                    activeStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 space-y-6">
              {/* Channel Selection */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Canaux de diffusion
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'both', icon: Zap, label: 'Les deux', gradient: 'from-purple-500 to-pink-500' },
                    { id: 'email', icon: Mail, label: 'Email seul', gradient: 'from-blue-500 to-cyan-500' },
                    { id: 'whatsapp', icon: Phone, label: 'WhatsApp seul', gradient: 'from-green-500 to-emerald-500' }
                  ].map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setConfig({...config, channel: channel.id as any})}
                      className={`relative p-4 rounded-2xl transition-all transform hover:scale-105 ${
                        config.channel === channel.id
                          ? 'bg-gradient-to-br ' + channel.gradient + ' text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <channel.icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">{channel.label}</p>
                      {config.channel === channel.id && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-purple-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segment Selection */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Segments intelligents
                </h3>
                <div className="space-y-3">
                  {segments.map(segment => (
                    <div
                      key={segment.id}
                      onClick={() => setConfig({...config, segment: segment.id})}
                      onMouseEnter={() => setHoveredSegment(segment.id)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className={`relative p-4 rounded-2xl cursor-pointer transition-all transform ${
                        config.segment === segment.id
                          ? 'bg-gradient-to-r ' + segment.gradient + ' text-white scale-[1.02] shadow-xl'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{segment.icon}</span>
                          <div>
                            <p className="font-semibold">{segment.name}</p>
                            <p className="text-sm opacity-80">{segment.count} personnes</p>
                          </div>
                        </div>
                        {hoveredSegment === segment.id && (
                          <div className="flex gap-4 text-xs">
                            <div>
                              <p className="opacity-70">Taux</p>
                              <p className="font-bold">{segment.stats.conversion}%</p>
                            </div>
                            <div>
                              <p className="opacity-70">CA</p>
                              <p className="font-bold">{segment.stats.revenue}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-300 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Conseil personnalisé</p>
                    <p className="text-purple-200 text-xs leading-relaxed">
                      Les {segments.find(s => s.id === config.segment)?.name?.toLowerCase()} répondent mieux 
                      aux campagnes envoyées le mardi matin. Taux d'ouverture moyen : 68%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Variables */}
              {isTestMode && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Personnalisation du message
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(config.variables).map(([key, value]) => (
                      <div key={key} className="group">
                        <label className="text-white/70 text-xs block mb-1 group-hover:text-white transition-colors">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setConfig({
                            ...config,
                            variables: {...config.variables, [key]: e.target.value}
                          })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:bg-white/20 focus:border-purple-400 focus:outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-7">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
              {/* Preview Controls */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview temps réel
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      previewMode === 'desktop'
                        ? 'bg-white/20 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      previewMode === 'mobile'
                        ? 'bg-white/20 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Email Preview */}
              {config.channel !== 'whatsapp' && (
                <div className={`mb-6 ${animateCard ? 'animate-pulse' : ''}`}>
                  <div className="bg-black/40 rounded-2xl p-2">
                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 border-b flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <p className="text-xs text-gray-600 ml-2">LAIA SKIN - {replaceVariables('{reduction}')}% de réduction exclusive</p>
                      </div>
                      <div 
                        className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}
                        dangerouslySetInnerHTML={{ __html: replaceVariables(emailTemplate) }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Preview */}
              {config.channel !== 'email' && (
                <div className={`${animateCard ? 'animate-pulse' : ''}`}>
                  <div className="bg-gradient-to-br from-teal-900 to-green-900 rounded-2xl p-4">
                    <div className="max-w-sm mx-auto">
                      <div className="bg-white rounded-2xl p-4 shadow-2xl">
                        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                          {replaceVariables(whatsappTemplate)}
                        </pre>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <Check className="w-4 h-4 text-blue-500" />
                          <Check className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-500">
                            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Preview */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Ouvertures prévues', value: '68%', icon: Mail, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Clics estimés', value: '24%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
                  { label: 'Réservations', value: '12%', icon: BarChart3, color: 'from-green-500 to-emerald-500' }
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {isTestMode ? (
                  <button
                    onClick={handleSendTest}
                    disabled={sending}
                    className={`flex-1 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                      sending
                        ? 'bg-gray-500/20 text-white/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/25'
                    }`}
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : showSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Test envoyé !
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le test
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsTestMode(true)}
                      className="px-6 py-4 rounded-2xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
                    >
                      Retour au test
                    </button>
                    <button
                      onClick={handleSendReal}
                      disabled={sending}
                      className={`flex-1 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                        sending
                          ? 'bg-gray-500/20 text-white/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-xl shadow-pink-500/25'
                      }`}
                    >
                      {sending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          Lancement...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          Envoyer la campagne ({segments.find(s => s.id === config.segment)?.count} clientes)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Status Messages */}
              {!isTestMode && (
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-300" />
                    <div>
                      <p className="text-white font-medium text-sm">Mode Envoi Réel</p>
                      <p className="text-orange-200 text-xs">
                        La campagne sera envoyée à {segments.find(s => s.id === config.segment)?.count} clientes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Activity, label: 'Statut', value: 'En ligne', color: 'from-green-500 to-emerald-500' },
            { icon: Shield, label: 'Délivrabilité', value: '99.9%', color: 'from-blue-500 to-cyan-500' },
            { icon: Globe, label: 'Portée', value: 'France', color: 'from-purple-500 to-pink-500' },
            { icon: MessageSquare, label: 'Messages ce mois', value: '1.2K', color: 'from-orange-500 to-red-500' }
          ].map((item, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/60 text-sm">{item.label}</p>
              <p className="text-white text-xl font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}