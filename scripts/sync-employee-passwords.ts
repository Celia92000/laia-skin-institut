// Script pour synchroniser les mots de passe des employés
import prisma from '../src/lib/prisma';

async function syncEmployeePasswords() {
  console.log('🔐 Synchronisation des mots de passe des employés...\n');

  // Définir les mots de passe par défaut pour les employés et admins
  const defaultPasswords: { [key: string]: string } = {
    'contact@laiaskininstitut.fr': 'admin123',
    'admin@laiaskininstitut.fr': 'admin123',
    'celia@laiaskin.com': 'admin123',
    'celia@laiaskin.fr': 'admin123',
    'employee1@laiaskininstitut.fr': 'employee123',
    'employee2@laiaskininstitut.fr': 'employee123',
    'marie.martin@laiaskininstitut.fr': 'employee123',
    'pierre.bernard@laiaskininstitut.fr': 'employee123',
    'lucie.petit@laiaskininstitut.fr': 'employee123',
    'thomas.roussel@laiaskininstitut.fr': 'employee123',
    'celia.ivorra95@hotmail.fr': 'admin123' // Compte admin supplémentaire
  };

  // Récupérer tous les employés et admins
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'EMPLOYEE' },
        { role: 'ADMIN' },
        { role: 'admin' },
        { role: 'employee' }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plainPassword: true
    }
  });

  console.log(`📋 ${users.length} employés/admins trouvés\n`);

  // Mettre à jour chaque utilisateur
  for (const user of users) {
    const password = defaultPasswords[user.email] || 'password123';
    
    if (!user.plainPassword) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plainPassword: password }
      });
      
      console.log(`✅ ${user.email} (${user.role}) - Mot de passe synchronisé: ${password}`);
    } else {
      console.log(`⏩ ${user.email} (${user.role}) - Mot de passe déjà synchronisé: ${user.plainPassword}`);
    }
  }

  console.log('\n✨ Synchronisation terminée !');
  
  // Afficher un récapitulatif
  const updatedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'EMPLOYEE' },
        { role: 'ADMIN' },
        { role: 'admin' },
        { role: 'employee' }
      ],
      plainPassword: { not: null }
    },
    select: {
      email: true,
      role: true,
      plainPassword: true
    }
  });

  console.log('\n📊 Récapitulatif des accès:');
  console.log('================================');
  updatedUsers.forEach(user => {
    console.log(`${user.email.padEnd(40)} | ${user.role.padEnd(10)} | ${user.plainPassword}`);
  });

  await prisma.$disconnect();
}

syncEmployeePasswords().catch(console.error);