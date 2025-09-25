async function testCharts() {
  // 1. Login
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@laiaskin.com',
      password: 'admin123'
    })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed');
    return;
  }
  
  const { token } = await loginRes.json();
  console.log('✅ Connecté');
  
  // Test différentes périodes
  const periods = ['day', 'week', 'month', 'year'];
  
  for (const period of periods) {
    console.log(`\n📊 Test période: ${period}`);
    const res = await fetch(`http://localhost:3001/api/admin/charts?period=${period}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`  - Daily revenue points: ${data.dailyRevenue ? data.dailyRevenue.length : 0}`);
      console.log(`  - Service distribution: ${data.serviceDistribution ? data.serviceDistribution.length : 0} services`);
      console.log(`  - Status distribution: ${data.statusDistribution ? data.statusDistribution.length : 0} statuts`);
      console.log(`  - Hourly distribution: ${data.hourlyDistribution ? data.hourlyDistribution.length : 0} heures`);
      
      if (data.dailyRevenue && data.dailyRevenue.length > 0) {
        console.log(`  - Premier point: ${data.dailyRevenue[0].date} = ${data.dailyRevenue[0].revenue}€`);
        const last = data.dailyRevenue[data.dailyRevenue.length-1];
        console.log(`  - Dernier point: ${last.date} = ${last.revenue}€`);
      }
    } else {
      console.error(`  ❌ Erreur: ${res.status}`);
    }
  }
}

testCharts().catch(console.error);