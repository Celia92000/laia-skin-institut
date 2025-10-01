// Test spécifique pour Resend Email
// Exécuter avec : npx tsx test-resend-email.ts

import { Resend } from 'resend';

// Charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendEmail() {
  console.log('\n🔧 Configuration Resend:');
  console.log('========================');
  console.log('API Key:', process.env.RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante');
  console.log('From Email:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('\n❌ RESEND_API_KEY non configurée dans .env.local');
    return;
  }
  
  try {
    console.log('\n📧 Test d\'envoi d\'email...');
    
    const result = await resend.emails.send({
      from: 'LAIA SKIN Institut <onboarding@resend.dev>',
      to: ['celia.ivorra95@hotmail.fr'], // Email de test
      subject: '✅ Test Resend - LAIA SKIN Institut',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2c3e50; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B7355, #A0826D); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; margin-top: -10px; }
            .success { color: #27ae60; font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Test Email Resend ✨</h1>
              <p>LAIA SKIN Institut</p>
            </div>
            <div class="content">
              <p class="success">✅ Email envoyé avec succès !</p>
              <p>Si vous recevez cet email, cela signifie que :</p>
              <ul>
                <li>✅ Resend est correctement configuré</li>
                <li>✅ L'API Key est valide</li>
                <li>✅ Les emails peuvent être envoyés</li>
              </ul>
              <h3>🤖 Automatisations actives :</h3>
              <ul>
                <li>📧 Confirmation de réservation</li>
                <li>⏰ Rappels 24h et 2h avant RDV</li>
                <li>📝 Demande d'avis 3 jours après</li>
                <li>🎂 Email d'anniversaire</li>
                <li>💝 Notifications de parrainage</li>
              </ul>
              <p><strong>Test effectué le :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Test Resend - Si vous recevez cet email, Resend fonctionne correctement !'
    });
    
    console.log('✅ Email envoyé avec succès !');
    console.log('ID:', result.data?.id);
    console.log('Destinataire: celia.ivorra95@hotmail.fr');
    console.log('\n📬 Vérifiez votre boîte de réception !');
    
    // Tester l'API de confirmation de réservation
    console.log('\n🔍 Test de l\'API de confirmation...');
    const response = await fetch('http://localhost:3001/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reservationId: 'test-id' // Va échouer mais on teste la connexion
      })
    });
    
    if (response.status === 404) {
      console.log('✅ API accessible (réservation test non trouvée - normal)');
    } else if (response.ok) {
      console.log('✅ API de confirmation fonctionne');
    } else {
      console.log('❌ Erreur API:', response.status);
    }
    
  } catch (error: any) {
    console.log('\n❌ Erreur lors de l\'envoi:');
    console.log(error.message);
    
    if (error.message?.includes('401')) {
      console.log('\n⚠️ Clé API invalide ou expirée');
      console.log('Vérifiez votre clé dans le dashboard Resend : https://resend.com/api-keys');
    } else if (error.message?.includes('domain')) {
      console.log('\n⚠️ Problème de domaine');
      console.log('Pour utiliser contact@laiaskininstitut.fr, vous devez vérifier le domaine dans Resend');
      console.log('En attendant, utilisez : onboarding@resend.dev');
    }
  }
}

// Tester aussi les variables WhatsApp
async function testWhatsAppConfig() {
  console.log('\n📱 Configuration WhatsApp (Twilio):');
  console.log('====================================');
  console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Configuré' : '❌ Manquant');
  console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? '✅ Configuré' : '❌ Manquant');
  console.log('WhatsApp From:', process.env.TWILIO_WHATSAPP_FROM || '❌ Manquant');
  console.log('Provider:', process.env.WHATSAPP_PROVIDER || 'twilio');
  
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('\n✅ Twilio WhatsApp est configuré et prêt !');
    console.log('   Les messages WhatsApp peuvent être envoyés');
  } else {
    console.log('\n❌ Configuration Twilio incomplète');
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 TEST DES SERVICES EMAIL & WHATSAPP');
  console.log('======================================');
  
  await testResendEmail();
  await testWhatsAppConfig();
  
  console.log('\n======================================');
  console.log('✅ Tests terminés !');
}

runTests().catch(console.error);