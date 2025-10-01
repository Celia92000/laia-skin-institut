import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function resetClientPassword(email: string, newPassword: string) {
  try {
    console.log(`\n📧 Réinitialisation pour : ${email}\n`);
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`❌ Aucun compte trouvé avec l'email ${email}`);
      return;
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    console.log('========================================');
    console.log('✅ MOT DE PASSE RÉINITIALISÉ !');
    console.log('========================================\n');
    console.log('📧 Email:', email);
    console.log('🔑 Nouveau mot de passe:', newPassword);
    console.log('\n👉 Connexion sur :');
    console.log('Local: http://localhost:3001/login');
    console.log('Vercel: https://laia-skin-institut-as92.vercel.app/login');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments de la ligne de commande
const email = process.argv[2];
const password = process.argv[3] || 'Client2024!';

if (!email) {
  console.log('Usage: npx tsx reset-client-password.ts <email> [password]');
  console.log('Exemple: npx tsx reset-client-password.ts marie.dupont@email.com MonNouveauMotDePasse');
  process.exit(1);
}

resetClientPassword(email, password);