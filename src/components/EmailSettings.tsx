'use client';

import { useState, useEffect } from 'react';
import { Mail, Settings, Key, Check, AlertCircle, RefreshCw, Info } from 'lucide-react';

export default function EmailSettings() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('contact@laiaskininstitut.fr');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/emails/sync');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Erreur vérification statut:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCredentials = () => {
    // Sauvegarder dans localStorage pour cette session
    localStorage.setItem('email_password', password);
    localStorage.setItem('email_user', email);
    setMessage('Identifiants sauvegardés localement');
    setTimeout(() => setMessage(''), 3000);
  };

  const testConnection = async () => {
    setSyncing(true);
    setMessage('');
    
    try {
      // Pour le test, on va utiliser les identifiants du localStorage
      const response = await fetch('/api/admin/emails/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Email-User': localStorage.getItem('email_user') || email,
          'X-Email-Password': localStorage.getItem('email_password') || password
        },
        body: JSON.stringify({ days: 1 }) // Test avec 1 jour seulement
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Connexion réussie ! ${data.emailCount} emails trouvés.`);
        await checkSyncStatus();
      } else {
        setMessage(`❌ ${data.message || 'Erreur de connexion'}`);
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
    } finally {
      setSyncing(false);
    }
  };

  const syncEmails = async (days: number) => {
    setSyncing(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/emails/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Email-User': localStorage.getItem('email_user') || email,
          'X-Email-Password': localStorage.getItem('email_password') || password
        },
        body: JSON.stringify({ days })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Synchronisation terminée ! ${data.emailCount} emails récupérés.`);
        await checkSyncStatus();
      } else {
        setMessage(`❌ ${data.message || 'Erreur de synchronisation'}`);
      }
    } catch (error) {
      setMessage('❌ Erreur de synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Mail className="h-6 w-6 mr-2 text-purple-600" />
          <h2 className="text-xl font-bold">Configuration Email - Gandi</h2>
        </div>

        {/* Informations de configuration */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Configuration pour Gandi Mail</p>
              <ul className="space-y-1">
                <li>• Serveur IMAP : mail.gandi.net</li>
                <li>• Port : 993 (SSL/TLS)</li>
                <li>• Authentification : Mot de passe normal</li>
                <li>• Adresse : contact@laiaskininstitut.fr</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Formulaire de configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="contact@laiaskininstitut.fr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe de la boîte mail
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Votre mot de passe Gandi"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe est stocké localement et utilisé uniquement pour la synchronisation
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveCredentials}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Key className="h-4 w-4 inline mr-2" />
              Sauvegarder
            </button>
            <button
              onClick={testConnection}
              disabled={syncing || !password}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4 inline mr-2" />
              Tester la connexion
            </button>
          </div>
        </div>

        {/* Message de statut */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 
            message.includes('❌') ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* Actions de synchronisation */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-4">Synchronisation des emails</h3>
          
          {syncStatus && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p>📊 Total d'emails : {syncStatus.total}</p>
              {syncStatus.lastSync && (
                <p>🕒 Dernière sync : {new Date(syncStatus.lastSync).toLocaleString('fr-FR')}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => syncEmails(1)}
              disabled={syncing || !localStorage.getItem('email_password')}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              Aujourd'hui
            </button>
            <button
              onClick={() => syncEmails(7)}
              disabled={syncing || !localStorage.getItem('email_password')}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              7 jours
            </button>
            <button
              onClick={() => syncEmails(30)}
              disabled={syncing || !localStorage.getItem('email_password')}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              30 jours
            </button>
            <button
              onClick={() => syncEmails(365)}
              disabled={syncing || !localStorage.getItem('email_password')}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              1 an
            </button>
          </div>

          {syncing && (
            <div className="mt-4 flex items-center text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
              Synchronisation en cours...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}