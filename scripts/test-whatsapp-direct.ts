import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

async function testWhatsAppDirect() {
  console.log('🚀 Test direct de l\'API WhatsApp...\n');
  
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
  
  console.log('📱 Configuration détectée:');
  console.log('  - Phone Number ID:', PHONE_NUMBER_ID ? `✅ (${PHONE_NUMBER_ID})` : '❌');
  console.log('  - Access Token:', ACCESS_TOKEN ? `✅ (${ACCESS_TOKEN.substring(0, 20)}...)` : '❌');
  console.log('  - API Version:', API_VERSION);
  
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('\n❌ Configuration manquante ! Vérifiez .env.local');
    return;
  }
  
  const testMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: '33683717050', // Votre numéro sans le +
    type: 'text',
    text: {
      preview_url: false,
      body: `✨ Test LAIA SKIN Institut ✨\n\nCeci est un test de configuration WhatsApp.\n\nSi vous recevez ce message, tout fonctionne ! ✅\n\n*LAIA SKIN Institut* 💕`
    }
  };
  
  console.log('\n📨 Envoi du message à:', testMessage.to);
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      testMessage,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Message envoyé avec succès !');
    console.log('📱 Message ID:', response.data.messages?.[0]?.id);
    console.log('📊 Réponse complète:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('\n❌ Erreur lors de l\'envoi:');
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Erreur:', JSON.stringify(error.response.data, null, 2));
      
      // Détails spécifiques de l'erreur WhatsApp
      if (error.response.data?.error) {
        const err = error.response.data.error;
        console.error('\n📋 Détails de l\'erreur:');
        console.error('  - Message:', err.message);
        console.error('  - Type:', err.type);
        console.error('  - Code:', err.code);
        console.error('  - Subcode:', err.error_subcode);
        
        // Messages d'aide selon le code d'erreur
        if (err.code === 190) {
          console.error('\n💡 Solution: Le token d\'accès est invalide ou expiré.');
          console.error('   Vérifiez votre token dans Meta Business Suite.');
        } else if (err.code === 100) {
          console.error('\n💡 Solution: Paramètre invalide.');
          console.error('   Vérifiez le Phone Number ID ou le format du message.');
        } else if (err.code === 131009) {
          console.error('\n💡 Solution: Le numéro de destination n\'a pas WhatsApp Business.');
        } else if (err.code === 131031) {
          console.error('\n💡 Solution: Le destinataire n\'a pas accepté de recevoir des messages.');
          console.error('   Il doit d\'abord envoyer un message à votre numéro WhatsApp Business.');
        }
      }
    } else {
      console.error('  - Message:', error.message);
    }
  }
}

// Lancer le test
testWhatsAppDirect();