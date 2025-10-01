async function testResetPassword() {
  const token = '53b0448a999b12b4a4b39e2314b60ab0d1802550ba34f788035d473bb937ed70';
  const newPassword = 'NouveauMotDePasse2024!';
  
  console.log('🔐 Test de réinitialisation du mot de passe...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password: newPassword
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Mot de passe réinitialisé avec succès !');
      console.log('\n📧 Nouvelles informations de connexion :');
      console.log('Email: celia.ivorra95@hotmail.fr');
      console.log('Mot de passe:', newPassword);
    } else {
      console.log('❌ Erreur:', data.message);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

testResetPassword();