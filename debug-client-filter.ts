// Debug du filtre Client
import prisma from './src/lib/prisma';

async function debugClientFilter() {
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true
    }
  });
  
  console.log('🔍 DEBUG FILTRE CLIENT\n');
  
  // Simuler le filtre CLIENT
  const clientFiltered = allUsers.filter(u => 
    u.role === 'CLIENT' || u.role === 'client'
  );
  
  console.log(`Total users: ${allUsers.length}`);
  console.log(`Filtre CLIENT devrait afficher: ${clientFiltered.length} utilisateurs\n`);
  
  console.log('Liste des utilisateurs avec filtre CLIENT:');
  clientFiltered.forEach(u => {
    console.log(`  - ${u.email} (role: "${u.role}")`);
  });
  
  // Vérifier s'il y a des admins avec le mauvais rôle
  const suspiciousUsers = allUsers.filter(u => {
    const isAdminEmail = u.email.includes('admin') || 
                        u.email.includes('laiaskininstitut') ||
                        u.email === 'celia@laiaskin.com' ||
                        u.email === 'celia.ivorra95@hotmail.fr';
    const hasClientRole = u.role === 'CLIENT' || u.role === 'client';
    return isAdminEmail && hasClientRole;
  });
  
  if (suspiciousUsers.length > 0) {
    console.log('\n⚠️ PROBLÈME DÉTECTÉ:');
    console.log('Ces utilisateurs ont des emails d\'admin mais un rôle CLIENT:');
    suspiciousUsers.forEach(u => {
      console.log(`  ❌ ${u.email} a le rôle "${u.role}" au lieu d'ADMIN`);
    });
  }
  
  await prisma.$disconnect();
}

debugClientFilter().catch(console.error);