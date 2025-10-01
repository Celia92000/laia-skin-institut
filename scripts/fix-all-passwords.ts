import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAllPasswords() {
  try {
    console.log('🔧 Réparation de tous les mots de passe...\n');
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      let newPassword = '';
      
      // Déterminer le mot de passe à utiliser
      if (user.plainPassword) {
        newPassword = user.plainPassword;
      } else if (user.role === 'ADMIN' || user.role === 'admin') {
        newPassword = 'admin123';
      } else if (user.role === 'EMPLOYEE') {
        newPassword = 'password123';
      } else if (user.role === 'CLIENT' || user.role === 'client') {
        newPassword = 'client123';
      } else {
        newPassword = 'password123';
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          plainPassword: newPassword,
          role: user.role === 'admin' ? 'ADMIN' : user.role === 'client' ? 'CLIENT' : user.role
        }
      });
      
      console.log(`✅ ${user.email} - Mot de passe: ${newPassword} - Rôle: ${user.role}`);
    }
    
    console.log('\n=================================');
    console.log('✅ TOUS LES MOTS DE PASSE ONT ÉTÉ RÉPARÉS');
    console.log('=================================\n');
    
    // Afficher les comptes principaux
    console.log('📋 COMPTES PRINCIPAUX:\n');
    console.log('ADMIN:');
    console.log('  Email: admin@laiaskin.com');
    console.log('  Mot de passe: admin123\n');
    
    console.log('CLIENT (test):');
    console.log('  Email: marie.dupont@email.com');
    console.log('  Mot de passe: client123\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllPasswords();