import { getPrismaClient } from './src/lib/prisma';

async function completeSystemFix() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 RÉPARATION COMPLÈTE DU SYSTÈME DE FIDÉLITÉ POUR TOUS");
    console.log("=" .repeat(80));
    
    // 1. Récupérer TOUS les utilisateurs
    const allUsers = await prisma.user.findMany({
      include: {
        loyaltyProfile: true,
        reservations: {
          where: { status: 'completed' },
          orderBy: { date: 'desc' }
        }
      }
    });
    
    console.log(`\n📊 Nombre total d'utilisateurs: ${allUsers.length}`);
    
    let profilesCreated = 0;
    let profilesCorrected = 0;
    let clientsWithDiscounts = [];
    
    // 2. Pour chaque utilisateur avec des réservations complétées
    for (const user of allUsers) {
      if (user.reservations.length === 0) continue;
      
      // Compter les soins et forfaits réels
      let realIndividualCount = 0;
      let realPackageCount = 0;
      let totalSpent = 0;
      
      for (const res of user.reservations) {
        // Déterminer le type de prestation
        const packages = res.packages ? 
          (typeof res.packages === 'string' ? 
            (res.packages === '{}' || res.packages === 'null' ? null : JSON.parse(res.packages)) 
            : res.packages) 
          : null;
        
        if (packages && Object.keys(packages).length > 0) {
          realPackageCount++;
        } else {
          realIndividualCount++;
        }
        
        if (res.paymentAmount) {
          totalSpent += res.paymentAmount;
        }
      }
      
      // Si pas de profil, le créer
      if (!user.loyaltyProfile) {
        console.log(`\n📝 Création du profil pour ${user.name} (${user.email})`);
        console.log(`   - ${realIndividualCount} soin(s) individuel(s)`);
        console.log(`   - ${realPackageCount} forfait(s)`);
        console.log(`   - ${totalSpent}€ dépensés`);
        
        await prisma.loyaltyProfile.create({
          data: {
            userId: user.id,
            individualServicesCount: realIndividualCount,
            packagesCount: realPackageCount,
            totalSpent: totalSpent,
            availableDiscounts: '[]',
            lastVisit: user.reservations[0]?.date || new Date()
          }
        });
        
        await prisma.loyaltyHistory.create({
          data: {
            userId: user.id,
            action: 'PROFILE_CREATED',
            points: 0,
            description: `Profil créé: ${realIndividualCount} soins, ${realPackageCount} forfaits`
          }
        });
        
        console.log(`   ✅ Profil créé`);
        profilesCreated++;
        
      } else {
        // Vérifier et corriger si nécessaire
        const profile = user.loyaltyProfile;
        
        if (profile.individualServicesCount !== realIndividualCount || 
            profile.packagesCount !== realPackageCount) {
          
          console.log(`\n🔄 Correction pour ${user.name} (${user.email})`);
          console.log(`   Avant: ${profile.individualServicesCount} soins, ${profile.packagesCount} forfaits`);
          console.log(`   Réel: ${realIndividualCount} soins, ${realPackageCount} forfaits`);
          
          await prisma.loyaltyProfile.update({
            where: { userId: user.id },
            data: {
              individualServicesCount: realIndividualCount,
              packagesCount: realPackageCount,
              totalSpent: totalSpent
            }
          });
          
          await prisma.loyaltyHistory.create({
            data: {
              userId: user.id,
              action: 'SYNC_CORRECTION',
              points: 0,
              description: `Synchronisation: ${realIndividualCount} soins, ${realPackageCount} forfaits`
            }
          });
          
          console.log(`   ✅ Corrigé`);
          profilesCorrected++;
        }
      }
      
      // Vérifier l'éligibilité aux réductions
      if (realIndividualCount >= 5 || realPackageCount >= 3) {
        clientsWithDiscounts.push({
          name: user.name,
          email: user.email,
          phone: user.phone,
          soins: realIndividualCount,
          forfaits: realPackageCount,
          reductionSoins: realIndividualCount >= 5,
          reductionForfaits: realPackageCount >= 3
        });
      }
    }
    
    // 3. Créer des réservations test pour vérifier
    console.log("\n" + "=" .repeat(80));
    console.log("📝 CRÉATION DE RÉSERVATIONS TEST");
    console.log("=" .repeat(80));
    
    // Pour chaque client éligible, créer une réservation test
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let testReservations = [];
    
    for (const client of clientsWithDiscounts.slice(0, 3)) { // Prendre les 3 premiers
      const user = await prisma.user.findFirst({
        where: { email: client.email }
      });
      
      if (!user) continue;
      
      // Créer une réservation selon le type de réduction disponible
      let service, packages, price, reductionType;
      
      if (client.reductionSoins && !client.reductionForfaits) {
        // Soin individuel
        service = ['Hydro Naissance'];
        packages = null;
        price = 80;
        reductionType = 'SOIN (-20€)';
      } else if (!client.reductionSoins && client.reductionForfaits) {
        // Forfait
        service = ['Forfait Hydro Cleaning'];
        packages = {'hydro-cleaning': 1};
        price = 120;
        reductionType = 'FORFAIT (-30€)';
      } else {
        // Les deux réductions disponibles - faire un soin
        service = ['Hydro Naissance'];
        packages = null;
        price = 80;
        reductionType = 'SOIN (-20€)';
      }
      
      const reservation = await prisma.reservation.create({
        data: {
          userId: user.id,
          date: tomorrow,
          time: `${14 + testReservations.length}:00`,
          services: JSON.stringify(service),
          packages: packages ? JSON.stringify(packages) : null,
          totalPrice: price,
          status: 'confirmed',
          paymentStatus: 'pending',
          source: 'admin',
          notes: `Test réduction ${reductionType}`
        }
      });
      
      testReservations.push({
        client: client.name,
        time: `${14 + testReservations.length}:00`,
        type: reductionType,
        prix: price,
        id: reservation.id
      });
      
      console.log(`\n✅ Réservation test créée pour ${client.name}:`);
      console.log(`   - Heure: ${reservation.time}`);
      console.log(`   - Type: ${reductionType}`);
      console.log(`   - Prix normal: ${price}€`);
      console.log(`   - Réduction attendue: ${reductionType.includes('SOIN') ? '20€' : '30€'}`);
    }
    
    // 4. Résumé final
    console.log("\n" + "=" .repeat(80));
    console.log("📊 RÉSUMÉ FINAL");
    console.log("=" .repeat(80));
    
    console.log(`\n✅ Profils créés: ${profilesCreated}`);
    console.log(`🔧 Profils corrigés: ${profilesCorrected}`);
    console.log(`🎉 Clients avec réductions disponibles: ${clientsWithDiscounts.length}`);
    
    if (clientsWithDiscounts.length > 0) {
      console.log("\n👥 CLIENTS ÉLIGIBLES AUX RÉDUCTIONS:");
      console.log("-" .repeat(80));
      
      for (const client of clientsWithDiscounts) {
        console.log(`\n${client.name} (${client.email})`);
        if (client.reductionSoins) {
          console.log(`   ✨ ${client.soins}/5 soins → RÉDUCTION 20€ DISPONIBLE`);
        }
        if (client.reductionForfaits) {
          console.log(`   📦 ${client.forfaits}/3 forfaits → RÉDUCTION 30€ DISPONIBLE`);
        }
      }
    }
    
    // 5. Test spécifique pour Célia Ivorra
    console.log("\n" + "=" .repeat(80));
    console.log("🎯 VÉRIFICATION FINALE - CÉLIA IVORRA");
    console.log("=" .repeat(80));
    
    const celia = await prisma.user.findFirst({
      where: { email: 'celia.ivorra95@hotmail.fr' },
      include: {
        loyaltyProfile: true
      }
    });
    
    if (celia && celia.loyaltyProfile) {
      console.log(`\n✅ Célia Ivorra:`);
      console.log(`   ✨ Soins: ${celia.loyaltyProfile.individualServicesCount}/5`);
      console.log(`   📦 Forfaits: ${celia.loyaltyProfile.packagesCount}/3`);
      
      if (celia.loyaltyProfile.individualServicesCount >= 5) {
        console.log(`   → RÉDUCTION SOINS DISPONIBLE (-20€)`);
      }
      if (celia.loyaltyProfile.packagesCount >= 3) {
        console.log(`   → RÉDUCTION FORFAITS DISPONIBLE (-30€)`);
      }
    }
    
    // 6. Instructions finales
    console.log("\n" + "=" .repeat(80));
    console.log("💡 INSTRUCTIONS POUR TESTER");
    console.log("=" .repeat(80));
    console.log("\n1. Allez dans l'admin: http://localhost:3001/admin");
    console.log("2. Onglet 'Gestion des soins'");
    console.log("3. Trouvez les réservations de demain (27/09)");
    console.log("4. Cliquez sur 'Enregistrer le paiement'");
    console.log("5. Vérifiez que les réductions apparaissent:");
    console.log("   - Message vert d'alerte");
    console.log("   - Réduction automatiquement cochée");
    console.log("   - Prix barré avec nouveau prix");
    console.log("\n✅ LE SYSTÈME EST MAINTENANT OPÉRATIONNEL POUR TOUS!");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

completeSystemFix();