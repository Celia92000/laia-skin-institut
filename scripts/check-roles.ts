import prisma from '../src/lib/prisma';

(async () => {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true
    },
    orderBy: { role: 'asc' }
  });
  
  console.log('=== ANALYSE DES RÔLES ===\n');
  
  // Grouper par rôle
  const byRole = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, typeof users>);
  
  // Afficher par rôle
  Object.entries(byRole).forEach(([role, roleUsers]) => {
    console.log(`\n📋 Rôle: ${role} (${roleUsers.length} utilisateurs)`);
    console.log('='.repeat(40));
    roleUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
  });
  
  // Identifier les problèmes potentiels
  console.log('\n⚠️  PROBLÈMES DÉTECTÉS:');
  
  // Clients qui ne devraient pas être admin
  const suspiciousAdmins = users.filter(u => 
    (u.role === 'admin' || u.role === 'ADMIN') && 
    (u.email.includes('client') || u.email.includes('test') || u.email.includes('example'))
  );
  
  if (suspiciousAdmins.length > 0) {
    console.log('\nClients suspects avec rôle admin:');
    suspiciousAdmins.forEach(u => {
      console.log(`  ❌ ${u.email} a le rôle ${u.role}`);
    });
  } else {
    console.log('  ✅ Aucun client suspect avec rôle admin');
  }
  
  // Vérifier les vrais admins
  const realAdmins = users.filter(u => 
    (u.role === 'admin' || u.role === 'ADMIN')
  );
  
  console.log('\n👑 ADMINISTRATEURS ACTUELS:');
  realAdmins.forEach(u => {
    console.log(`  - ${u.email} (${u.name || 'Sans nom'})`);
  });
  
  await prisma.$disconnect();
})();