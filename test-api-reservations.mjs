async function testAPI() {
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
    
    console.log('📅 Premier rendez-vous:');
    console.log('  - services:', reservations[0].services);
    console.log('  - serviceName:', reservations[0].serviceName);
    console.log('  - totalPrice:', reservations[0].totalPrice);
  } catch(err) {
    console.error('Erreur:', err.message);
  }
}

testAPI();
