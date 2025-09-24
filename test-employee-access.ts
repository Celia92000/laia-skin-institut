// Test de connexion et d'accès employé
async function testEmployeeAccess() {
  const apiUrl = 'http://localhost:3001';
  
  console.log('🔍 Test de connexion employé...\n');
  
  // 1. Test de connexion
  const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sophie.martin@laiaskin.com',
      password: 'employee123'
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
  console.log(`   - Rôle ${loginData.user.role} → devrait aller vers /`);
  console.log('   - Puis avoir accès au bouton "Espace Employé" dans le header');
  console.log('   - Le bouton devrait rediriger vers /admin avec accès restreint');
  
  if (loginData.user.role === 'EMPLOYEE') {
    console.log('\n✓ L\'employé devrait voir:');
    console.log('   - Tableau de bord (stats limitées)');
    console.log('   - Planning du jour');
    console.log('   - Soins & Paiements');
    console.log('   - Gestion Fidélité');
    console.log('   - CRM Clients');
    console.log('   - WhatsApp');
    console.log('\n✗ L\'employé ne devrait PAS voir:');
    console.log('   - Services');
    console.log('   - Produits');
    console.log('   - Emailing');
    console.log('   - Boutons export');
    console.log('   - Statistiques complètes');
  }
}

testEmployeeAccess().catch(console.error);