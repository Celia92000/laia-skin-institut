// Test du token et du rôle
import jwt from 'jsonwebtoken';

async function testToken() {
  const apiUrl = 'http://localhost:3001';
  
  // 1. Se connecter avec le compte admin
  const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'contact@laiaskininstitut.fr',
      password: 'admin123'
    })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login response:', {
    role: loginData.user.role,
    email: loginData.user.email
  });
  
  // 2. Décoder le token pour voir ce qu'il contient
  const decoded = jwt.decode(loginData.token) as any;
  console.log('\nToken décodé:', {
    userId: decoded.userId,
    role: decoded.role,
    email: decoded.email
  });
  
  // 3. Tester l'API statistics-safe
  const statsResponse = await fetch(`${apiUrl}/api/admin/statistics-safe/?viewMode=month`, {
    headers: {
      'Authorization': `Bearer ${loginData.token}`
    }
  });
  
  console.log('\nAPI statistics-safe status:', statsResponse.status);
  if (!statsResponse.ok) {
    const error = await statsResponse.json();
    console.log('Error:', error);
  }
}

testToken().catch(console.error);