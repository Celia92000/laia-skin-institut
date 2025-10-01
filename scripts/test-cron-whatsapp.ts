import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCronJobs() {
  console.log('🚀 Test des CRON Jobs WhatsApp\n');
  
  const baseUrl = 'http://localhost:3000';
  const secret = process.env.CRON_SECRET || 'laia_skin_cron_secret_2025';
  
  // Test 1: Rappel WhatsApp 24h avant
  console.log('📅 Test 1: Rappel WhatsApp (24h avant)');
  try {
    const response1 = await fetch(`${baseUrl}/api/cron/send-whatsapp-reminders?secret=${secret}`);
    const data1 = await response1.json();
    
    if (data1.success) {
      console.log(`✅ ${data1.message}`);
      console.log(`   - Envoyés: ${data1.sent}`);
      console.log(`   - Erreurs: ${data1.errors}`);
      console.log(`   - Total: ${data1.total}`);
    } else {
      console.log('❌ Erreur:', data1.error);
    }
  } catch (error) {
    console.error('❌ Erreur rappel:', error);
  }
  
  console.log('\n⭐ Test 2: Demande d\'avis WhatsApp (3 jours après)');
  try {
    const response2 = await fetch(`${baseUrl}/api/cron/send-whatsapp-reviews?secret=${secret}`);
    const data2 = await response2.json();
    
    if (data2.success) {
      console.log(`✅ ${data2.message}`);
      console.log(`   - Envoyés: ${data2.sent}`);
      console.log(`   - Erreurs: ${data2.errors}`);
      console.log(`   - Total: ${data2.total}`);
    } else {
      console.log('❌ Erreur:', data2.error);
    }
  } catch (error) {
    console.error('❌ Erreur avis:', error);
  }
  
  console.log('\n📧 Test 3: Demande d\'avis Email (3 jours après)');
  try {
    const response3 = await fetch(`${baseUrl}/api/cron/send-review-requests?secret=${secret}`);
    const data3 = await response3.json();
    
    if (data3.success) {
      console.log(`✅ ${data3.message}`);
      console.log(`   - Total: ${data3.total}`);
    } else {
      console.log('❌ Erreur:', data3.error);
    }
  } catch (error) {
    console.error('❌ Erreur email avis:', error);
  }
  
  console.log('\n📊 Tests terminés !');
}

// Test manuel d'envoi pour une réservation spécifique
async function testManualSend(reservationId: string) {
  console.log('\n📨 Test d\'envoi manuel pour réservation:', reservationId);
  
  const baseUrl = 'http://localhost:3000';
  
  // Test rappel WhatsApp manuel
  console.log('  - Envoi rappel WhatsApp...');
  try {
    const response = await fetch(`${baseUrl}/api/cron/send-whatsapp-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reservationId })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('  ✅ Rappel envoyé:', data.messageId);
    } else {
      console.log('  ❌ Erreur:', data.error);
    }
  } catch (error) {
    console.error('  ❌ Erreur:', error);
  }
  
  // Test avis WhatsApp manuel
  console.log('  - Envoi demande d\'avis WhatsApp...');
  try {
    const response = await fetch(`${baseUrl}/api/cron/send-whatsapp-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reservationId })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('  ✅ Avis envoyé:', data.messageId);
    } else {
      console.log('  ❌ Erreur:', data.error);
    }
  } catch (error) {
    console.error('  ❌ Erreur:', error);
  }
}

// Lancer les tests
testCronJobs().then(() => {
  // Si vous avez un ID de réservation spécifique à tester
  // testManualSend('cm7esempio123');
});