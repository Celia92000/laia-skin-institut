const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  try {
    console.log('🧪 Test de l\'API des créneaux bloqués...\n');
    
    // Test pour septembre 2025
    const data1 = await makeRequest('http://localhost:3001/api/public/availability?action=blocked&year=2025&month=9');
    console.log('📅 Septembre 2025:', JSON.stringify(data1, null, 2));
    
    // Test pour octobre 2025
    const data2 = await makeRequest('http://localhost:3001/api/public/availability?action=blocked&year=2025&month=10');
    console.log('📅 Octobre 2025:', JSON.stringify(data2, null, 2));
    
    // Test des créneaux pour une date spécifique
    const data3 = await makeRequest('http://localhost:3001/api/public/availability?action=slots&date=2025-10-01');
    console.log('🕐 Créneaux pour 2025-10-01 (où certains sont bloqués):', JSON.stringify(data3, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAPI();