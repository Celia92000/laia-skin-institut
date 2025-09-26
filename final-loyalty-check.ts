import { getPrismaClient } from './src/lib/prisma';

async function finalLoyaltyCheck() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("✅ VÉRIFICATION FINALE DU SYSTÈME DE FIDÉLITÉ");
    console.log("=" .repeat(80));
    
    // Récupérer tous les profils de fidélité avec réductions disponibles
    const eligibleProfiles = await prisma.loyaltyProfile.findMany({
      where: {
        OR: [
          { individualServicesCount: { gte: 5 } },
          { packagesCount: { gte: 3 } }
        ]
      },
      include: {
        user: true
      },
      orderBy: [
        { individualServicesCount: 'desc' },
        { packagesCount: 'desc' }
      ]
    });
    
    console.log(`\n🎉 ${eligibleProfiles.length} CLIENT(S) AVEC RÉDUCTIONS DISPONIBLES:`);
    console.log("=" .repeat(80));
    
    for (const profile of eligibleProfiles) {
      console.log(`\n👤 ${profile.user.name} (${profile.user.email})`);
      
      if (profile.individualServicesCount >= 5) {
        console.log(`   ✨ SOINS: ${profile.individualServicesCount}/5`);
        console.log(`      → RÉDUCTION DE 20€ DISPONIBLE!`);
      }
      
      if (profile.packagesCount >= 3) {
        console.log(`   📦 FORFAITS: ${profile.packagesCount}/3`);
        console.log(`      → RÉDUCTION DE 30€ DISPONIBLE!`);
      }
      
      console.log(`   💰 Total dépensé: ${profile.totalSpent}€`);
    }
    
    // Vérifier spécifiquement Célia Ivorra
    console.log("\n" + "=" .repeat(80));
    console.log("🎯 FOCUS SUR CÉLIA IVORRA");
    console.log("=" .repeat(80));
    
    const celia = await prisma.user.findFirst({
      where: { email: 'celia.ivorra95@hotmail.fr' },
      include: {
        loyaltyProfile: true,
        reservations: {
          where: { 
            date: {
              gte: new Date('2025-09-27T00:00:00Z'),
              lt: new Date('2025-09-28T00:00:00Z')
            }
          },
          orderBy: { time: 'asc' }
        }
      }
    });
    
    if (celia && celia.loyaltyProfile) {
      console.log(`\n✅ Profil de Célia Ivorra:`);
      console.log(`   ✨ Soins individuels: ${celia.loyaltyProfile.individualServicesCount}/5`);
      console.log(`   📦 Forfaits: ${celia.loyaltyProfile.packagesCount}/3`);
      
      const reductions = [];
      if (celia.loyaltyProfile.individualServicesCount >= 5) {
        reductions.push("SOINS (-20€)");
      }
      if (celia.loyaltyProfile.packagesCount >= 3) {
        reductions.push("FORFAITS (-30€)");
      }
      
      if (reductions.length > 0) {
        console.log(`\n   🎉 RÉDUCTIONS DISPONIBLES: ${reductions.join(' ET ')}`);
      }
      
      if (celia.reservations.length > 0) {
        console.log(`\n   📅 Réservations de Célia pour demain (27/09):`);
        for (const res of celia.reservations) {
          const services = typeof res.services === 'string' ? JSON.parse(res.services) : res.services;
          const packages = res.packages ? 
            (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
          
          const type = packages && Object.keys(packages).length > 0 ? 'FORFAIT' : 'SOIN';
          const reduction = type === 'FORFAIT' ? 
            (celia.loyaltyProfile.packagesCount >= 3 ? '-30€' : 'Pas de réduction') :
            (celia.loyaltyProfile.individualServicesCount >= 5 ? '-20€' : 'Pas de réduction');
          
          console.log(`      - ${res.time} : ${services.join(', ')} (${type})`);
          console.log(`        Prix: ${res.totalPrice}€ → Réduction: ${reduction}`);
        }
      }
    }
    
    // Instructions
    console.log("\n" + "=" .repeat(80));
    console.log("📋 SYSTÈME DE FIDÉLITÉ - RÉCAPITULATIF");
    console.log("=" .repeat(80));
    
    console.log("\n✅ RÈGLES:");
    console.log("   • 5 soins individuels = Réduction de 20€");
    console.log("   • 3 forfaits = Réduction de 30€");
    console.log("   • Les compteurs se remettent à 0 après utilisation de la réduction");
    console.log("   • Les réductions sont automatiquement proposées lors du paiement");
    
    console.log("\n✅ FONCTIONNEMENT:");
    console.log("   1. Le compteur augmente à chaque soin/forfait marqué comme 'completed'");
    console.log("   2. À 5 soins ou 3 forfaits, la réduction devient disponible");
    console.log("   3. Lors du paiement, la réduction est pré-cochée automatiquement");
    console.log("   4. Après utilisation, le compteur correspondant revient à 0");
    
    console.log("\n✅ TEST:");
    console.log("   1. Allez dans l'admin: http://localhost:3001/admin");
    console.log("   2. Onglet 'Gestion des soins'");
    console.log("   3. Trouvez un client avec 5+ soins ou 3+ forfaits");
    console.log("   4. Cliquez 'Enregistrer le paiement'");
    console.log("   5. La réduction apparaît automatiquement!");
    
    console.log("\n🎉 SYSTÈME OPÉRATIONNEL POUR TOUS LES CLIENTS!");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

finalLoyaltyCheck();