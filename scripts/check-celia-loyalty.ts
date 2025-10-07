import { getPrismaClient } from '../src/lib/prisma';

async function checkCeliaLoyalty() {
  const prisma = await getPrismaClient();
  
  try {
    // Trouver l'utilisateur Celia
    const celia = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Celia', mode: 'insensitive' } },
          { email: { contains: 'celia', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!celia) {
      console.log("❌ Utilisateur Celia non trouvé");
      return;
    }
    
    console.log("👤 Utilisateur trouvé:", {
      id: celia.id,
      name: celia.name,
      email: celia.email
    });
    
    // Vérifier le profil de fidélité
    const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
      where: { userId: celia.id }
    });
    
    if (!loyaltyProfile) {
      console.log("❌ Pas de profil de fidélité pour Celia");
      console.log("📝 Création d'un profil de fidélité...");
      
      const newProfile = await prisma.loyaltyProfile.create({
        data: {
          userId: celia.id,
          individualServicesCount: 0,
          packagesCount: 0,
          totalSpent: 0,
          availableDiscounts: '[]',
          lastVisit: new Date()
        }
      });
      
      console.log("✅ Profil créé:", newProfile);
    } else {
      console.log("\n📊 Profil de fidélité actuel:");
      console.log("  - Soins individuels:", loyaltyProfile.individualServicesCount, "/ 5");
      console.log("  - Forfaits:", loyaltyProfile.packagesCount, "/ 3");
      console.log("  - Total dépensé:", loyaltyProfile.totalSpent, "€");
      console.log("  - Dernière visite:", loyaltyProfile.lastVisit);
      
      // Vérifier l'éligibilité aux réductions
      if (loyaltyProfile.individualServicesCount >= 5) {
        console.log("  ✅ ÉLIGIBLE à la réduction 5 soins (-20€)");
      } else {
        console.log("  ⏳ Encore", 5 - loyaltyProfile.individualServicesCount, "soin(s) pour la réduction");
      }
      
      if (loyaltyProfile.packagesCount >= 3) {
        console.log("  ✅ ÉLIGIBLE à la réduction 3 forfaits (-30€)");
      } else {
        console.log("  ⏳ Encore", 3 - loyaltyProfile.packagesCount, "forfait(s) pour la réduction");
      }
    }
    
    // Vérifier l'historique de fidélité
    const history = await prisma.loyaltyHistory.findMany({
      where: { userId: celia.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log("\n📜 Historique récent de fidélité:");
    for (const entry of history) {
      console.log(`  - ${entry.createdAt.toLocaleDateString('fr-FR')} : ${entry.action} - ${entry.description}`);
    }
    
    // Vérifier les réservations complétées
    const completedReservations = await prisma.reservation.findMany({
      where: {
        userId: celia.id,
        status: 'completed'
      },
      orderBy: { date: 'desc' }
    });
    
    console.log("\n📅 Réservations complétées:", completedReservations.length);
    for (const res of completedReservations.slice(0, 5)) {
      console.log(`  - ${res.date.toLocaleDateString('fr-FR')} : ${res.services} (${res.paymentStatus})`);
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCeliaLoyalty();