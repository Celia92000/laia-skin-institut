// Script de test pour vérifier que Resend fonctionne
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testResend() {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY || RESEND_API_KEY === 'dummy_key') {
    console.log('❌ Clé Resend non configurée');
    console.log('Ajoutez RESEND_API_KEY dans .env.local');
    return;
  }

  console.log('🔑 Clé Resend détectée:', RESEND_API_KEY.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LAIA SKIN Institut <onboarding@resend.dev>',
        to: ['delivered@resend.dev'], // Email de test Resend
        subject: 'Test LAIA SKIN - Configuration Resend',
        html: `
          <h1>✅ Resend fonctionne !</h1>
          <p>La configuration est correcte pour LAIA SKIN Institut.</p>
          <p>Les emails de confirmation peuvent maintenant être envoyés.</p>
        `
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email de test envoyé avec succès !');
      console.log('ID:', data.id);
      console.log('');
      console.log('🎉 Resend est correctement configuré !');
      console.log('Les emails de confirmation fonctionneront.');
    } else {
      console.log('❌ Erreur:', data);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error);
  }
}

testResend();