import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function createFreshToken() {
  try {
    const email = 'celia.ivorra95@hotmail.fr';
    
    // Vérifier que l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!userExists) {
      console.log('❌ Utilisateur non trouvé. Création...');
      await prisma.user.create({
        data: {
          email,
          password: '$2a$10$dummy', // Sera remplacé
          name: 'Célia IVORRA',
          role: 'admin'
        }
      });
    }
    
    // Générer un nouveau token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure
    
    // Mettre à jour l'utilisateur avec le nouveau token
    const user = await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });
    
    console.log('\n========================================');
    console.log('✅ NOUVEAU TOKEN CRÉÉ !');
    console.log('========================================\n');
    console.log('📧 Email:', email);
    console.log('🔑 Token valide pendant 1 heure\n');
    console.log('👉 Cliquez sur ce lien pour réinitialiser votre mot de passe :');
    console.log('\nhttp://localhost:3001/reset-password?token=' + resetToken);
    console.log('\n========================================');
    console.log('📝 Instructions :');
    console.log('1. Cliquez sur le lien ci-dessus');
    console.log('2. Entrez votre nouveau mot de passe');
    console.log('3. Confirmez le mot de passe');
    console.log('4. Cliquez sur "Réinitialiser mon mot de passe"');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFreshToken();