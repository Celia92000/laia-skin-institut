import { sendPasswordResetEmail } from '../src/lib/email-service';

// Charger les variables d'environnement
process.env.RESEND_API_KEY = 're_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR';
process.env.NEXT_PUBLIC_APP_URL = 'https://laia-skin-institut-as92.vercel.app';

async function testEmail() {
  console.log('🚀 Test d\'envoi d\'email avec Resend...\n');
  
  const result = await sendPasswordResetEmail({
    email: 'celia.ivorra95@hotmail.fr',
    name: 'Célia',
    resetToken: 'test-token-' + Date.now()
  });
  
  if (result.success) {
    if (result.simulated) {
      console.log('⚠️  Email simulé (mode développement)');
    } else {
      console.log('✅ Email envoyé avec succès !');
      console.log('📧 Vérifiez votre boîte de réception : celia.ivorra95@hotmail.fr');
      console.log('📌 Vérifiez aussi les spams si vous ne le voyez pas.');
    }
  } else {
    console.log('❌ Erreur lors de l\'envoi:', result.error);
  }
}

testEmail().catch(console.error);