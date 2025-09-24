// Test de connexion et d'accès admin
async function testAdminAccess() {
  const apiUrl = 'http://localhost:3001';
  
  console.log('🔍 Test de connexion admin...\n');
  
  // 1. Test de connexion
  const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'contact@laiaskininstitut.fr',
      password: 'admin123'
    })
  });
  
  const loginData = await loginResponse.json();
  
  if (loginResponse.ok) {
    console.log('✅ Connexion réussie');
    console.log('   - Utilisateur:', loginData.user.name);
    console.log('   - Email:', loginData.user.email);
    console.log('   - Rôle:', loginData.user.role);
    console.log('   - Token:', loginData.token.substring(0, 20) + '...');
  } else {
    console.log('❌ Erreur de connexion:', loginData.error);
    return;
  }
  
  // 2. Test de vérification du token
  const verifyResponse = await fetch(`${apiUrl}/api/auth/verify`, {
    headers: {
      'Authorization': `Bearer ${loginData.token}`
    }
  });
  
  const verifyData = await verifyResponse.json();
  
  if (verifyResponse.ok) {
    console.log('\n✅ Token valide');
    console.log('   - Rôle vérifié:', verifyData.user.role);
  } else {
    console.log('\n❌ Erreur de vérification:', verifyData.error);
  }
  
  // 3. Vérification des redirections
  console.log('\n📋 Redirections attendues:');
  console.log(`   - Rôle ${loginData.user.role} → devrait aller vers /admin`);
  
  if (loginData.user.role === 'ADMIN' || loginData.user.role === 'admin') {
    console.log('   ✓ L\'admin devrait avoir accès complet au dashboard');
  } else if (loginData.user.role === 'EMPLOYEE') {
    console.log('   ✓ L\'employé devrait avoir accès restreint au dashboard');
  } else {
    console.log('   ⚠ Le rôle client ne devrait pas avoir accès à l\'admin');
  }
}

testAdminAccess().catch(console.error);