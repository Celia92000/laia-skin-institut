// Test de synchronisation via l'API
async function testAPISynchronization() {
  const apiUrl = 'http://localhost:3001';
  
  console.log('🔄 TEST DE SYNCHRONISATION VIA API\n');
  console.log('=' . repeat(50) + '\n');
  
  // 1. Se connecter avec différents comptes et vérifier les données
  const accounts = [
    { email: 'contact@laiaskininstitut.fr', password: 'admin123', role: 'ADMIN' },
    { email: 'sophie.martin@laiaskin.com', password: 'employee123', role: 'EMPLOYEE' },
  ];
  
  for (const account of accounts) {
    console.log(`\n📱 Connexion: ${account.email} (${account.role})`);
    console.log('-'.repeat(40));
    
    // Login
    const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account.email,
        password: account.password
      })
    });
    
    if (!loginRes.ok) {
      console.log(`  ❌ Erreur de connexion`);
      continue;
    }
    
    const { token } = await loginRes.json();
    console.log(`  ✅ Connecté avec succès`);
    
    // Récupérer les réservations
    const resRes = await fetch(`${apiUrl}/api/admin/reservations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (resRes.ok) {
      const reservations = await resRes.json();
      console.log(`  📊 Réservations visibles: ${reservations.length}`);
      
      // Afficher quelques détails
      const byStatus = reservations.reduce((acc: any, res: any) => {
        acc[res.status] = (acc[res.status] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`     • ${status}: ${count}`);
      });
    } else {
      console.log(`  ❌ Erreur récupération réservations: ${resRes.status}`);
    }
    
    // Récupérer les clients (pour admin/employé)
    const clientsRes = await fetch(`${apiUrl}/api/admin/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (clientsRes.ok) {
      const clients = await clientsRes.json();
      console.log(`  👥 Clients visibles: ${clients.length}`);
    }
  }
  
  console.log('\n\n✅ RÉSULTAT ATTENDU:');
  console.log('  • Les ADMINS voient TOUTES les réservations et clients');
  console.log('  • Les EMPLOYÉS voient TOUTES les réservations et clients');
  console.log('  • Les modifications faites par un compte sont visibles par tous');
  console.log('  • Les statuts sont synchronisés en temps réel');
}

testAPISynchronization().catch(console.error);