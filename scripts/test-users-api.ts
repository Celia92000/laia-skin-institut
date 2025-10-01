// Test de l'API users pour vérifier les comptes inactifs
async function testUsersAPI() {
  const apiUrl = 'http://localhost:3001';
  
  // 1. Se connecter avec un compte admin
  const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'contact@laiaskininstitut.fr',
      password: 'admin123'
    })
  });
  
  const { token } = await loginRes.json();
  
  // 2. Récupérer tous les utilisateurs
  const usersRes = await fetch(`${apiUrl}/api/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const users = await usersRes.json();
  
  // 3. Compter par rôle
  const roleCount = users.reduce((acc: any, user: any) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  
  console.log('=== UTILISATEURS RÉCUPÉRÉS PAR L\'API ===\n');
  console.log(`Total: ${users.length} utilisateurs\n`);
  
  Object.entries(roleCount).forEach(([role, count]) => {
    console.log(`${role}: ${count}`);
  });
  
  // 4. Vérifier spécifiquement les INACTIVE
  const inactives = users.filter((u: any) => u.role === 'INACTIVE');
  console.log(`\n✅ Utilisateurs INACTIVE: ${inactives.length}`);
  if (inactives.length > 0) {
    console.log('Liste:');
    inactives.forEach((u: any) => {
      console.log(`  - ${u.email}`);
    });
  }
}

testUsersAPI().catch(console.error);