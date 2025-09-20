import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from './src/lib/email-service';

// Configuration directe pour éviter les problèmes
process.env.RESEND_API_KEY = 're_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function sendNewResetEmail() {
  try {
    const email = 'celia.ivorra95@hotmail.fr';
    
    // Générer un nouveau token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure
    
    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });
    
    console.log('📧 Envoi de l\'email de réinitialisation...\n');
    
    // Envoyer l'email
    const result = await sendPasswordResetEmail({
      email,
      name: user.name || 'Cliente',
      resetToken
    });
    
    if (result.success) {
      console.log('========================================');
      console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
      console.log('========================================\n');
      console.log('📧 Vérifiez votre boîte : celia.ivorra95@hotmail.fr');
      console.log('📌 Vérifiez aussi les spams');
      console.log('\n🔗 Le lien dans l\'email pointera vers :');
      console.log('http://localhost:3001/reset-password?token=' + resetToken);
      console.log('\n⚠️  IMPORTANT : Assurez-vous que le serveur local tourne sur le port 3001');
      console.log('========================================\n');
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sendNewResetEmail();