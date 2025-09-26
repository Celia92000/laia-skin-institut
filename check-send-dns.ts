import * as dns from 'dns/promises';

console.log('🔍 Vérification des enregistrements "send" pour laiaskininstitut.fr\n');

async function checkSendDNS() {
  try {
    // Vérifier send TXT
    console.log('📧 Vérification TXT pour "send":');
    try {
      const txtRecords = await dns.resolveTxt('send.laiaskininstitut.fr');
      const spf = txtRecords.flat().find(r => r.includes('v=spf1'));
      if (spf) {
        console.log('✅ SPF trouvé:', spf);
      } else {
        console.log('❌ SPF non trouvé dans les enregistrements TXT');
      }
    } catch (e) {
      console.log('❌ Erreur TXT:', e.message);
    }

    // Vérifier send MX
    console.log('\n📮 Vérification MX pour "send":');
    try {
      const mxRecords = await dns.resolveMx('send.laiaskininstitut.fr');
      if (mxRecords.length > 0) {
        mxRecords.forEach(mx => {
          console.log(`✅ MX trouvé: ${mx.exchange} (priorité: ${mx.priority})`);
          if (mx.exchange.includes('amazonses.com')) {
            console.log('   ✅ Pointe vers Amazon SES');
          }
        });
      } else {
        console.log('❌ Aucun enregistrement MX trouvé');
      }
    } catch (e) {
      console.log('❌ Erreur MX:', e.message);
    }

    console.log('\n✨ Récapitulatif:');
    console.log('- Les DNS sont configurés chez Gandi');
    console.log('- Il faut maintenant cliquer sur "Restart verification" dans Resend');
    console.log('- URL: https://resend.com/domains');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkSendDNS();