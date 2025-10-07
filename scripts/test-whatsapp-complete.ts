import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sendWhatsAppMessage, whatsappTemplates } from '../src/lib/whatsapp-meta';

async function testAllWhatsAppFeatures() {
  console.log('🚀 Test complet des fonctionnalités WhatsApp...\n');
  
  const testPhone = '+33683717050'; // Votre numéro
  
  // Test 1: Message de confirmation de RDV
  console.log('📅 Test 1: Confirmation de réservation');
  try {
    const confirmationMessage = whatsappTemplates.reservationConfirmation({
      clientName: 'Célia',
      date: 'Mercredi 20 janvier 2025',
      time: '14h00',
      services: ["Hydro'Naissance", "LED Thérapie"],
      totalPrice: 150
    });
    
    const result1 = await sendWhatsAppMessage({
      to: testPhone,
      message: confirmationMessage
    });
    
    if (result1.success) {
      console.log('✅ Confirmation envoyée avec succès !');
      console.log('   Message ID:', result1.messageId);
    } else {
      console.log('❌ Échec:', result1.error);
    }
  } catch (error) {
    console.error('❌ Erreur confirmation:', error);
  }
  
  // Attendre 2 secondes entre les envois
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Rappel de RDV
  console.log('\n⏰ Test 2: Rappel de rendez-vous');
  try {
    const reminderMessage = whatsappTemplates.appointmentReminder({
      clientName: 'Célia',
      time: '14h00',
      services: ["Hydro'Naissance"]
    });
    
    const result2 = await sendWhatsAppMessage({
      to: testPhone,
      message: reminderMessage
    });
    
    if (result2.success) {
      console.log('✅ Rappel envoyé avec succès !');
      console.log('   Message ID:', result2.messageId);
    } else {
      console.log('❌ Échec:', result2.error);
    }
  } catch (error) {
    console.error('❌ Erreur rappel:', error);
  }
  
  // Attendre 2 secondes
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Demande d'avis (nouveau)
  console.log('\n⭐ Test 3: Demande d\'avis après soin');
  try {
    const reviewMessage = `✨ *LAIA SKIN Institut* ✨

Bonjour Célia ! 💕

J'espère que vous avez apprécié votre soin *Hydro'Naissance* d'il y a 3 jours.

⭐ *Votre avis est précieux !*
Pourriez-vous prendre quelques secondes pour partager votre expérience ?

👉 Cliquez ici : https://laiaskin.fr/avis?id=test123

🎁 *Programme de fidélité*
Vous avez 2 séances sur 5
Plus que 3 séances pour obtenir -30€ !

Merci infiniment ! 🙏
*LAIA SKIN Institut*`;
    
    const result3 = await sendWhatsAppMessage({
      to: testPhone,
      message: reviewMessage
    });
    
    if (result3.success) {
      console.log('✅ Demande d\'avis envoyée avec succès !');
      console.log('   Message ID:', result3.messageId);
    } else {
      console.log('❌ Échec:', result3.error);
    }
  } catch (error) {
    console.error('❌ Erreur avis:', error);
  }
  
  console.log('\n📊 Test terminé !');
  console.log('Les messages WhatsApp devraient arriver sur votre téléphone.');
}

// Lancer les tests
testAllWhatsAppFeatures();