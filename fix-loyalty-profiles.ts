import { getPrismaClient } from './src/lib/prisma';

async function fixLoyaltyProfiles() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 CORRECTION DES PROFILS DE FIDÉLITÉ\n");
    console.log("=" .repeat(80));
    
    // 1. Trouver tous les utilisateurs clients
    const allClients = await prisma.user.findMany({
      where: {
        role: 'client'
      },
      include: {
        loyaltyProfile: true,
        reservations: {
          where: { status: 'completed' }
        }
      }
    });
    
    let created = 0;
    let updated = 0;
    
    for (const client of allClients) {
      // Si pas de profil de fidélité, le créer
      if (!client.loyaltyProfile) {
        console.log(`\n📝 Création du profil pour ${client.name} (${client.email})`);
        
        // Compter les soins et forfaits déjà effectués
        let individualCount = 0;
        let packageCount = 0;
        let totalSpent = 0;
        
        for (const res of client.reservations) {
          const packages = res.packages ? 
            (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
          
          if (packages && Object.keys(packages).length > 0) {
            packageCount++;
          } else {
            individualCount++;
          }
          
          if (res.paymentAmount) {
            totalSpent += res.paymentAmount;
          }
        }
        
        const profile = await prisma.loyaltyProfile.create({
          data: {
            userId: client.id,
            individualServicesCount: individualCount,
            packagesCount: packageCount,
            totalSpent: totalSpent,
            availableDiscounts: '[]',
            lastVisit: client.reservations.length > 0 ? 
              client.reservations[client.reservations.length - 1].date : new Date()
          }
        });
        
        console.log(`   ✅ Profil créé avec:`);
        console.log(`      - ${individualCount} soin(s) individuel(s)`);
        console.log(`      - ${packageCount} forfait(s)`);
        console.log(`      - ${totalSpent}€ dépensés`);
        
        // Créer l'historique
        if (individualCount > 0 || packageCount > 0) {
          await prisma.loyaltyHistory.create({
            data: {
              userId: client.id,
              action: 'PROFILE_SYNC',
              points: 0,
              description: `Synchronisation initiale: ${individualCount} soins, ${packageCount} forfaits`
            }
          });
        }
        
        created++;
      } else {
        // Vérifier la cohérence pour les profils existants
        const completedRes = client.reservations.length;
        const profileTotal = client.loyaltyProfile.individualServicesCount + client.loyaltyProfile.packagesCount;
        
        if (completedRes > 0 && profileTotal === 0) {
          console.log(`\n⚠️  Incohérence détectée pour ${client.name}:`);
          console.log(`   - ${completedRes} réservation(s) complétée(s)`);
          console.log(`   - Mais compteurs à 0`);
          
          // Recalculer
          let individualCount = 0;
          let packageCount = 0;
          
          for (const res of client.reservations) {
            const packages = res.packages ? 
              (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
            
            if (packages && Object.keys(packages).length > 0) {
              packageCount++;
            } else {
              individualCount++;
            }
          }
          
          await prisma.loyaltyProfile.update({
            where: { userId: client.id },
            data: {
              individualServicesCount: individualCount,
              packagesCount: packageCount
            }
          });
          
          console.log(`   ✅ Compteurs corrigés: ${individualCount} soins, ${packageCount} forfaits`);
          updated++;
        }
      }
    }
    
    console.log("\n" + "=" .repeat(80));
    console.log(`\n✅ RÉSUMÉ:`);
    console.log(`   - ${created} profil(s) créé(s)`);
    console.log(`   - ${updated} profil(s) corrigé(s)`);
    
    // Afficher l'état final des clients avec 5+ soins ou 3+ forfaits
    console.log("\n📊 CLIENTS ÉLIGIBLES AUX RÉDUCTIONS:");
    console.log("=" .repeat(80));
    
    const eligibleProfiles = await prisma.loyaltyProfile.findMany({
      where: {
        OR: [
          { individualServicesCount: { gte: 5 } },
          { packagesCount: { gte: 3 } }
        ]
      },
      include: {
        user: true
      }
    });
    
    for (const profile of eligibleProfiles) {
      console.log(`\n👤 ${profile.user.name} (${profile.user.email})`);
      if (profile.individualServicesCount >= 5) {
        console.log(`   🎉 RÉDUCTION 5 SOINS DISPONIBLE! (${profile.individualServicesCount}/5)`);
      }
      if (profile.packagesCount >= 3) {
        console.log(`   🎉 RÉDUCTION 3 FORFAITS DISPONIBLE! (${profile.packagesCount}/3)`);
      }
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLoyaltyProfiles();