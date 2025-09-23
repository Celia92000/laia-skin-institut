async function testCalendarData() {
  try {
    // Login
    const loginResp = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@laiaskin.com', password: 'admin123' })
    });
    const { token } = await loginResp.json();

    // Get reservations
    const resResp = await fetch('http://localhost:3001/api/admin/reservations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const reservations = await resResp.json();
    
    console.log('📅 Données des réservations pour le calendrier:');
    reservations.slice(0, 3).forEach(r => {
      const date = r.date.split('T')[0];
      console.log(`  Date: ${date}, Heure: ${r.time}`);
      console.log(`  Client: ${r.userName}`);
      console.log(`  services (array):`, r.services);
      console.log(`  serviceName:`, r.serviceName);
      console.log(`  Prix: ${r.totalPrice}€`);
      console.log('  ---');
    });
  } catch(err) {
    console.error('Erreur:', err.message);
  }
}

testCalendarData();