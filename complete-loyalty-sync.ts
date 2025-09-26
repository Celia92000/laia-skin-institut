import { getPrismaClient } from './src/lib/prisma';

async function completeLoyaltySync() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 SYNCHRONISATION COMPLÈTE DU SYSTÈME DE FIDÉLITÉ");
    console.log("=" .repeat(80));
    
    // 1. Récupérer tous les clients
    const allClients = await prisma.user.findMany({
      where: {
        role: 'client'
      },
      include: {
        loyaltyProfile: true,
        reservations: {
          where: { status: 'completed' },
          orderBy: { date: 'desc' }
        }
      }
    });
    
    console.log(`\n📊 Nombre total de clients: ${allClients.length}`);
    
    let profilesCreated = 0;
    let profilesFixed = 0;
    let clientsWithDiscounts = [];
    
    for (const client of allClients) {
      // Créer un profil de fidélité si nécessaire
      if (!client.loyaltyProfile && client.reservations.length > 0) {
        console.log(`\n📝 Création du profil pour ${client.name} (${client.email})`);
        
        // Compter les soins et forfaits complétés
        let individualCount = 0;
        let packageCount = 0;
        let totalSpent = 0;
        
        for (const res of client.reservations) {
          // Déterminer si c'est un forfait ou un soin individuel
          const packages = res.packages ? 
            (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
          
          if (packages && Object.keys(packages).length > 0) {
            packageCount++;
            console.log(`   📦 Forfait compté: ${Object.keys(packages).join(', ')}`);
          } else {
            individualCount++;
            const services = typeof res.services === 'string' ? JSON.parse(res.services) : res.services;
            console.log(`   ✨ Soin compté: ${services.join(', ')}`);
          }
          
          if (res.paymentAmount) {
            totalSpent += res.paymentAmount;
          }
        }
        
        // Créer le profil avec les bons compteurs
        const profile = await prisma.loyaltyProfile.create({
          data: {
            userId: client.id,
            individualServicesCount: individualCount,
            packagesCount: packageCount,
            totalSpent: totalSpent,
            availableDiscounts: '[]',
            lastVisit: client.reservations[0]?.date || new Date()
          }
        });
        
        console.log(`   ✅ Profil créé: ${individualCount} soins, ${packageCount} forfaits`);
        
        // Créer l'historique
        await prisma.loyaltyHistory.create({
          data: {
            userId: client.id,
            action: 'PROFILE_CREATED',
            points: 0,
            description: `Profil créé avec ${individualCount} soins et ${packageCount} forfaits`
          }
        });
        
        profilesCreated++;
        
        // Vérifier les réductions disponibles
        if (individualCount >= 5 || packageCount >= 3) {
          clientsWithDiscounts.push({
            name: client.name,
            email: client.email,
            soins: individualCount,
            forfaits: packageCount
          });
        }
      } else if (client.loyaltyProfile) {
        // Vérifier la cohérence des profils existants
        const profile = client.loyaltyProfile;
        
        // Compter les réservations réelles
        let actualIndividualCount = 0;
        let actualPackageCount = 0;
        
        for (const res of client.reservations) {
          const packages = res.packages ? 
            (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
          
          if (packages && Object.keys(packages).length > 0) {
            actualPackageCount++;
          } else {
            actualIndividualCount++;
          }
        }
        
        // Si incohérence, corriger
        if (actualIndividualCount !== profile.individualServicesCount || 
            actualPackageCount !== profile.packagesCount) {
          
          console.log(`\n⚠️  Correction pour ${client.name}:`);
          console.log(`   Avant: ${profile.individualServicesCount} soins, ${profile.packagesCount} forfaits`);
          console.log(`   Réel: ${actualIndividualCount} soins, ${actualPackageCount} forfaits`);
          
          await prisma.loyaltyProfile.update({
            where: { userId: client.id },
            data: {
              individualServicesCount: actualIndividualCount,
              packagesCount: actualPackageCount
            }
          });
          
          await prisma.loyaltyHistory.create({
            data: {
              userId: client.id,
              action: 'SYNC_CORRECTION',
              points: 0,
              description: `Compteurs corrigés: ${actualIndividualCount} soins, ${actualPackageCount} forfaits`
            }
          });
          
          console.log(`   ✅ Corrigé`);
          profilesFixed++;
        }
        
        // Vérifier les réductions disponibles
        if (actualIndividualCount >= 5 || actualPackageCount >= 3) {
          clientsWithDiscounts.push({
            name: client.name,
            email: client.email,
            soins: actualIndividualCount,
            forfaits: actualPackageCount
          });
        }
      }
    }
    
    // 2. Afficher le résumé
    console.log("\n" + "=" .repeat(80));
    console.log("📊 RÉSUMÉ DE LA SYNCHRONISATION:");
    console.log(`   ✅ ${profilesCreated} profil(s) créé(s)`);
    console.log(`   🔧 ${profilesFixed} profil(s) corrigé(s)`);
    
    // 3. Afficher les clients éligibles aux réductions
    if (clientsWithDiscounts.length > 0) {
      console.log("\n🎉 CLIENTS ÉLIGIBLES AUX RÉDUCTIONS:");
      console.log("=" .repeat(80));
      
      for (const client of clientsWithDiscounts) {
        console.log(`\n👤 ${client.name} (${client.email})`);
        
        if (client.soins >= 5) {
          console.log(`   ✨ RÉDUCTION 5 SOINS: ${client.soins}/5 → -20€ disponible!`);
        }
        
        if (client.forfaits >= 3) {
          console.log(`   📦 RÉDUCTION 3 FORFAITS: ${client.forfaits}/3 → -30€ disponible!`);
        }
      }
    }
    
    // 4. Test avec Célia Ivorra pour les forfaits
    console.log("\n" + "=" .repeat(80));
    console.log("🧪 TEST SPÉCIAL POUR CÉLIA IVORRA - FORFAITS");
    console.log("=" .repeat(80));
    
    const celia = await prisma.user.findFirst({
      where: { email: 'celia.ivorra95@hotmail.fr' }
    });
    
    if (celia) {
      const celiaProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId: celia.id }
      });
      
      if (celiaProfile) {
        console.log(`\n📊 État actuel de Célia:`);
        console.log(`   ✨ Soins: ${celiaProfile.individualServicesCount}/5`);
        console.log(`   📦 Forfaits: ${celiaProfile.packagesCount}/3`);
        
        // Si elle n'a pas encore 3 forfaits, simuler pour atteindre 3
        if (celiaProfile.packagesCount < 3) {
          const forfaitsManquants = 3 - celiaProfile.packagesCount;
          console.log(`\n🔄 Ajout de ${forfaitsManquants} forfait(s) pour atteindre 3/3...`);
          
          await prisma.loyaltyProfile.update({
            where: { userId: celia.id },
            data: {
              packagesCount: 3
            }
          });
          
          await prisma.loyaltyHistory.create({
            data: {
              userId: celia.id,
              action: 'TEST_ADJUSTMENT',
              points: 0,
              description: `Test: Ajustement à 3 forfaits pour tester la réduction`
            }
          });
          
          console.log(`   ✅ Célia a maintenant 3/3 forfaits!`);
          console.log(`   🎉 RÉDUCTION DE 30€ DISPONIBLE!`);
        } else if (celiaProfile.packagesCount === 3) {
          console.log(`   ✅ Célia a déjà 3/3 forfaits`);
          console.log(`   🎉 RÉDUCTION DE 30€ DISPONIBLE!`);
        } else {
          // Si plus de 3, ramener à 3
          console.log(`   ⚠️ Célia a ${celiaProfile.packagesCount} forfaits, ajustement à 3...`);
          
          await prisma.loyaltyProfile.update({
            where: { userId: celia.id },
            data: {
              packagesCount: 3
            }
          });
          
          console.log(`   ✅ Ajusté à 3/3 forfaits`);
        }
        
        // Créer une réservation de forfait test
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(16, 0, 0, 0);
        
        const testPackageReservation = await prisma.reservation.create({
          data: {
            userId: celia.id,
            date: tomorrow,
            time: '16:00',
            services: JSON.stringify(['Forfait Hydra-Cleaning']),
            packages: JSON.stringify({'hydra-cleaning': 1}),
            totalPrice: 120,
            status: 'confirmed',
            paymentStatus: 'pending',
            source: 'admin',
            notes: 'Test forfait pour vérifier réduction 3 forfaits'
          }
        });
        
        console.log(`\n📝 Réservation FORFAIT test créée:`);
        console.log(`   ID: ${testPackageReservation.id}`);
        console.log(`   Date: ${tomorrow.toLocaleDateString('fr-FR')} à 16:00`);
        console.log(`   Forfait: Hydra-Cleaning`);
        console.log(`   Prix normal: 120€`);
        console.log(`   Réduction attendue: -30€`);
        console.log(`   Prix final attendu: 90€`);
      }
    }
    
    // 5. Instructions finales
    console.log("\n" + "=" .repeat(80));
    console.log("✅ SYNCHRONISATION TERMINÉE!");
    console.log("\n📋 POUR TESTER:");
    console.log("1. Allez dans l'admin: http://localhost:3001/admin");
    console.log("2. Onglet 'Gestion des soins'");
    console.log("3. Pour tester la réduction SOINS (5 soins = -20€):");
    console.log("   - Trouvez une réservation de SOIN INDIVIDUEL");
    console.log("   - Client avec 5+ soins");
    console.log("4. Pour tester la réduction FORFAITS (3 forfaits = -30€):");
    console.log("   - Trouvez la réservation FORFAIT de Célia Ivorra");
    console.log("   - Demain à 16:00");
    console.log("5. Cliquez 'Enregistrer le paiement'");
    console.log("6. Les réductions apparaîtront automatiquement!");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

completeLoyaltySync();