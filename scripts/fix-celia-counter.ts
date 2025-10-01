import { getPrismaClient } from './src/lib/prisma';

async function fixCeliaCounter() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 CORRECTION DU COMPTEUR DE CÉLIA IVORRA");
    console.log("=" .repeat(80));
    
    // Trouver Célia Ivorra
    const celia = await prisma.user.findFirst({
      where: {
        email: 'celia.ivorra95@hotmail.fr'
      }
    });
    
    if (!celia) {
      console.log("❌ Célia Ivorra non trouvée");
      return;
    }
    
    // Récupérer son profil de fidélité
    const profile = await prisma.loyaltyProfile.findUnique({
      where: { userId: celia.id }
    });
    
    if (!profile) {
      console.log("❌ Pas de profil de fidélité");
      return;
    }
    
    console.log("\n📊 ÉTAT ACTUEL:");
    console.log(`   ✨ Soins: ${profile.individualServicesCount}/5`);
    console.log(`   📦 Forfaits: ${profile.packagesCount}/3`);
    
    // Si le compteur est au-dessus de 5, le ramener exactement à 5
    // pour que la réduction soit disponible
    if (profile.individualServicesCount > 5) {
      console.log("\n⚠️  Le compteur est à", profile.individualServicesCount, "- Correction en cours...");
      
      await prisma.loyaltyProfile.update({
        where: { userId: celia.id },
        data: {
          individualServicesCount: 5
        }
      });
      
      await prisma.loyaltyHistory.create({
        data: {
          userId: celia.id,
          action: 'ADJUSTMENT',
          points: 0,
          description: 'Ajustement du compteur à 5 soins pour activation de la réduction'
        }
      });
      
      console.log("✅ Compteur ramené à 5/5 - Réduction maintenant disponible!");
    } else if (profile.individualServicesCount === 5) {
      console.log("\n✅ Le compteur est déjà à 5/5 - Réduction disponible!");
    } else {
      console.log("\n⏳ Encore", 5 - profile.individualServicesCount, "soin(s) pour la réduction");
    }
    
    // Vérifier aussi les forfaits
    if (profile.packagesCount >= 3) {
      console.log("\n🎉 RÉDUCTION 3 FORFAITS ÉGALEMENT DISPONIBLE!");
    }
    
    // Afficher l'état final
    const finalProfile = await prisma.loyaltyProfile.findUnique({
      where: { userId: celia.id }
    });
    
    console.log("\n" + "=" .repeat(80));
    console.log("📊 ÉTAT FINAL:");
    console.log(`   ✨ Soins: ${finalProfile!.individualServicesCount}/5`);
    console.log(`   📦 Forfaits: ${finalProfile!.packagesCount}/3`);
    
    if (finalProfile!.individualServicesCount === 5) {
      console.log("\n🎉 LA RÉDUCTION DE 20€ EST MAINTENANT DISPONIBLE!");
      console.log("   Elle apparaîtra automatiquement lors de la validation du prochain paiement");
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCeliaCounter();