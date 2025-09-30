// Script pour nettoyer les mots de passe stockés dans le navigateur
// À exécuter dans la console du navigateur sur le site

console.log("🔒 Nettoyage des données sensibles...");

// Supprimer tout mot de passe stocké
localStorage.removeItem('rememberedPassword');
localStorage.removeItem('password');
localStorage.removeItem('userPassword');

// Nettoyer les cookies potentiellement sensibles
document.cookie.split(";").forEach(function(c) { 
  const eqPos = c.indexOf("=");
  const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
  if (name.toLowerCase().includes('password') || name.toLowerCase().includes('pwd')) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
});

// Afficher les clés restantes dans localStorage
console.log("📋 Données restantes dans localStorage:");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (!key.toLowerCase().includes('password') && !key.toLowerCase().includes('pwd')) {
    console.log(`  - ${key}`);
  }
}

console.log("✅ Nettoyage terminé. Les mots de passe ont été supprimés.");
console.log("ℹ️  Seul l'email peut être sauvegardé avec 'Se souvenir de moi'");