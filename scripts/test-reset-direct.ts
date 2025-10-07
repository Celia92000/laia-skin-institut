import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../src/lib/email-service';

const prisma = new PrismaClient();

async function testDirectReset() {
  console.log('🔄 Test direct du système de récupération...');
  
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: 'contact@laiaskininstitut.fr' }
    });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', user.email, user.name);
    
    // 2. Générer un token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    
    console.log('🔑 Token généré (non hashé):', resetToken);
    
    // 3. Sauvegarder le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry
      }
    });
    
    console.log('💾 Token sauvegardé en base');
    
    // 4. Tester l'envoi d'email
    console.log('📧 Test d\'envoi d\'email...');
    const result = await sendPasswordResetEmail({
      email: user.email,
      name: user.name || 'Cliente',
      resetToken
    });
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès!');
      if (result.simulated) {
        console.log('⚠️ Mode simulation (configurez RESEND_API_KEY)');
      }
    } else {
      console.log('❌ Erreur envoi email:', result.error);
    }
    
    // 5. URL de réinitialisation
    console.log('\n🔗 URL de réinitialisation:');
    console.log(`http://localhost:3001/reset-password?token=${resetToken}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectReset();