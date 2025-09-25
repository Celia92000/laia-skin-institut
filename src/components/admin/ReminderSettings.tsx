'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Settings, Save, TestTube, Send, Phone, MessageCircle } from 'lucide-react';

interface ReminderConfig {
  enabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  timeBefore: number; // en heures
  messageTemplate: string;
  testPhone?: string;
}

export default function ReminderSettings() {
  const [config, setConfig] = useState<ReminderConfig>({
    enabled: true,
    smsEnabled: true,
    whatsappEnabled: false,
    timeBefore: 24,
    messageTemplate: "Bonjour {name}, nous vous rappelons votre rendez-vous demain à {time} pour {service}. LAIA SKIN Institut",
    testPhone: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Charger la configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reminders/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reminders/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Configuration sauvegardée avec succès' });
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const sendTestMessage = async () => {
    if (!config.testPhone) {
      setTestResult({ success: false, message: 'Veuillez entrer un numéro de téléphone' });
      return;
    }

    setTesting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reminders/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: config.testPhone,
          type: config.whatsappEnabled ? 'whatsapp' : 'sms',
          message: config.messageTemplate
            .replace('{name}', 'Marie Dupont')
            .replace('{time}', '14h30')
            .replace('{service}', 'Soin visage hydratant')
        })
      });
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Message test envoyé avec succès!' });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Erreur lors de l\'envoi du message test' });
    } finally {
      setTesting(false);
    }
  };

  const timeOptions = [
    { value: 1, label: '1 heure avant' },
    { value: 2, label: '2 heures avant' },
    { value: 6, label: '6 heures avant' },
    { value: 12, label: '12 heures avant' },
    { value: 24, label: '24 heures avant' },
    { value: 48, label: '48 heures avant' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8B7355]" />
          Configuration des rappels automatiques
        </h3>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8B7355]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B7355]"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">
              {config.enabled ? 'Activé' : 'Désactivé'}
            </span>
          </label>
        </div>
      </div>

      {config.enabled && (
        <div className="space-y-6">
          {/* Type de rappel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Canaux de communication
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfig({ ...config, smsEnabled: !config.smsEnabled })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  config.smsEnabled 
                    ? 'border-[#8B7355] bg-[#8B7355]/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Phone className={`w-6 h-6 mx-auto mb-2 ${config.smsEnabled ? 'text-[#8B7355]' : 'text-gray-500'}`} />
                <p className="text-sm font-medium">SMS</p>
                <p className="text-xs text-gray-500 mt-1">Rappels par SMS classique</p>
              </button>
              
              <button
                onClick={() => setConfig({ ...config, whatsappEnabled: !config.whatsappEnabled })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  config.whatsappEnabled 
                    ? 'border-[#8B7355] bg-[#8B7355]/10' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <MessageCircle className={`w-6 h-6 mx-auto mb-2 ${config.whatsappEnabled ? 'text-[#8B7355]' : 'text-gray-500'}`} />
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-gray-500 mt-1">Messages WhatsApp Business</p>
              </button>
            </div>
          </div>

          {/* Timing des rappels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Envoyer le rappel
            </label>
            <select
              value={config.timeBefore}
              onChange={(e) => setConfig({ ...config, timeBefore: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Template de message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle de message
            </label>
            <textarea
              value={config.messageTemplate}
              onChange={(e) => setConfig({ ...config, messageTemplate: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
              placeholder="Bonjour {name}, rappel de votre RDV..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles: {'{name}'}, {'{time}'}, {'{date}'}, {'{service}'}
            </p>
          </div>

          {/* Test d'envoi */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Tester l'envoi
            </h4>
            <div className="flex gap-3">
              <input
                type="tel"
                value={config.testPhone}
                onChange={(e) => setConfig({ ...config, testPhone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
              />
              <button
                onClick={sendTestMessage}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {testing ? 'Envoi...' : 'Envoyer test'}
              </button>
            </div>
          </div>

          {/* Résultat du test */}
          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7A6248] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}