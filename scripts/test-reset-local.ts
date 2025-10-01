import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createResetTokenForCelia() {
  try {
    const email = 'celia.ivorra95@hotmail.fr';
    
    // Générer un token
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
    
    console.log('\n✅ Token de réinitialisation créé !');
    console.log('=====================================\n');
    console.log('📧 Pour tester localement, utilisez ce lien :');
    console.log(`http://localhost:3001/reset-password?token=${resetToken}`);
    console.log('\n🌐 Pour Vercel (quand déployé) :');
    console.log(`https://laia-skin-institut-as92.vercel.app/reset-password?token=${resetToken}`);
    console.log('\n⏰ Ce lien expire dans 1 heure');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createResetTokenForCelia();