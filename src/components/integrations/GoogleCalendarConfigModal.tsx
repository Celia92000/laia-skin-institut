'use client';

import { useState } from 'react';
import { X, Calendar, Check, AlertCircle, ExternalLink, Info } from 'lucide-react';

interface GoogleCalendarConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => void;
}

export default function GoogleCalendarConfigModal({ onClose, onSave }: GoogleCalendarConfigModalProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/integrations/google/callback` : '',
    syncDirection: 'bidirectional', // bidirectional, to_google, from_google
    calendarId: 'primary',
    syncInterval: '15', // minutes
    autoCreateEvents: true,
    updateExistingEvents: true
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/integrations/google-calendar/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
        setErrorMessage(data.error || 'Erreur lors du test de connexion');
      }
    } catch (error) {
      setTestResult('error');
      setErrorMessage('Impossible de se connecter au serveur');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      type: 'google_calendar',
      name: 'Google Calendar',
      ...config
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Google Calendar</h2>
                <p className="text-blue-100 text-sm">Synchronisation des rendez-vous</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {step > s ? <Check size={16} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step > s ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1 : Configuration API */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. Créer un projet Google Cloud
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-2">Instructions :</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Allez sur <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink size={12} /></a></li>
                        <li>Créez un nouveau projet</li>
                        <li>Activez l'API Google Calendar</li>
                        <li>Créez des identifiants OAuth 2.0</li>
                        <li>Copiez vos clés ci-dessous</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={config.clientId}
                      onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                      placeholder="xxxxx.apps.googleusercontent.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      value={config.clientSecret}
                      onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                      placeholder="GOCSPX-xxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URI de redirection
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={config.redirectUri}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(config.redirectUri)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Copier
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Ajoutez cette URL dans les URI de redirection autorisées sur Google Cloud Console
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!config.clientId || !config.clientSecret}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 2 : Options de synchronisation */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Options de synchronisation
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direction de synchronisation
                    </label>
                    <select
                      value={config.syncDirection}
                      onChange={(e) => setConfig({ ...config, syncDirection: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bidirectional">Bidirectionnelle (recommandé)</option>
                      <option value="to_google">Vers Google Calendar uniquement</option>
                      <option value="from_google">Depuis Google Calendar uniquement</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Bidirectionnelle = les modifications sont synchronisées dans les deux sens
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID du calendrier
                    </label>
                    <input
                      type="text"
                      value={config.calendarId}
                      onChange={(e) => setConfig({ ...config, calendarId: e.target.value })}
                      placeholder="primary"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      "primary" pour le calendrier principal, ou l'ID d'un calendrier spécifique
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalle de synchronisation (minutes)
                    </label>
                    <select
                      value={config.syncInterval}
                      onChange={(e) => setConfig({ ...config, syncInterval: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                    </select>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoCreateEvents}
                        onChange={(e) => setConfig({ ...config, autoCreateEvents: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Créer automatiquement les événements dans Google Calendar
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.updateExistingEvents}
                        onChange={(e) => setConfig({ ...config, updateExistingEvents: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Mettre à jour les événements existants
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 3 : Test et confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. Test de connexion
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Client ID:</span>
                    <span className="text-gray-900 font-mono text-xs">{config.clientId.substring(0, 20)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Synchronisation:</span>
                    <span className="text-gray-900">
                      {config.syncDirection === 'bidirectional' ? 'Bidirectionnelle' :
                       config.syncDirection === 'to_google' ? 'Vers Google' : 'Depuis Google'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Intervalle:</span>
                    <span className="text-gray-900">{config.syncInterval} minutes</span>
                  </div>
                </div>

                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Test en cours...
                    </>
                  ) : (
                    'Tester la connexion'
                  )}
                </button>

                {testResult === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Connexion réussie !</p>
                      <p className="text-sm text-green-700 mt-1">
                        L'intégration Google Calendar est prête à être activée.
                      </p>
                    </div>
                  </div>
                )}

                {testResult === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Erreur de connexion</p>
                      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleSave}
                  disabled={testResult !== 'success'}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Activer Google Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
