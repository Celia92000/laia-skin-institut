"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, CheckCircle, AlertCircle, 
  Smartphone, Link, Copy, ExternalLink, Info
} from "lucide-react";

export default function WhatsAppSetup() {
  const [config, setConfig] = useState({
    phoneNumber: '+33683717050',
    businessName: 'LAIA SKIN Institut',
    provider: 'direct', // direct, meta, twilio
    autoResponses: true,
    automatedReminders: true,
    birthdayMessages: true,
    marketingMessages: false
  });
  
  const [saved, setSaved] = useState(false);
  const [testNumber, setTestNumber] = useState('');

  useEffect(() => {
    // Charger la configuration sauvegardée
    const savedConfig = localStorage.getItem('whatsappConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfiguration = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem('whatsappConfig', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    // En production, sauvegarder aussi côté serveur
    fetch('/api/whatsapp/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(config)
    });
  };

  const [testError, setTestError] = useState('');
  
  const testWhatsApp = () => {
    if (!testNumber) {
      setTestError('Veuillez entrer un numéro pour tester');
      setTimeout(() => setTestError(''), 3000);
      return;
    }
    
    const message = `Test depuis LAIA SKIN Institut 🌟\nCeci est un message de test pour vérifier la configuration WhatsApp.`;
    const cleanNumber = testNumber.replace(/\D/g, '');
    const link = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
    setTestError('');
  };

  const [codeCopied, setCodeCopied] = useState(false);
  
  const copyWebsiteCode = () => {
    const code = `<!-- Bouton WhatsApp pour votre site -->
<a href="https://wa.me/${config.phoneNumber.replace(/\D/g, '')}?text=Bonjour,%20je%20souhaite%20prendre%20rendez-vous" 
   target="_blank" 
   style="position: fixed; bottom: 20px; right: 20px; background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 1000;">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
  <span>Contactez-nous</span>
</a>`;
    
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 3000);
    }).catch(() => {
      // Fallback si clipboard API échoue
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 3000);
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-3">
          <Settings className="w-8 h-8 text-green-500" />
          Configuration WhatsApp Business
        </h2>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            Configuration sauvegardée !
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Configuration de base */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-[#2c3e50] mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Informations de base
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro WhatsApp Business
              </label>
              <input
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={config.phoneNumber}
                onChange={(e) => setConfig({...config, phoneNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format international avec indicatif pays
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => setConfig({...config, businessName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Méthode de connexion */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-[#2c3e50] mb-4 flex items-center gap-2">
            <Link className="w-5 h-5" />
            Méthode de connexion
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="direct"
                checked={config.provider === 'direct'}
                onChange={(e) => setConfig({...config, provider: e.target.value})}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">Lien direct (Recommandé pour commencer)</p>
                <p className="text-sm text-gray-600 mt-1">
                  Utilise les liens wa.me pour ouvrir WhatsApp. Simple et rapide.
                </p>
                <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                  ✅ Aucune configuration requise - Fonctionne immédiatement
                </div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="meta"
                checked={config.provider === 'meta'}
                onChange={(e) => setConfig({...config, provider: e.target.value})}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">WhatsApp Business API (Automatisation complète)</p>
                <p className="text-sm text-gray-600 mt-1">
                  API officielle Meta pour envoi automatique. Nécessite configuration.
                </p>
                <a 
                  href="https://business.whatsapp.com" 
                  target="_blank"
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1"
                >
                  Configuration requise <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </label>
          </div>
        </div>

        {/* Automatisations */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-[#2c3e50] mb-4">
            Messages automatiques
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Réponses automatiques aux questions fréquentes</span>
              <input
                type="checkbox"
                checked={config.autoResponses}
                onChange={(e) => setConfig({...config, autoResponses: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Rappels automatiques de rendez-vous</span>
              <input
                type="checkbox"
                checked={config.automatedReminders}
                onChange={(e) => setConfig({...config, automatedReminders: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Messages d'anniversaire avec réduction</span>
              <input
                type="checkbox"
                checked={config.birthdayMessages}
                onChange={(e) => setConfig({...config, birthdayMessages: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Messages promotionnels</span>
              <input
                type="checkbox"
                checked={config.marketingMessages}
                onChange={(e) => setConfig({...config, marketingMessages: e.target.checked})}
                className="w-5 h-5 text-green-600"
              />
            </label>
          </div>
        </div>

        {/* Test de connexion */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-[#2c3e50] mb-4">
            Tester la configuration
          </h3>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="tel"
                placeholder="Numéro de test (ex: 06 12 34 56 78)"
                value={testNumber}
                onChange={(e) => {setTestNumber(e.target.value); setTestError('');}}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none transition-all ${
                  testError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
                }`}
              />
              <button
                onClick={testWhatsApp}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              >
                Envoyer un test
              </button>
            </div>
            {testError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {testError}
              </div>
            )}
          </div>
        </div>

        {/* Code pour site web */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-[#2c3e50] mb-4">
            Intégration sur votre site web
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Ajoutez un bouton WhatsApp flottant sur votre site pour que les clients puissent vous contacter facilement.
          </p>
          
          <button
            onClick={copyWebsiteCode}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              codeCopied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {codeCopied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Code copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copier le code HTML
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Prochaines étapes :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Entrez votre numéro WhatsApp Business</li>
                <li>Choisissez la méthode "Lien direct" pour commencer rapidement</li>
                <li>Testez la configuration avec votre propre numéro</li>
                <li>Activez les automatisations souhaitées</li>
                <li>Pour l'automatisation complète, configurez l'API WhatsApp Business plus tard</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <button
          onClick={saveConfiguration}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Sauvegarder la configuration
        </button>
      </div>
    </div>
  );
}