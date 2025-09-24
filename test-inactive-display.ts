// Test de l'affichage des comptes inactifs
import prisma from './src/lib/prisma';

async function testInactiveDisplay() {
  console.log('🔍 TEST AFFICHAGE DES COMPTES INACTIFS\n');
  
  // 1. Compter tous les utilisateurs dans la base
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true
    }
  });
  
  // 2. Grouper par rôle
  const roleGroups = allUsers.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, typeof allUsers>);
  
  console.log('📊 RÉPARTITION DES RÔLES:\n');
  Object.entries(roleGroups).forEach(([role, users]) => {
    console.log(`${role}: ${users.length} utilisateurs`);
    if (role === 'INACTIVE') {
      users.forEach(u => console.log(`  - ${u.email}`));
    }
  });
  
  // 3. Simuler le filtrage par défaut (sans clients)
  const nonClients = allUsers.filter(u => 
    u.role !== 'CLIENT' && u.role !== 'client'
  );
  
  console.log('\n📋 AFFICHAGE PAR DÉFAUT (sans clients):');
  console.log(`Total affiché: ${nonClients.length} utilisateurs`);
  
  const inactiveInDefault = nonClients.filter(u => u.role === 'INACTIVE');
  console.log(`Dont INACTIVE: ${inactiveInDefault.length}`);
  
  // 4. Quand on clique sur "Inactif"
  const inactiveFiltered = allUsers.filter(u => u.role === 'INACTIVE');
  console.log('\n🎯 QUAND ON CLIQUE SUR "Inactif":');
  console.log(`Devrait afficher: ${inactiveFiltered.length} utilisateurs`);
  
  await prisma.$disconnect();
}

testInactiveDisplay().catch(console.error);