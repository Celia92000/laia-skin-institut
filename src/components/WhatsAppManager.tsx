"use client";

import { useState, useEffect } from "react";
import { 
  MessageCircle, Send, Users, Clock, Settings, 
  CheckCircle, AlertCircle, Smartphone, Link,
  Copy, ExternalLink, Bell, Gift, Calendar
} from "lucide-react";
import { whatsappTemplates } from "@/lib/whatsapp";

export default function WhatsAppManager() {
  const [activeTab, setActiveTab] = useState<'quick' | 'broadcast' | 'auto' | 'settings'>('quick');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [broadcastList, setBroadcastList] = useState<string[]>([]);
  const [automationSettings, setAutomationSettings] = useState({
    confirmations: true,
    reminders24h: true,
    reminders2h: false,
    birthday: true,
    followUp: true
  });

  // Numéro WhatsApp Business de l'institut
  const BUSINESS_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+33683717050'; // Numéro de Célia IVORRA - LAIA SKIN

  // Générer un lien WhatsApp direct
  const generateWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  };

  // Copier le lien dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Lien copié !');
  };

  // Templates prédéfinis
  const templates = [
    { id: 'custom', name: 'Message personnalisé', icon: '✍️' },
    { id: 'confirmation', name: 'Confirmation RDV', icon: '✅' },
    { id: 'reminder', name: 'Rappel RDV', icon: '⏰' },
    { id: 'birthday', name: 'Anniversaire', icon: '🎂' },
    { id: 'promo', name: 'Promotion', icon: '🎁' },
    { id: 'followup', name: 'Suivi après soin', icon: '💆‍♀️' }
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-500" />
          WhatsApp Business Manager
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
          <Smartphone className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {BUSINESS_NUMBER}
          </span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('quick')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'quick'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Envoi rapide
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'broadcast'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Diffusion
        </button>
        <button
          onClick={() => setActiveTab('auto')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'auto'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Automatisations
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'settings'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configuration
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'quick' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Numéro du client
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Template de message
            </label>
            <div className="grid grid-cols-3 gap-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    if (template.id === 'confirmation') {
                      setMessage(whatsappTemplates.reservationConfirmation({
                        clientName: 'Marie',
                        date: '15 janvier 2025',
                        time: '14h30',
                        services: ['LAIA Hydro\'Cleaning'],
                        totalPrice: 120
                      }));
                    } else if (template.id === 'reminder') {
                      setMessage(whatsappTemplates.appointmentReminder({
                        clientName: 'Marie',
                        time: '14h30',
                        services: ['LAIA Hydro\'Cleaning']
                      }));
                    } else if (template.id === 'birthday') {
                      setMessage(whatsappTemplates.birthdayMessage({
                        clientName: 'Marie'
                      }));
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="text-2xl">{template.icon}</span>
                  <p className="text-xs mt-1">{template.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
              placeholder="Tapez votre message ici..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const link = generateWhatsAppLink(phoneNumber, message);
                window.open(link, '_blank');
              }}
              disabled={!phoneNumber || !message}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Envoyer via WhatsApp
            </button>
            <button
              onClick={() => {
                const link = generateWhatsAppLink(phoneNumber, message);
                copyToClipboard(link);
              }}
              disabled={!phoneNumber || !message}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>
                Pour envoyer des messages en masse, utilisez les listes de diffusion WhatsApp Business.
                Maximum 256 contacts par liste.
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#2c3e50] mb-3">Groupes de clients</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-green-600" />
                <span>Tous les clients actifs</span>
                <span className="ml-auto text-sm text-gray-500">127 contacts</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-green-600" />
                <span>Clients fidèles (6+ séances)</span>
                <span className="ml-auto text-sm text-gray-500">23 contacts</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-green-600" />
                <span>Anniversaires ce mois</span>
                <span className="ml-auto text-sm text-gray-500">8 contacts</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-green-600" />
                <span>Clients inactifs (+3 mois)</span>
                <span className="ml-auto text-sm text-gray-500">15 contacts</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Message de diffusion
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="🌟 Offre spéciale..."
              defaultValue={whatsappTemplates.flashPromo({
                promotion: "🌸 -20% sur tous les soins visage cette semaine !",
                validUntil: "31 janvier 2025"
              })}
            />
          </div>

          <button className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all">
            <Users className="w-5 h-5 inline mr-2" />
            Créer la liste de diffusion
          </button>
        </div>
      )}

      {activeTab === 'auto' && (
        <div className="space-y-6">
          <h3 className="font-medium text-[#2c3e50]">Messages automatiques activés</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Confirmations de réservation</p>
                  <p className="text-sm text-gray-500">Envoyé immédiatement après validation</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={automationSettings.confirmations}
                onChange={(e) => setAutomationSettings({...automationSettings, confirmations: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Rappel 24h avant</p>
                  <p className="text-sm text-gray-500">Envoyé la veille à 18h</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={automationSettings.reminders24h}
                onChange={(e) => setAutomationSettings({...automationSettings, reminders24h: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Rappel 2h avant</p>
                  <p className="text-sm text-gray-500">Rappel de dernière minute</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={automationSettings.reminders2h}
                onChange={(e) => setAutomationSettings({...automationSettings, reminders2h: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="font-medium">Vœux d'anniversaire</p>
                  <p className="text-sm text-gray-500">Envoyé le jour J à 9h avec -10€</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={automationSettings.birthday}
                onChange={(e) => setAutomationSettings({...automationSettings, birthday: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Suivi après soin</p>
                  <p className="text-sm text-gray-500">Message de suivi le lendemain</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={automationSettings.followUp}
                onChange={(e) => setAutomationSettings({...automationSettings, followUp: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>
          </div>

          <button className="w-full px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all">
            Sauvegarder les automatisations
          </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <h3 className="font-medium text-[#2c3e50] mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Méthodes de connexion WhatsApp
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Option 1: Lien direct (Recommandé)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Utilise les liens wa.me pour ouvrir WhatsApp directement
                </p>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <code className="text-xs flex-1">https://wa.me/{BUSINESS_NUMBER.replace('+', '')}</code>
                  <button
                    onClick={() => copyToClipboard(`https://wa.me/${BUSINESS_NUMBER.replace('+', '')}`)}
                    className="p-2 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Option 2: QR Code</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Les clients scannent pour démarrer une conversation
                </p>
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  Générer QR Code
                </button>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Option 3: API WhatsApp Business</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Pour automatisation complète (nécessite configuration)
                </p>
                <a
                  href="https://business.whatsapp.com/products/business-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  En savoir plus
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Astuce</h4>
            <p className="text-sm text-blue-800">
              Ajoutez ce lien sur votre site web pour que les clients puissent vous contacter facilement :
            </p>
            <code className="block mt-2 p-2 bg-white rounded text-xs">
              {`<a href="https://wa.me/${BUSINESS_NUMBER.replace('+', '')}?text=Bonjour,%20je%20souhaite%20prendre%20rendez-vous">Contactez-nous sur WhatsApp</a>`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}