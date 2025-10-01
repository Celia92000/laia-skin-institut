// Test des API admin
async function testAdminAPIs() {
  const baseUrl = 'http://localhost:3001';
  
  // 1. D'abord se connecter pour obtenir un token
  console.log('🔐 Connexion en tant qu\'admin...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@laiaskin.com',
      password: 'admin123'
    })
  });
  
  if (!loginResponse.ok) {
    console.error('❌ Échec de la connexion');
    return;
  }
  
  const { token } = await loginResponse.json();
  console.log('✅ Token obtenu');
  
  // 2. Tester l'API des réservations
  console.log('\n📊 Test de l\'API des réservations...');
  const reservationsResponse = await fetch(`${baseUrl}/api/admin/reservations`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Status:', reservationsResponse.status);
  if (reservationsResponse.ok) {
    const data = await reservationsResponse.json();
    console.log('✅ Réservations récupérées:', data.length);
    if (data.length > 0) {
      console.log('Exemple de réservation:', data[0]);
    }
  } else {
    console.error('❌ Erreur:', await reservationsResponse.text());
  }
  
  // 3. Tester l'API des statistiques
  console.log('\n📈 Test de l\'API des statistiques...');
  const statsResponse = await fetch(`${baseUrl}/api/admin/statistics-safe?viewMode=month&selectedMonth=2025-09`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Status:', statsResponse.status);
  if (statsResponse.ok) {
    const data = await statsResponse.json();
    console.log('✅ Statistiques récupérées');
    console.log('Revenue total:', data.revenue);
    console.log('Réservations totales:', data.totalReservations);
  } else {
    console.error('❌ Erreur:', await statsResponse.text());
  }
  
  // 4. Tester l'API des clients
  console.log('\n👥 Test de l\'API des clients...');
  const clientsResponse = await fetch(`${baseUrl}/api/admin/clients`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Status:', clientsResponse.status);
  if (clientsResponse.ok) {
    const data = await clientsResponse.json();
    console.log('✅ Clients récupérés:', data.length);
  } else {
    console.error('❌ Erreur:', await clientsResponse.text());
  }
}

testAdminAPIs().catch(console.error);
