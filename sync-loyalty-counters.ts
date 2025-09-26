import { getPrismaClient } from './src/lib/prisma';

async function syncLoyaltyCounters() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 SYNCHRONISATION DES COMPTEURS DE FIDÉLITÉ");
    console.log("=" .repeat(80));
    
    // Récupérer tous les profils de fidélité
    const profiles = await prisma.loyaltyProfile.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`\n📊 Nombre de profils à vérifier: ${profiles.length}`);
    
    for (const profile of profiles) {
      console.log(`\n👤 ${profile.user.name} (${profile.user.email})`);
      console.log(`   Compteurs actuels: ${profile.individualServicesCount} soins, ${profile.packagesCount} forfaits`);
      
      // Compter les réservations complétées
      const completedReservations = await prisma.reservation.findMany({
        where: {
          userId: profile.userId,
          status: 'completed'
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      // Recompter manuellement
      let realIndividualCount = 0;
      let realPackageCount = 0;
      
      for (const res of completedReservations) {
        let services;
        try {
          services = typeof res.services === 'string' 
            ? JSON.parse(res.services) 
            : res.services;
        } catch {
          // Si ce n'est pas du JSON valide, c'est probablement juste une string
          services = [res.services];
        }
        
        let packages;
        try {
          packages = typeof res.packages === 'string'
            ? JSON.parse(res.packages || '{}')
            : res.packages || {};
        } catch {
          packages = {};
        }
        
        // Détection améliorée
        let isPackage = false;
        
        // 1. Vérifier le champ packages
        if (packages && Object.keys(packages).length > 0) {
          isPackage = true;
        }
        
        // 2. Vérifier le nom du service
        if (!isPackage && Array.isArray(services)) {
          for (const service of services) {
            if (typeof service === 'string' && service.toLowerCase().includes('forfait')) {
              isPackage = true;
              break;
            }
          }
        }
        
        if (isPackage) {
          realPackageCount++;
          const serviceNames = Array.isArray(services) ? services.join(', ') : services;
          console.log(`      📦 Forfait: ${serviceNames}`);
        } else {
          realIndividualCount++;
          const serviceNames = Array.isArray(services) ? services.join(', ') : services;
          console.log(`      ✨ Soin: ${serviceNames}`);
        }
      }
      
      console.log(`   Compteurs recalculés: ${realIndividualCount} soins, ${realPackageCount} forfaits`);
      
      // Si différence, corriger
      if (realIndividualCount !== profile.individualServicesCount || 
          realPackageCount !== profile.packagesCount) {
        
        console.log(`   ⚠️  Différence détectée! Correction en cours...`);
        
        await prisma.loyaltyProfile.update({
          where: { id: profile.id },
          data: {
            individualServicesCount: realIndividualCount,
            packagesCount: realPackageCount
          }
        });
        
        await prisma.loyaltyHistory.create({
          data: {
            userId: profile.userId,
            action: 'SYNC_CORRECTION',
            points: 0,
            description: `Synchronisation: ${realIndividualCount} soins, ${realPackageCount} forfaits`
          }
        });
        
        console.log(`   ✅ Corrigé!`);
      } else {
        console.log(`   ✅ Compteurs corrects`);
      }
      
      // Afficher les réductions disponibles
      if (realIndividualCount >= 5) {
        console.log(`   🎉 RÉDUCTION SOINS DISPONIBLE: ${realIndividualCount}/5 → -20€`);
      }
      if (realPackageCount >= 3) {
        console.log(`   🎉 RÉDUCTION FORFAITS DISPONIBLE: ${realPackageCount}/3 → -40€`);
      }
    }
    
    // Résumé final
    console.log("\n" + "=" .repeat(80));
    console.log("✅ SYNCHRONISATION TERMINÉE");
    console.log("\n📋 Règles de détection:");
    console.log("   - Si le champ 'packages' est rempli → FORFAIT");
    console.log("   - Si le nom contient 'Forfait' → FORFAIT");
    console.log("   - Sinon → SOIN INDIVIDUEL");
    
    // Vérifier spécifiquement les réductions disponibles
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
    
    if (eligibleProfiles.length > 0) {
      console.log("\n🎁 CLIENTS AVEC RÉDUCTIONS DISPONIBLES:");
      for (const profile of eligibleProfiles) {
        console.log(`\n   ${profile.user.name} (${profile.user.email})`);
        if (profile.individualServicesCount >= 5) {
          console.log(`      ✨ ${profile.individualServicesCount}/5 soins → -20€`);
        }
        if (profile.packagesCount >= 3) {
          console.log(`      📦 ${profile.packagesCount}/3 forfaits → -40€`);
        }
      }
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncLoyaltyCounters();