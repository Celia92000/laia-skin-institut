import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function listAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n========================================');
    console.log('📋 TOUS LES UTILISATEURS DU SYSTÈME');
    console.log('========================================\n');
    
    const admins = users.filter(u => u.role === 'admin');
    const clients = users.filter(u => u.role === 'client');
    
    if (admins.length > 0) {
      console.log('👑 ADMINISTRATEURS :');
      console.log('-------------------');
      admins.forEach(user => {
        console.log(`📧 ${user.email}`);
        console.log(`   Nom: ${user.name || 'Non défini'}`);
        console.log(`   Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
        if (user.email === 'celia.ivorra95@hotmail.fr') {
          console.log(`   💡 Mot de passe: Utilisez la fonction "Mot de passe oublié"`);
        } else if (user.email === 'admin@laiaskin.com') {
          console.log(`   💡 Mot de passe: admin123`);
        } else if (user.email === 'celia@laiaskin.com') {
          console.log(`   💡 Mot de passe: celia2024`);
        }
        console.log('');
      });
    }
    
    if (clients.length > 0) {
      console.log('👥 CLIENTS :');
      console.log('------------');
      clients.forEach(user => {
        console.log(`📧 ${user.email}`);
        console.log(`   Nom: ${user.name || 'Non défini'}`);
        console.log(`   Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
        if (user.email === 'marie.dupont@email.com') {
          console.log(`   💡 Mot de passe: ClientTest2024 (vient d'être réinitialisé)`);
        } else {
          console.log(`   💡 Mot de passe: Utilisez "npx tsx reset-client-password.ts ${user.email} NouveauMotDePasse"`);
        }
        console.log('');
      });
    }
    
    console.log('========================================');
    console.log(`Total: ${users.length} utilisateurs (${admins.length} admins, ${clients.length} clients)`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();