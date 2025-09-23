import fetch from 'node-fetch';

async function testAPI() {
  try {
    // D'abord, se connecter pour obtenir un token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@laiaskin.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Échec de connexion');
      return;
    }
    
    const loginData = await loginResponse.json() as any;
    const token = loginData.token;
    console.log('✅ Connecté avec succès');
    
    // Tester l'API des statistiques
    const statsResponse = await fetch('http://localhost:3001/api/admin/statistics-safe?viewMode=month', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!statsResponse.ok) {
      console.error('❌ Échec de récupération des statistiques:', statsResponse.status);
      return;
    }
    
    const stats = await statsResponse.json();
    console.log('\n📊 Statistiques reçues de l\'API:');
    console.log('  - Total réservations:', stats.totalReservations);
    console.log('  - Réservations aujourd\'hui:', stats.todayReservations);
    console.log('  - Réservations cette semaine:', stats.weekReservations);
    console.log('  - Réservations ce mois:', stats.monthReservations);
    console.log('  - Revenus totaux:', stats.totalRevenue + '€');
    console.log('\n📋 Données complètes:');
    console.log(JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAPI();