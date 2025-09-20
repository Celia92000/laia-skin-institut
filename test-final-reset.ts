async function testFinalReset() {
  const token = '60283683272afa3cbecf1c33bb37e15b0ad8f3659ed3f03dbae114eb496fb86b';
  const newPassword = 'Laia2024!';
  
  console.log('🔐 Test final de réinitialisation...\n');
  
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
    
    if (response.ok && data.success) {
      console.log('========================================');
      console.log('✅ MOT DE PASSE CHANGÉ AVEC SUCCÈS !');
      console.log('========================================\n');
      console.log('📧 Vos nouveaux identifiants :');
      console.log('Email: celia.ivorra95@hotmail.fr');
      console.log('Mot de passe: ' + newPassword);
      console.log('\n👉 Connectez-vous sur :');
      console.log('http://localhost:3001/login');
      console.log('ou');
      console.log('https://laia-skin-institut-as92.vercel.app/login');
      console.log('========================================\n');
    } else {
      console.log('❌ Erreur:', data.message || 'Erreur inconnue');
      console.log('\nDétails:', data);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

testFinalReset();