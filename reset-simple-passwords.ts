import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetSimplePasswords() {
  console.log('🔐 Réinitialisation des mots de passe simples pour les tests\n');
  
  const users = [
    { email: 'admin@laiaskin.com', password: 'admin123', name: 'Admin' },
    { email: 'marie.dupont@email.com', password: 'client123', name: 'Marie Dupont' }
  ];
  
  for (const userData of users) {
    try {
      // Hash du mot de passe (10 rounds, compatible avec l'ancien système)
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Mettre à jour ou créer l'utilisateur
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: { password: hashedPassword },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.email.includes('admin') ? 'ADMIN' : 'CLIENT'
        }
      });
      
      console.log(`✅ ${user.role} : ${userData.email} / ${userData.password}`);
      
    } catch (error) {
      console.error(`❌ Erreur pour ${userData.email}:`, error);
    }
  }
  
  console.log('\n📝 Instructions :');
  console.log('1. Ouvrez : http://localhost:3001/test-connexion.html');
  console.log('2. Cliquez sur les boutons de test');
  console.log('3. Une fois connecté, accédez à /admin ou /espace-client');
  
  await prisma.$disconnect();
}

resetSimplePasswords().catch(console.error);