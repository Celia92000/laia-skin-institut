// Script de test pour la récupération de mot de passe

async function testPasswordReset() {
  console.log('🔄 Test du système de récupération de mot de passe...');
  
  // 1. Tester la demande de réinitialisation
  console.log('\n1️⃣ Test de la demande de réinitialisation pour contact@laiaskininstitut.fr');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'contact@laiaskininstitut.fr' })
    });
    
    const data = await response.json();
    console.log('✅ Réponse:', data);
    
    if (data.success) {
      console.log('📧 Un email devrait avoir été envoyé (vérifiez les logs du serveur)');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  console.log('\n✨ Test terminé!');
}

testPasswordReset();