import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkAndCreateUsers() {
  try {
    console.log('📊 Vérification des utilisateurs...\n');
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Création des utilisateurs par défaut...\n');
      
      // Créer un admin
      const adminPassword = 'admin123';
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@laiaskin.com',
          password: hashedAdminPassword,
          name: 'Administrateur',
          role: 'admin'
        }
      });
      
      console.log('✅ Admin créé:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Mot de passe: ${adminPassword}`);
      console.log('');
      
      // Créer Celia (propriétaire)
      const celiaPassword = 'celia2024';
      const hashedCeliaPassword = await bcrypt.hash(celiaPassword, 10);
      
      const celia = await prisma.user.create({
        data: {
          email: 'celia@laiaskin.com',
          password: hashedCeliaPassword,
          name: 'Célia',
          role: 'admin',
          phone: '0123456789'
        }
      });
      
      console.log('✅ Compte propriétaire créé:');
      console.log(`   Email: ${celia.email}`);
      console.log(`   Mot de passe: ${celiaPassword}`);
      console.log('');
      
    } else {
      console.log('👥 Utilisateurs existants:\n');
      users.forEach(user => {
        console.log(`📧 ${user.email}`);
        console.log(`   Nom: ${user.name || 'Non défini'}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
        console.log('');
      });
      
      // Créer ou mettre à jour le compte Celia si pas présent
      const celiaExists = users.some(u => u.email === 'celia@laiaskin.com');
      if (!celiaExists) {
        const celiaPassword = 'celia2024';
        const hashedCeliaPassword = await bcrypt.hash(celiaPassword, 10);
        
        const celia = await prisma.user.create({
          data: {
            email: 'celia@laiaskin.com',
            password: hashedCeliaPassword,
            name: 'Célia',
            role: 'admin',
            phone: '0123456789'
          }
        });
        
        console.log('✅ Compte propriétaire créé:');
        console.log(`   Email: ${celia.email}`);
        console.log(`   Mot de passe: ${celiaPassword}`);
      } else {
        console.log('ℹ️  Pour vous connecter, utilisez:');
        console.log('   Email: celia@laiaskin.com');
        console.log('   Mot de passe: celia2024');
        console.log('   (Si ce mot de passe ne fonctionne pas, utilisez la fonction "Mot de passe oublié")');
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUsers();