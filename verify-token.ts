import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function verifyToken() {
  const token = '88112e335da436677c0437bdae2c5e29a28560ab96e09583b50dd87f321b09f4';
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });
    
    if (user) {
      console.log('✅ TOKEN VALIDE ET PRÊT À UTILISER !');
      console.log('Email:', user.email);
      console.log('Expire à:', user.resetTokenExpiry?.toLocaleTimeString('fr-FR'));
      console.log('\n👉 UTILISEZ CE LIEN MAINTENANT :');
      console.log('http://localhost:3001/reset-password?token=' + token);
    } else {
      console.log('❌ Token invalide ou expiré');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyToken();