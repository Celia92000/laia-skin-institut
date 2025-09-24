async function testLogin() {
  console.log('Testing login API...\n');
  
  const response = await fetch('http://localhost:3001/api/auth/login-debug', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@laiaskin.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (response.ok) {
    console.log('\n✅ LOGIN SUCCESSFUL!');
    console.log('Token:', data.token ? 'Present' : 'Missing');
    console.log('User:', data.user);
  } else {
    console.log('\n❌ LOGIN FAILED');
    console.log('Error:', data.error);
    console.log('Debug:', data.debug);
  }
}

testLogin().catch(console.error);