import { getPrismaClient } from './src/lib/prisma';

async function fixPackageDetection() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 CORRECTION DE LA DÉTECTION DES FORFAITS");
    console.log("=" .repeat(80));
    
    // Récupérer toutes les réservations
    const allReservations = await prisma.reservation.findMany({
      include: {
        user: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log(`\n📊 Nombre total de réservations: ${allReservations.length}`);
    
    let corrected = 0;
    
    for (const res of allReservations) {
      const services = typeof res.services === 'string' ? JSON.parse(res.services) : res.services;
      const currentPackages = res.packages ? 
        (typeof res.packages === 'string' ? 
          (res.packages === '{}' || res.packages === 'null' ? null : JSON.parse(res.packages)) 
          : res.packages) 
        : null;
      
      // Vérifier si le nom du service contient "Forfait"
      let shouldBePackage = false;
      let packageType = null;
      
      if (Array.isArray(services)) {
        for (const service of services) {
          const serviceLower = service.toLowerCase();
          if (serviceLower.includes('forfait')) {
            shouldBePackage = true;
            
            // Déterminer le type de forfait
            if (serviceLower.includes('hydra-cleaning') || serviceLower.includes('hydro-cleaning')) {
              packageType = 'hydra-cleaning';
            } else if (serviceLower.includes('hydra-naissance') || serviceLower.includes('hydro-naissance')) {
              packageType = 'hydra-naissance';
            } else if (serviceLower.includes('renaissance')) {
              packageType = 'renaissance';
            } else if (serviceLower.includes('bb-glow') || serviceLower.includes('bb glow')) {
              packageType = 'bb-glow';
            } else {
              packageType = 'forfait-custom';
            }
            break;
          }
        }
      }
      
      // Si c'est un forfait mais que packages est vide ou null
      if (shouldBePackage && (!currentPackages || Object.keys(currentPackages).length === 0)) {
        console.log(`\n⚠️  Réservation incohérente trouvée:`);
        console.log(`   ID: ${res.id}`);
        console.log(`   Client: ${res.user?.name || 'Inconnu'}`);
        console.log(`   Services: ${services.join(', ')}`);
        console.log(`   Packages actuel: ${res.packages}`);
        console.log(`   → Devrait être un FORFAIT (${packageType})`);
        
        // Corriger en ajoutant le package
        const newPackages = { [packageType]: 1 };
        
        await prisma.reservation.update({
          where: { id: res.id },
          data: {
            packages: JSON.stringify(newPackages)
          }
        });
        
        console.log(`   ✅ Corrigé: packages = ${JSON.stringify(newPackages)}`);
        corrected++;
      }
      
      // Cas inverse: pas de "forfait" dans le nom mais packages rempli
      if (!shouldBePackage && currentPackages && Object.keys(currentPackages).length > 0) {
        console.log(`\n⚠️  Réservation incohérente trouvée:`);
        console.log(`   ID: ${res.id}`);
        console.log(`   Client: ${res.user?.name || 'Inconnu'}`);
        console.log(`   Services: ${services.join(', ')}`);
        console.log(`   Packages actuel: ${res.packages}`);
        console.log(`   → Devrait être un SOIN INDIVIDUEL`);
        
        // Corriger en vidant packages
        await prisma.reservation.update({
          where: { id: res.id },
          data: {
            packages: '{}'
          }
        });
        
        console.log(`   ✅ Corrigé: packages = null`);
        corrected++;
      }
    }
    
    // Vérification spécifique pour Célia Ivorra
    console.log("\n" + "=" .repeat(80));
    console.log("🎯 VÉRIFICATION POUR CÉLIA IVORRA");
    console.log("=" .repeat(80));
    
    const celiaReservations = await prisma.reservation.findMany({
      where: {
        user: {
          email: 'celia.ivorra95@hotmail.fr'
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log(`\n📅 Réservations de Célia Ivorra:`);
    for (const res of celiaReservations.slice(0, 10)) {
      const services = typeof res.services === 'string' ? JSON.parse(res.services) : res.services;
      const packages = res.packages ? 
        (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
      
      const type = packages && Object.keys(packages).length > 0 ? 'FORFAIT' : 'SOIN';
      
      console.log(`\n   Date: ${res.date.toLocaleDateString('fr-FR')} ${res.time}`);
      console.log(`   Services: ${services.join(', ')}`);
      console.log(`   Type détecté: ${type}`);
      console.log(`   Packages: ${res.packages}`);
      console.log(`   Statut: ${res.status}`);
    }
    
    // Résumé
    console.log("\n" + "=" .repeat(80));
    console.log(`✅ CORRECTION TERMINÉE`);
    console.log(`   - ${corrected} réservation(s) corrigée(s)`);
    console.log("\n💡 Les forfaits sont maintenant correctement détectés!");
    console.log("   - Si le service contient 'Forfait' → Type FORFAIT");
    console.log("   - Sinon → Type SOIN INDIVIDUEL");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPackageDetection();