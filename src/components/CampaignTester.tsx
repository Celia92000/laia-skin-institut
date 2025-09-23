'use client';

import React, { useState } from 'react';
import { 
  Send, Mail, Phone, Users, Eye, CheckCircle, 
  AlertCircle, Sparkles, TestTube, Zap, Settings,
  ChevronRight, Copy, Edit, X, Check
} from 'lucide-react';

interface TestRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'test' | 'real';
}

interface CampaignContent {
  subject: string;
  emailContent: string;
  whatsappContent: string;
  variables: Record<string, string>;
}

export default function CampaignTester() {
  const [activeChannel, setActiveChannel] = useState<'both' | 'email' | 'whatsapp'>('both');
  const [testMode, setTestMode] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState('vip');
  const [testRecipients, setTestRecipients] = useState<TestRecipient[]>([
    { id: '1', name: 'Test Admin', email: 'admin@laiaskin.com', phone: '+33612345678', type: 'test' },
    { id: '2', name: 'Test Marketing', email: 'marketing@laiaskin.com', phone: '+33623456789', type: 'test' }
  ]);
  const [customTestEmail, setCustomTestEmail] = useState('');
  const [customTestPhone, setCustomTestPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showWhatsAppEditor, setShowWhatsAppEditor] = useState(false);
  
  const [campaignContent, setCampaignContent] = useState<CampaignContent>({
    subject: '✨ Offre Exclusive LAIA SKIN - {reduction}% sur votre prochain soin',
    emailContent: `
      <div style="text-align: center; padding: 40px 20px;">
        <h1 style="color: #d4b5a0; font-size: 28px; margin-bottom: 20px;">
          Offre Exclusive pour nos Clientes VIP
        </h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Chère {nom},<br><br>
          En tant que cliente privilégiée, profitez de <strong>{reduction}%</strong> de réduction
          sur votre prochain soin jusqu'au {date_limite}.
        </p>
        <div style="margin: 40px 0;">
          <a href="https://laia-skin-institut.fr/reservation" 
             style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); 
                    color: white; padding: 15px 40px; text-decoration: none; 
                    border-radius: 25px; display: inline-block; font-weight: bold;">
            Réserver maintenant
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          Code promo: {code_promo}<br>
          Valable jusqu'au {date_limite}
        </p>
      </div>
    `,
    whatsappContent: `✨ *LAIA SKIN Institut* ✨

Bonjour {nom} 💕

🎁 *Offre VIP Exclusive*
Profitez de *-{reduction}%* sur votre prochain soin !

📅 Valable jusqu'au {date_limite}
🎟️ Code: {code_promo}

👉 Réservez sur: laia-skin-institut.fr
📞 Ou appelez le 01 23 45 67 89

À très bientôt !
L'équipe LAIA SKIN 🌸`,
    variables: {
      nom: 'Sophie',
      reduction: '30',
      date_limite: '31 décembre 2024',
      code_promo: 'VIP30'
    }
  });

  const segments = [
    { id: 'vip', name: 'Clientes VIP', count: 45, icon: '⭐' },
    { id: 'new', name: 'Nouvelles clientes', count: 23, icon: '🆕' },
    { id: 'inactive', name: 'Clientes inactives', count: 67, icon: '😴' },
    { id: 'birthday', name: 'Anniversaires ce mois', count: 12, icon: '🎂' },
    { id: 'loyal', name: 'Clientes fidèles (6+ visites)', count: 89, icon: '💖' }
  ];

  const replaceVariables = (text: string): string => {
    let result = text;
    Object.entries(campaignContent.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  };

  const handleAddTestRecipient = () => {
    if (customTestEmail || customTestPhone) {
      const newRecipient: TestRecipient = {
        id: Date.now().toString(),
        name: 'Test personnalisé',
        email: customTestEmail,
        phone: customTestPhone,
        type: 'test'
      };
      setTestRecipients([...testRecipients, newRecipient]);
      setCustomTestEmail('');
      setCustomTestPhone('');
    }
  };

  const handleSendTest = async () => {
    setSending(true);
    
    // Simuler l'envoi
    setTimeout(() => {
      const results = {
        email: activeChannel !== 'whatsapp' ? {
          sent: testRecipients.filter(r => r.email).length,
          failed: 0,
          preview: replaceVariables(campaignContent.emailContent)
        } : null,
        whatsapp: activeChannel !== 'email' ? {
          sent: testRecipients.filter(r => r.phone).length,
          failed: 0,
          preview: replaceVariables(campaignContent.whatsappContent)
        } : null,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(results);
      setSending(false);
    }, 2000);
  };

  const handleSendReal = async () => {
    if (!confirm(`Êtes-vous sûr d'envoyer la campagne à ${segments.find(s => s.id === selectedSegment)?.count} personnes ?`)) {
      return;
    }
    
    setSending(true);
    
    // Simuler l'envoi réel
    setTimeout(() => {
      alert('✅ Campagne envoyée avec succès !');
      setSending(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#d4b5a0' }}>
                <TestTube className="w-8 h-8" />
                Test de Campagne
              </h1>
              <p className="text-gray-600 mt-1">Testez votre campagne avant l'envoi réel</p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTestMode(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  testMode ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                <TestTube className="w-4 h-4 inline mr-2" />
                Mode Test
              </button>
              <button
                onClick={() => setTestMode(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !testMode ? 'bg-white shadow text-green-600' : 'text-gray-600'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Envoi Réel
              </button>
            </div>
          </div>

          {/* Canal Selection */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveChannel('both')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                activeChannel === 'both' 
                  ? 'border-[#d4b5a0] bg-[#fdfbfb]' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: activeChannel === 'both' ? '#d4b5a0' : '#e0e0e0' }}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Email + WhatsApp</p>
                  <p className="text-sm text-gray-600">Campagne multi-canal</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveChannel('email')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                activeChannel === 'email' 
                  ? 'border-[#d4b5a0] bg-[#fdfbfb]' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: activeChannel === 'email' ? '#d4b5a0' : '#e0e0e0' }}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Email uniquement</p>
                  <p className="text-sm text-gray-600">Campagne email</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                activeChannel === 'whatsapp' 
                  ? 'border-[#d4b5a0] bg-[#fdfbfb]' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: activeChannel === 'whatsapp' ? '#d4b5a0' : '#e0e0e0' }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">WhatsApp uniquement</p>
                  <p className="text-sm text-gray-600">Campagne WhatsApp</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Configuration */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" style={{ color: '#d4b5a0' }} />
                Configuration
              </h2>

              {/* Segment Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Segment cible
                </label>
                <div className="space-y-2">
                  {segments.map(segment => (
                    <label key={segment.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="segment"
                        value={segment.id}
                        checked={selectedSegment === segment.id}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="text-[#d4b5a0]"
                      />
                      <span className="text-2xl">{segment.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-sm text-gray-500">{segment.count} personnes</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Variables */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Variables personnalisables
                </label>
                <div className="space-y-2">
                  {Object.entries(campaignContent.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">{key}:</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setCampaignContent({
                          ...campaignContent,
                          variables: { ...campaignContent.variables, [key]: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Recipients */}
              {testMode && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Destinataires de test
                  </label>
                  <div className="space-y-2 mb-3">
                    {testRecipients.map(recipient => (
                      <div key={recipient.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{recipient.name}</p>
                          <p className="text-xs text-gray-500">
                            {recipient.email && `✉️ ${recipient.email}`}
                            {recipient.email && recipient.phone && ' • '}
                            {recipient.phone && `📱 ${recipient.phone}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setTestRecipients(testRecipients.filter(r => r.id !== recipient.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add custom test recipient */}
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Email de test"
                      value={customTestEmail}
                      onChange={(e) => setCustomTestEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone de test"
                      value={customTestPhone}
                      onChange={(e) => setCustomTestPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                      onClick={handleAddTestRecipient}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#d4b5a0] hover:text-[#d4b5a0] transition-colors"
                    >
                      + Ajouter destinataire test
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Previews */}
          <div className="col-span-12 lg:col-span-8">
            <div className="space-y-6">
              {/* Email Preview */}
              {activeChannel !== 'whatsapp' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="w-5 h-5" style={{ color: '#d4b5a0' }} />
                      Aperçu Email
                    </h2>
                    <button
                      onClick={() => setShowEmailEditor(!showEmailEditor)}
                      className="text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showEmailEditor ? (
                    <div>
                      <input
                        type="text"
                        value={campaignContent.subject}
                        onChange={(e) => setCampaignContent({...campaignContent, subject: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mb-3"
                        placeholder="Objet de l'email"
                      />
                      <textarea
                        value={campaignContent.emailContent}
                        onChange={(e) => setCampaignContent({...campaignContent, emailContent: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg h-64 font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowEmailEditor(false)}
                        className="mt-3 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084]"
                      >
                        Appliquer
                      </button>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <p className="text-sm text-gray-600">De: LAIA SKIN Institut</p>
                        <p className="text-sm font-medium">Objet: {replaceVariables(campaignContent.subject)}</p>
                      </div>
                      <div 
                        className="p-4"
                        dangerouslySetInnerHTML={{ __html: replaceVariables(campaignContent.emailContent) }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp Preview */}
              {activeChannel !== 'email' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="w-5 h-5" style={{ color: '#d4b5a0' }} />
                      Aperçu WhatsApp
                    </h2>
                    <button
                      onClick={() => setShowWhatsAppEditor(!showWhatsAppEditor)}
                      className="text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showWhatsAppEditor ? (
                    <div>
                      <textarea
                        value={campaignContent.whatsappContent}
                        onChange={(e) => setCampaignContent({...campaignContent, whatsappContent: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg h-64 font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowWhatsAppEditor(false)}
                        className="mt-3 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084]"
                      >
                        Appliquer
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#e5ddd5] rounded-lg p-4">
                      <div className="bg-white rounded-lg shadow-sm p-3 max-w-sm">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {replaceVariables(campaignContent.whatsappContent)}
                        </pre>
                        <div className="text-xs text-gray-500 text-right mt-2">
                          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test Results */}
              {testResults && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    Résultats du test
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {testResults.email && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-2xl font-bold text-green-600">{testResults.email.sent} envoyés</p>
                        <p className="text-sm text-gray-500">{testResults.email.failed} échecs</p>
                      </div>
                    )}
                    {testResults.whatsapp && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">WhatsApp</p>
                        <p className="text-2xl font-bold text-green-600">{testResults.whatsapp.sent} envoyés</p>
                        <p className="text-sm text-gray-500">{testResults.whatsapp.failed} échecs</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {testMode ? (
                  <button
                    onClick={handleSendTest}
                    disabled={sending || testRecipients.length === 0}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      sending || testRecipients.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    }`}
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi du test...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-5 h-5" />
                        Envoyer le test
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setTestMode(true)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:border-[#d4b5a0] transition-colors"
                    >
                      Retour au test
                    </button>
                    <button
                      onClick={handleSendReal}
                      disabled={sending}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        sending
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      }`}
                      style={!sending ? {
                        background: 'linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%)'
                      } : {}}
                    >
                      {sending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer la campagne ({segments.find(s => s.id === selectedSegment)?.count} personnes)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Warning */}
              {!testMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Attention - Mode envoi réel</p>
                    <p className="text-sm text-yellow-700">
                      Cette campagne sera envoyée à {segments.find(s => s.id === selectedSegment)?.count} personnes réelles.
                      Assurez-vous d'avoir testé le contenu avant.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}