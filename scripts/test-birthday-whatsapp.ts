import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sendWhatsAppMessage } from '../src/lib/whatsapp-meta';

async function testBirthdayWhatsApp() {
  console.log('🎂 Test des messages d\'anniversaire WhatsApp...\n');
  
  const testPhone = '+33683717050'; // Votre numéro
  const testName = 'Célia';
  const currentMonth = new Date().getMonth();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentMonthCode = monthNames[currentMonth];
  
  // Message d'anniversaire WhatsApp
  const birthdayMessage = `🎂 *Joyeux Anniversaire ${testName}!* 🎉

Toute l'équipe de LAIA SKIN vous souhaite une merveilleuse journée !

🎁 *Votre cadeau :*
**-30% SUR TOUS LES SOINS**

📱 Code promo : *${currentMonthCode}2025*
_Valable tout le mois_

Réservez dès maintenant :
👉 https://laiaskin.fr/reservation
👉 Ou répondez à ce message

Avec toute notre affection,
*LAIA SKIN Institut* 💕`;

  console.log('📨 Envoi du message d\'anniversaire WhatsApp...');
  console.log('📞 Destinataire:', testPhone);
  console.log('🎁 Code promo du mois:', currentMonthCode + '2025');
  
  try {
    const result = await sendWhatsAppMessage({
      to: testPhone,
      message: birthdayMessage
    });
    
    if (result.success) {
      console.log('\n✅ Message d\'anniversaire WhatsApp envoyé avec succès !');
      console.log('📱 Message ID:', result.messageId);
    } else {
      console.log('\n❌ Échec de l\'envoi:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  }
  
  console.log('\n📊 Test terminé !');
}

// Test du CRON job complet
async function testBirthdayCron() {
  console.log('\n🔄 Test du CRON job anniversaire complet...\n');
  
  const baseUrl = 'http://localhost:3000';
  const secret = process.env.CRON_SECRET || 'laia_skin_cron_secret_2025';
  
  try {
    const response = await fetch(`${baseUrl}/api/cron/send-birthday-emails?secret=${secret}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ CRON job anniversaire exécuté');
      console.log(`   - Emails envoyés: ${data.emailsSent || 0}`);
      console.log(`   - WhatsApp envoyés: ${data.whatsappSent || 0}`);
      console.log(`   - Total clients anniversaire: ${data.total || 0}`);
    } else {
      console.log('❌ Erreur CRON:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur appel CRON:', error);
  }
}

// Lancer le test direct
testBirthdayWhatsApp().then(() => {
  // Puis tester le CRON
  return testBirthdayCron();
});