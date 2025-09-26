import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Rechercher Célia
    const celiaSearch = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'celia', mode: 'insensitive' } },
          { name: { contains: 'célia', mode: 'insensitive' } },
          { email: { contains: 'celia', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log('🔍 Recherche de Célia:');
    if (celiaSearch.length > 0) {
      celiaSearch.forEach(user => {
        console.log('  ✅ Trouvé:', user.name, '|', user.email, '| Role:', user.role);
      });
    } else {
      console.log('  ❌ Aucun utilisateur Célia trouvé');
    }
    
    // Lister tous les utilisateurs
    console.log('\n📋 Tous les utilisateurs dans la base:');
    const allUsers = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true }
    });
    
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} | ${user.email} | ${user.role}`);
    });
    
    console.log('\n📊 Total:', allUsers.length, 'utilisateurs');
    
    // Créer Célia si elle n'existe pas
    if (celiaSearch.length === 0) {
      console.log('\n➕ Création de Célia comme cliente...');
      const newCelia = await prisma.user.create({
        data: {
          name: 'Célia Ivorra',
          email: 'celia.ivorra95@hotmail.fr',
          password: '$2a$10$YourHashedPasswordHere', // À remplacer par un vrai hash
          role: 'client',
          phone: '06 00 00 00 00',
          loyaltyPoints: 100
        }
      });
      console.log('  ✅ Célia créée avec ID:', newCelia.id);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();