async function testRealStatsWithAuth() {
  // 1. Se connecter
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
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
  console.log('✅ Connexion réussie');
  
  // 2. Récupérer les stats
  const statsResponse = await fetch('http://localhost:3001/api/admin/real-stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (statsResponse.ok) {
    const data = await statsResponse.json();
    console.log('\n📊 Statistiques réelles depuis la BDD:');
    console.log('   Total réservations:', data.totalReservations);
    console.log('   En attente:', data.pendingReservations);
    console.log('   Confirmées:', data.confirmedReservations);
    console.log('   Terminées:', data.completedReservations);
    console.log('   Aujourd\'hui:', data.todayReservations);
    console.log('\n💰 Revenus:');
    console.log('   Total:', data.totalRevenue, '€');
    console.log('   Payé:', data.paidRevenue, '€');
    console.log('   En attente:', data.pendingPayments, '€');
    console.log('   Du mois:', data.monthlyRevenue, '€');
    console.log('   Du jour:', data.todayRevenue, '€');
  } else {
    console.error('❌ Erreur:', statsResponse.status, statsResponse.statusText);
    console.error(await statsResponse.text());
  }
}

testRealStatsWithAuth().catch(console.error);
