import { Resend } from 'resend';

const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

async function sendTestEmail() {
  console.log('📧 Test d\'envoi d\'email...\n');
  
  const emails = [
    // Email simple
    {
      from: 'contact@laiaskininstitut.fr',
      to: 'celia.ivorra95@hotmail.fr',
      subject: 'Test Simple - ' + new Date().toLocaleTimeString('fr-FR'),
      text: 'Ceci est un email de test simple envoyé depuis votre domaine vérifié laiaskininstitut.fr'
    },
    // Email HTML
    {
      from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: 'celia.ivorra95@hotmail.fr',
      subject: 'Test avec HTML - ' + new Date().toLocaleTimeString('fr-FR'),
      html: '<h1>Test Email</h1><p>Votre domaine est vérifié!</p><p>Envoyé le: ' + new Date().toLocaleString('fr-FR') + '</p>'
    }
  ];

  for (let i = 0; i < emails.length; i++) {
    console.log(`\nEnvoi email ${i + 1}/2...`);
    
    const { data, error } = await resend.emails.send(emails[i]);
    
    if (error) {
      console.log('❌ Erreur:', error);
    } else {
      console.log('✅ Email envoyé!');
      console.log('   ID:', data?.id);
      console.log('   De:', emails[i].from);
      console.log('   À:', emails[i].to);
      console.log('   Sujet:', emails[i].subject);
    }
  }
  
  console.log('\n📌 IMPORTANT - Vérifiez:');
  console.log('1. ✉️  Boîte de réception');
  console.log('2. 📁 Dossier SPAM/Indésirables');
  console.log('3. 📑 Onglet Promotions (Gmail)');
  console.log('4. ⏰ Attendez 2-3 minutes');
  console.log('\nSi toujours rien, dites-le moi et on testera avec une autre adresse email.');
}

sendTestEmail();