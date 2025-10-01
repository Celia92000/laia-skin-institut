import { getPrismaClient } from './src/lib/prisma';

async function testLoyaltySystem() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🧪 TEST COMPLET DU SYSTÈME DE FIDÉLITÉ");
    console.log("=" .repeat(80));
    
    // 1. Trouver Célia Ivorra
    const celia = await prisma.user.findFirst({
      where: {
        email: 'celia.ivorra95@hotmail.fr'
      }
    });
    
    if (!celia) {
      console.log("❌ Célia Ivorra non trouvée");
      return;
    }
    
    console.log(`\n👤 Client test: ${celia.name} (${celia.email})`);
    console.log(`   ID: ${celia.id}`);
    
    // 2. Vérifier son profil de fidélité actuel
    let profile = await prisma.loyaltyProfile.findUnique({
      where: { userId: celia.id }
    });
    
    console.log("\n📊 ÉTAT ACTUEL:");
    if (profile) {
      console.log(`   ✨ Soins individuels: ${profile.individualServicesCount}/5`);
      console.log(`   📦 Forfaits: ${profile.packagesCount}/3`);
    } else {
      console.log("   ❌ Pas de profil de fidélité");
    }
    
    // 3. Simuler l'ajout d'un soin pour passer de 4 à 5
    if (profile && profile.individualServicesCount === 4) {
      console.log("\n🔄 SIMULATION: Ajout d'un soin (passage de 4 à 5)...");
      
      await prisma.loyaltyProfile.update({
        where: { userId: celia.id },
        data: {
          individualServicesCount: 5
        }
      });
      
      await prisma.loyaltyHistory.create({
        data: {
          userId: celia.id,
          action: 'SERVICE_COMPLETED',
          points: 1,
          description: 'Test: 5ème soin complété'
        }
      });
      
      profile = await prisma.loyaltyProfile.findUnique({
        where: { userId: celia.id }
      });
      
      console.log("   ✅ Mise à jour effectuée");
      console.log(`   ✨ Nouveau compteur: ${profile!.individualServicesCount}/5`);
      
      if (profile!.individualServicesCount >= 5) {
        console.log("   🎉 RÉDUCTION DE 20€ MAINTENANT DISPONIBLE!");
      }
    }
    
    // 4. Tester l'ajout d'un 6ème soin
    if (profile && profile.individualServicesCount === 5) {
      console.log("\n🔄 TEST: Ajout d'un 6ème soin (devrait passer à 6/5)...");
      
      await prisma.loyaltyProfile.update({
        where: { userId: celia.id },
        data: {
          individualServicesCount: 6
        }
      });
      
      await prisma.loyaltyHistory.create({
        data: {
          userId: celia.id,
          action: 'SERVICE_COMPLETED',
          points: 1,
          description: 'Test: 6ème soin complété'
        }
      });
      
      profile = await prisma.loyaltyProfile.findUnique({
        where: { userId: celia.id }
      });
      
      console.log("   ✅ Mise à jour effectuée");
      console.log(`   ✨ Nouveau compteur: ${profile!.individualServicesCount}/5`);
      console.log("   ℹ️  Le compteur DOIT continuer à augmenter au-delà de 5");
      console.log("   ℹ️  Il ne se réinitialise QUE quand la réduction est utilisée");
    }
    
    // 5. Vérifier toutes les réservations de Célia
    console.log("\n📅 RÉSERVATIONS DE CÉLIA:");
    const reservations = await prisma.reservation.findMany({
      where: { userId: celia.id },
      orderBy: { date: 'desc' },
      take: 5
    });
    
    if (reservations.length === 0) {
      console.log("   ❌ Aucune réservation trouvée");
      
      // Créer une réservation test
      console.log("\n📝 Création d'une réservation test...");
      const testReservation = await prisma.reservation.create({
        data: {
          userId: celia.id,
          userName: celia.name,
          userEmail: celia.email,
          userPhone: celia.phone || '',
          date: new Date(),
          time: '14:00',
          services: JSON.stringify(['Soin du visage']),
          totalPrice: 80,
          status: 'confirmed',
          paymentStatus: 'pending',
          source: 'test'
        }
      });
      
      console.log(`   ✅ Réservation créée: ${testReservation.id}`);
      console.log("   ℹ️  Pour incrémenter le compteur:");
      console.log("      1. Aller dans l'admin");
      console.log("      2. Onglet 'Gestion des soins'");
      console.log("      3. Cliquer 'Enregistrer le paiement'");
      console.log("      4. Indiquer que le client était présent");
      console.log("      5. Valider → Le statut passe à 'completed'");
    } else {
      for (const res of reservations) {
        console.log(`   - ${res.date.toLocaleDateString('fr-FR')} : ${res.status} (Paiement: ${res.paymentStatus})`);
      }
    }
    
    // 6. Vérifier l'historique de fidélité
    console.log("\n📜 HISTORIQUE DE FIDÉLITÉ (5 derniers):");
    const history = await prisma.loyaltyHistory.findMany({
      where: { userId: celia.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    for (const entry of history) {
      console.log(`   - ${entry.createdAt.toLocaleString('fr-FR')}: ${entry.description}`);
    }
    
    // 7. État final
    console.log("\n" + "=" .repeat(80));
    console.log("✅ ÉTAT FINAL DU PROFIL:");
    profile = await prisma.loyaltyProfile.findUnique({
      where: { userId: celia.id }
    });
    
    if (profile) {
      console.log(`   ✨ Soins: ${profile.individualServicesCount}/5 ${profile.individualServicesCount >= 5 ? '→ RÉDUCTION DISPONIBLE!' : ''}`);
      console.log(`   📦 Forfaits: ${profile.packagesCount}/3 ${profile.packagesCount >= 3 ? '→ RÉDUCTION DISPONIBLE!' : ''}`);
      
      if (profile.individualServicesCount >= 5) {
        console.log("\n🎉 LA RÉDUCTION DE 20€ DEVRAIT APPARAÎTRE:");
        console.log("   - Dans la modal de validation de paiement");
        console.log("   - Automatiquement pré-cochée");
        console.log("   - Avec un message d'alerte vert");
      }
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoyaltySystem();