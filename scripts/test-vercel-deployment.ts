import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testVercelDeployment() {
  console.log('🚀 Test du déploiement Vercel\n');
  
  // Essayer plusieurs URLs possibles
  const possibleUrls = [
    'https://laia-skin-nextjs.vercel.app',
    'https://laia-skin.vercel.app',
    'https://laia-skin-nextjs-celia92000.vercel.app',
    'https://laia-skin-nextjs-celia92000s-projects.vercel.app'
  ];
  
  let workingUrl = '';
  
  // Tester quelle URL fonctionne
  console.log('🔍 Recherche de l\'URL de votre projet...\n');
  for (const url of possibleUrls) {
    try {
      console.log(`Test: ${url}`);
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok || response.status === 308) {
        workingUrl = url;
        console.log(`✅ Trouvé: ${url}\n`);
        break;
      }
    } catch (error) {
      // Continue
    }
  }
  
  if (!workingUrl) {
    console.log('❌ Impossible de trouver l\'URL du projet.');
    console.log('Vérifiez dans Vercel Dashboard → Votre projet → Domains\n');
    return;
  }
  
  // Tester les endpoints
  console.log('📋 Tests des endpoints:\n');
  
  // 1. Page d'accueil
  try {
    const response = await fetch(workingUrl);
    console.log(`1. Page d'accueil: ${response.ok ? '✅' : '❌'} (Status: ${response.status})`);
  } catch (error) {
    console.log('1. Page d\'accueil: ❌ Erreur');
  }
  
  // 2. Page admin
  try {
    const response = await fetch(`${workingUrl}/admin`);
    console.log(`2. Page admin: ${response.ok ? '✅' : '❌'} (Status: ${response.status})`);
  } catch (error) {
    console.log('2. Page admin: ❌ Erreur');
  }
  
  // 3. API Services
  try {
    const response = await fetch(`${workingUrl}/api/services`);
    console.log(`3. API Services: ${response.ok ? '✅' : '❌'} (Status: ${response.status})`);
  } catch (error) {
    console.log('3. API Services: ❌ Erreur');
  }
  
  console.log('\n📅 Test des CRON jobs (avec secret):\n');
  
  const secret = process.env.CRON_SECRET || 'laia_skin_cron_secret_2025';
  
  // Test CRON rappels WhatsApp
  try {
    const response = await fetch(`${workingUrl}/api/cron/send-whatsapp-reminders?secret=${secret}`);
    const data = await response.json();
    console.log('4. CRON Rappels WhatsApp:');
    if (data.success !== undefined) {
      console.log(`   ✅ Endpoint actif`);
      console.log(`   - ${data.message || 'Pas de message'}`);
      console.log(`   - Envoyés: ${data.sent || 0}`);
      console.log(`   - Total: ${data.total || 0}`);
    } else if (data.error) {
      console.log(`   ⚠️ Erreur: ${data.error}`);
    }
  } catch (error) {
    console.log('4. CRON Rappels WhatsApp: ❌ Erreur');
  }
  
  // Test CRON avis WhatsApp
  try {
    const response = await fetch(`${workingUrl}/api/cron/send-whatsapp-reviews?secret=${secret}`);
    const data = await response.json();
    console.log('\n5. CRON Avis WhatsApp:');
    if (data.success !== undefined) {
      console.log(`   ✅ Endpoint actif`);
      console.log(`   - ${data.message || 'Pas de message'}`);
      console.log(`   - Envoyés: ${data.sent || 0}`);
      console.log(`   - Total: ${data.total || 0}`);
    } else if (data.error) {
      console.log(`   ⚠️ Erreur: ${data.error}`);
    }
  } catch (error) {
    console.log('5. CRON Avis WhatsApp: ❌ Erreur');
  }
  
  // Test CRON anniversaires
  try {
    const response = await fetch(`${workingUrl}/api/cron/send-birthday-emails?secret=${secret}`);
    const data = await response.json();
    console.log('\n6. CRON Anniversaires:');
    if (data.success !== undefined) {
      console.log(`   ✅ Endpoint actif`);
      console.log(`   - ${data.message || 'Pas de message'}`);
      console.log(`   - Emails: ${data.emailsSent || 0}`);
      console.log(`   - WhatsApp: ${data.whatsappSent || 0}`);
      console.log(`   - Total: ${data.total || 0}`);
    } else if (data.error) {
      console.log(`   ⚠️ Erreur: ${data.error}`);
    }
  } catch (error) {
    console.log('6. CRON Anniversaires: ❌ Erreur');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Résumé:');
  console.log('='.repeat(50));
  console.log(`🌐 URL du site: ${workingUrl}`);
  console.log(`👤 Admin: ${workingUrl}/admin`);
  console.log(`📅 Les CRON jobs s'exécuteront automatiquement:`);
  console.log(`   - 9h00: Messages d'anniversaire`);
  console.log(`   - 10h00: Demandes d'avis`);
  console.log(`   - 18h00: Rappels RDV du lendemain`);
  console.log('\n💡 Pour voir les logs des CRON:');
  console.log('   Vercel Dashboard → Functions → Logs');
}

// Lancer le test
testVercelDeployment();