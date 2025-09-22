'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>('');

  const sendTestEmail = async () => {
    setSending(true);
    setResult('Envoi en cours...');

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'default_service',
          template_id: 'template_myu4emv',
          user_id: 'QK6MriGN3B0UqkIoS',
          template_params: {
            to_email: 'celia.ivorra95@hotmail.fr',
            client_name: 'Célia',
            from_name: 'LAIA SKIN Institut',
            reply_to: 'contact@laia.skininstitut.fr',
            service_name: 'Test Email',
            appointment_date: new Date().toLocaleDateString('fr-FR'),
            appointment_time: '14:00',
            salon_name: 'LAIA SKIN Institut',
            salon_address: 'Ceci est un email de test envoyé depuis le navigateur.'
          }
        })
      });

      if (response.ok) {
        setResult('✅ Email envoyé avec succès ! Vérifiez votre boîte mail.');
      } else {
        const error = await response.text();
        setResult(`❌ Erreur: ${error}`);
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Test Email - EmailJS</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Configuration :</h2>
            <ul className="text-sm space-y-1">
              <li>Service ID: default_service</li>
              <li>Template ID: template_myu4emv</li>
              <li>User ID: QK6MriGN3B0UqkIoS</li>
              <li>Destinataire: celia.ivorra95@hotmail.fr</li>
            </ul>
          </div>

          <button
            onClick={sendTestEmail}
            disabled={sending}
            className={`w-full py-3 px-4 rounded-lg font-semibold ${
              sending 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {sending ? 'Envoi en cours...' : 'Envoyer Email de Test'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.includes('✅') 
                ? 'bg-green-50 text-green-800' 
                : result.includes('❌')
                ? 'bg-red-50 text-red-800'
                : 'bg-gray-50 text-gray-800'
            }`}>
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important :</strong> EmailJS fonctionne uniquement depuis le navigateur. 
              Les appels serveur sont bloqués pour des raisons de sécurité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}