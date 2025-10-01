import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function resetCeliaPassword() {
  try {
    const email = 'celia.ivorra95@hotmail.fr';
    const newPassword = 'Laia2024!';
    
    console.log(`\n🔐 Réinitialisation du mot de passe pour ${email}...\n`);
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`❌ Aucun compte trouvé avec l'email ${email}`);
      console.log(`\nCréation d'un nouveau compte...`);
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Célia IVORRA',
          role: 'admin', // Je vous donne les droits admin
          phone: '0600000000'
        }
      });
      
      console.log(`✅ Compte créé avec succès!`);
    } else {
      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          role: 'admin' // S'assurer que vous avez les droits admin
        }
      });
      
      console.log(`✅ Mot de passe réinitialisé avec succès!`);
    }
    
    console.log(`\n========================================`);
    console.log(`📧 VOTRE COMPTE EST PRÊT !`);
    console.log(`========================================`);
    console.log(`Email: ${email}`);
    console.log(`Nouveau mot de passe: ${newPassword}`);
    console.log(`Rôle: Administrateur`);
    console.log(`========================================\n`);
    console.log(`🌐 Vous pouvez maintenant vous connecter sur:`);
    console.log(`   https://laia-skin-institut.vercel.app/login`);
    console.log(`   ou`);
    console.log(`   http://localhost:3001/login`);
    console.log(`========================================\n`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCeliaPassword();