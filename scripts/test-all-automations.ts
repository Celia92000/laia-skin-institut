import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const VERCEL_URL = 'https://laia-skin-institut-as92.vercel.app';
const SECRET = process.env.CRON_SECRET || 'laia_skin_cron_secret_2025';

async function testAutomation(name: string, endpoint: string) {
  console.log(`\n📋 Test: ${name}`);
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${VERCEL_URL}${endpoint}?secret=${SECRET}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Endpoint accessible');
      
      if (data.success) {
        console.log('✅ Exécution réussie');
        
        // Afficher les détails selon le type
        if (data.sent !== undefined) {
          console.log(`📨 Messages envoyés: ${data.sent}`);
        }
        if (data.emailsSent !== undefined) {
          console.log(`📧 Emails envoyés: ${data.emailsSent}`);
        }
        if (data.whatsappSent !== undefined) {
          console.log(`📱 WhatsApp envoyés: ${data.whatsappSent}`);
        }
        if (data.total !== undefined) {
          console.log(`📊 Total traités: ${data.total}`);
        }
        if (data.message) {
          console.log(`💬 Message: ${data.message}`);
        }
      } else if (data.error) {
        console.log(`⚠️ Erreur: ${data.error}`);
      }
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
      if (data.error) {
        console.log(`   ${data.error}`);
      }
    }
  } catch (error: any) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
  }
}

async function testAllAutomations() {
  console.log('🤖 TEST COMPLET DES AUTOMATISATIONS');
  console.log('═'.repeat(50));
  console.log(`📍 URL: ${VERCEL_URL}`);
  console.log(`🔐 Secret: ${SECRET.substring(0, 10)}...`);
  
  // Test de chaque automatisation
  await testAutomation(
    '1️⃣ Rappels WhatsApp (24h avant)',
    '/api/cron/send-whatsapp-reminders'
  );
  
  await testAutomation(
    '2️⃣ Demandes d\'avis Email',
    '/api/cron/send-review-requests'
  );
  
  await testAutomation(
    '3️⃣ Demandes d\'avis WhatsApp',
    '/api/cron/send-whatsapp-reviews'
  );
  
  await testAutomation(
    '4️⃣ Messages d\'anniversaire',
    '/api/cron/send-birthday-emails'
  );
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═'.repeat(50));
  
  console.log(`
✅ Automatisations configurées:
  • Rappels WhatsApp J-1 à 18h
  • Avis Email + WhatsApp J+3 à 10h
  • Anniversaires Email + WhatsApp à 9h
  
📅 Prochaines exécutions automatiques:
  • 09h00 : Anniversaires
  • 10h00 : Demandes d'avis
  • 18h00 : Rappels RDV

🔍 Pour voir les logs en temps réel:
  • GitHub: https://github.com/Celia92000/laia-skin-nextjs/actions
  • Vercel: Dashboard → Functions → Logs
  `);
}

// Test de connexion simple
async function quickTest() {
  console.log('\n🔌 Test rapide de connexion...');
  try {
    const response = await fetch(VERCEL_URL);
    if (response.ok) {
      console.log('✅ Site accessible');
    } else {
      console.log(`❌ Site inaccessible (HTTP ${response.status})`);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion au site');
  }
}

// Lancer les tests
quickTest().then(() => testAllAutomations());