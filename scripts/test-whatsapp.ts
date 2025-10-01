// Script de test WhatsApp en mode direct (génère des liens)
import { sendWhatsAppMessage } from './src/lib/whatsapp';

async function testWhatsApp() {
  console.log('🎯 Test du système WhatsApp\n');
  console.log('Mode actuel: DIRECT (génère des liens wa.me)\n');
  
  const testNumber = '+33612345678'; // Remplacez par votre numéro
  
  console.log('📱 Test 1: Message simple');
  const result1 = await sendWhatsAppMessage({
    to: testNumber,
    message: 'Bonjour ! Ceci est un test de LAIA SKIN Institut 💕'
  }, 'direct');
  
  if (result1) {
    console.log('✅ Lien WhatsApp généré avec succès');
    const cleanNumber = testNumber.replace('+', '');
    const encodedMsg = encodeURIComponent('Bonjour ! Ceci est un test de LAIA SKIN Institut 💕');
    console.log(`📲 Ouvrez ce lien: https://wa.me/${cleanNumber}?text=${encodedMsg}`);
  }
  
  console.log('\n📱 Test 2: Message de confirmation RDV');
  const confirmationMessage = `✨ LAIA SKIN Institut ✨

Votre réservation est confirmée !

📅 Date : 25 septembre 2024
⏰ Heure : 14h00
💆‍♀️ Service : Soin Hydratant Intense
💰 Total : 75€

À très bientôt ! 💕`;
  
  const result2 = await sendWhatsAppMessage({
    to: testNumber,
    message: confirmationMessage
  }, 'direct');
  
  if (result2) {
    console.log('✅ Message de confirmation prêt');
    const cleanNumber = testNumber.replace('+', '');
    const encodedMsg = encodeURIComponent(confirmationMessage).substring(0, 100);
    console.log(`📲 Lien: https://wa.me/${cleanNumber}?text=${encodedMsg}...`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 PROCHAINES ÉTAPES POUR ACTIVER WHATSAPP:');
  console.log('='.repeat(60));
  console.log('\n1️⃣  OPTION SIMPLE (Twilio):');
  console.log('   • Créez un compte sur twilio.com');
  console.log('   • Activez le WhatsApp Sandbox');
  console.log('   • Copiez vos identifiants dans .env.local');
  console.log('   • Changez WHATSAPP_PROVIDER="twilio"');
  
  console.log('\n2️⃣  OPTION PRO (Meta Business):');
  console.log('   • Créez une app sur developers.facebook.com');
  console.log('   • Configurez WhatsApp Business');
  console.log('   • Obtenez votre Access Token');
  console.log('   • Changez WHATSAPP_PROVIDER="meta"');
  
  console.log('\n📖 Guide complet: CONFIGURATION_WHATSAPP.md');
  console.log('='.repeat(60));
}

// Remplacez le numéro par le vôtre pour tester
console.log('⚠️  Remplacez +33612345678 par votre numéro dans le fichier !');
console.log('');
testWhatsApp();
