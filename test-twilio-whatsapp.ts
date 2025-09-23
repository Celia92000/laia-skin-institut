// Test d'envoi WhatsApp avec Twilio
import { sendWhatsAppMessage } from './src/lib/whatsapp';

// IMPORTANT: Mettez votre Auth Token dans .env.local d'abord !
process.env.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "ACxxxxxxxxxxxxxxxxxxxxxxxxxx";
process.env.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "METTEZ_VOTRE_AUTH_TOKEN_ICI";
process.env.TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886";
process.env.WHATSAPP_PROVIDER = "twilio";

async function testTwilioWhatsApp() {
  console.log('🚀 Test WhatsApp avec Twilio Sandbox\n');
  
  // CHANGEZ CE NUMÉRO par le vôtre !
  const votreNumero = '+33683717050';  // Votre numéro WhatsApp
  
  console.log('📱 Envoi vers:', votreNumero);
  console.log('⚠️  Assurez-vous d\'avoir envoyé "join fix-alone" depuis ce numéro\n');
  
  try {
    // Test 1: Message simple
    console.log('Test 1: Message de bienvenue...');
    const result1 = await sendWhatsAppMessage({
      to: votreNumero,
      message: `✨ LAIA SKIN Institut ✨

Félicitations ! WhatsApp est maintenant configuré ! 🎉

Vous pouvez maintenant :
✅ Envoyer des rappels de RDV
✅ Confirmer les réservations
✅ Envoyer des promotions
✅ Messages d'anniversaire

Tapez STOP pour vous désinscrire.`
    }, 'twilio');
    
    if (result1) {
      console.log('✅ Message envoyé avec succès !');
    } else {
      console.log('❌ Échec de l\'envoi');
    }
    
    // Attendre 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Confirmation de RDV
    console.log('\nTest 2: Confirmation de réservation...');
    const result2 = await sendWhatsAppMessage({
      to: votreNumero,
      message: `📅 Confirmation de réservation

Bonjour !

Votre RDV est confirmé :
📆 Date : 25 septembre 2024
⏰ Heure : 14h00
💆 Service : Soin Hydratant Intense
💰 Total : 75€

📍 LAIA SKIN Institut
123 Rue de la Beauté, Paris

À très bientôt ! 💕`
    }, 'twilio');
    
    if (result2) {
      console.log('✅ Confirmation envoyée !');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎊 SUCCÈS ! WhatsApp fonctionne !');
    console.log('='.repeat(50));
    console.log('\n📱 Vérifiez votre WhatsApp');
    console.log('📊 Dans l\'interface admin, vous pouvez maintenant :');
    console.log('   • Envoyer des messages depuis l\'onglet WhatsApp');
    console.log('   • Créer des campagnes');
    console.log('   • Configurer les automatisations');
    
  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    console.log('\n🔧 Vérifiez :');
    console.log('1. Que vous avez mis votre Auth Token dans .env.local');
    console.log('2. Que vous avez envoyé "join fix-alone" depuis votre WhatsApp');
    console.log('3. Que la connexion sandbox est active (72h)');
  }
}

// Vérification avant le test
if (process.env.TWILIO_AUTH_TOKEN === "METTEZ_VOTRE_AUTH_TOKEN_ICI") {
  console.log('⚠️  ATTENTION: Mettez d\'abord votre Auth Token !');
  console.log('1. Ouvrez .env.local');
  console.log('2. Remplacez VOTRE_AUTH_TOKEN_ICI par votre vrai token');
  console.log('3. Relancez ce script');
} else {
  testTwilioWhatsApp();
}