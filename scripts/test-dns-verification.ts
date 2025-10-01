import { Resend } from 'resend';
import * as dns from 'dns/promises';

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🔍 Vérification des enregistrements DNS pour laiaskininstitut.fr\n');
console.log('⏰ Heure actuelle:', new Date().toLocaleString('fr-FR'));
console.log('========================================\n');

async function checkDNS() {
  try {
    // Vérifier SPF
    console.log('📧 Vérification SPF (@):');
    try {
      const spfRecords = await dns.resolveTxt('laiaskininstitut.fr');
      const spf = spfRecords.flat().find(r => r.includes('v=spf1'));
      if (spf) {
        console.log('✅ SPF trouvé:', spf);
        console.log('   Contient amazonses.com:', spf.includes('amazonses.com') ? '✅' : '❌');
        console.log('   Contient _spf.resend.com:', spf.includes('_spf.resend.com') ? '✅' : '❌');
      } else {
        console.log('❌ SPF non trouvé');
      }
    } catch (e) {
      console.log('❌ Erreur SPF:', e.message);
    }

    console.log('\n📝 Vérification DKIM (resend._domainkey):');
    try {
      const dkimRecords = await dns.resolveTxt('resend._domainkey.laiaskininstitut.fr');
      const dkim = dkimRecords.flat().find(r => r.includes('p='));
      if (dkim) {
        console.log('✅ DKIM trouvé (début):', dkim.substring(0, 50) + '...');
        console.log('   Longueur:', dkim.length, 'caractères');
        console.log('   Se termine par "DAQAB":', dkim.endsWith('DAQAB') ? '✅' : '❌');
      } else {
        console.log('❌ DKIM non trouvé');
      }
    } catch (e) {
      console.log('❌ Erreur DKIM:', e.message);
    }

    console.log('\n🛡️ Vérification DMARC (_dmarc):');
    try {
      const dmarcRecords = await dns.resolveTxt('_dmarc.laiaskininstitut.fr');
      const dmarc = dmarcRecords.flat().find(r => r.includes('v=DMARC1'));
      if (dmarc) {
        console.log('✅ DMARC trouvé:', dmarc);
      } else {
        console.log('❌ DMARC non trouvé');
      }
    } catch (e) {
      console.log('❌ Erreur DMARC:', e.message);
    }

    console.log('\n========================================');
    console.log('📮 Test d\'envoi d\'email avec Resend...\n');
    
    const { data, error } = await resend.emails.send({
      from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: 'celia.ivorra95@hotmail.fr',
      subject: 'Test DNS Verification - ' + new Date().toLocaleTimeString('fr-FR'),
      html: `
        <h2>Test de vérification DNS</h2>
        <p>Email envoyé le ${new Date().toLocaleString('fr-FR')}</p>
        <p>Si vous recevez cet email, la configuration DNS fonctionne correctement !</p>
        <hr>
        <p><strong>From:</strong> contact@laiaskininstitut.fr</p>
        <p><strong>Provider:</strong> Resend avec domaine vérifié</p>
      `
    });

    if (error) {
      console.log('❌ Erreur:', error);
    } else {
      console.log('✅ Email envoyé avec succès !');
      console.log('   ID:', data?.id);
      console.log('   From: contact@laiaskininstitut.fr');
      console.log('\n📬 Vérifiez votre boîte mail !');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkDNS();