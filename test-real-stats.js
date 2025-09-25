const jwt = require('jsonwebtoken');

async function testRealStats() {
  const token = jwt.sign({ 
    userId: 'admin123', 
    email: 'admin@laiaskin.com', 
    role: 'ADMIN' 
  }, 'your-secret-key');
  
  const response = await fetch('http://localhost:3001/api/admin/real-stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Statistiques récupérées avec succès:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error('❌ Erreur:', response.status, response.statusText);
  }
}

testRealStats().catch(console.error);
