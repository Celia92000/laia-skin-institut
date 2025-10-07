import { getPrismaClient } from '../src/lib/prisma';

async function testForfaitCounting() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔍 TEST: COMMENT SONT COMPTÉS LES FORFAITS");
    console.log("=" .repeat(80));
    
    // Récupérer Célia Ivorra qui a 2 forfaits
    const celia = await prisma.user.findUnique({
      where: { email: 'celia.ivorra95@hotmail.fr' },
      include: {
        loyaltyProfile: true
      }
    });
    
    if (celia && celia.loyaltyProfile) {
      console.log(`\n👤 ${celia.name}`);
      console.log(`   packagesCount actuel: ${celia.loyaltyProfile.packagesCount}`);
      
      // Récupérer toutes ses réservations avec forfaits
      const reservations = await prisma.reservation.findMany({
        where: {
          userId: celia.id,
          status: 'completed',
          OR: [
            { services: { contains: 'Forfait' } },
            { services: { contains: 'forfait' } }
          ]
        },
        orderBy: { date: 'asc' }
      });
      
      console.log(`\n📦 Réservations avec forfaits trouvées: ${reservations.length}`);
      
      // Analyser chaque réservation
      let forfaitCount = 0;
      const forfaitTypes: { [key: string]: number } = {};
      
      for (const res of reservations) {
        const services = typeof res.services === 'string' 
          ? JSON.parse(res.services) 
          : res.services;
        
        console.log(`\n   Date: ${new Date(res.date).toLocaleDateString('fr-FR')}`);
        console.log(`   Services: ${JSON.stringify(services)}`);
        console.log(`   Packages: ${res.packages}`);
        
        // Compter ce forfait
        if (Array.isArray(services)) {
          for (const service of services) {
            if (service.toLowerCase().includes('forfait')) {
              forfaitCount++;
              const type = service;
              forfaitTypes[type] = (forfaitTypes[type] || 0) + 1;
            }
          }
        }
      }
      
      console.log("\n📊 RÉSUMÉ:");
      console.log(`   Total de réservations forfait: ${forfaitCount}`);
      console.log(`   packagesCount en base: ${celia.loyaltyProfile.packagesCount}`);
      
      console.log("\n   Détail par type de forfait:");
      for (const [type, count] of Object.entries(forfaitTypes)) {
        console.log(`   - ${type}: ${count} séance(s)`);
        const forfaitsCompletes = Math.floor(count / 4);
        const seancesEnCours = count % 4;
        console.log(`     = ${forfaitsCompletes} forfait(s) complet(s) + ${seancesEnCours} séance(s) en cours`);
      }
      
      console.log("\n💡 INTERPRÉTATION:");
      console.log("   Le packagesCount représente probablement:");
      console.log("   - Soit le nombre de FORFAITS COMPLÉTÉS (groupes de 4 séances)");
      console.log("   - Soit le nombre de RÉSERVATIONS de type forfait");
      
      if (celia.loyaltyProfile.packagesCount === forfaitCount) {
        console.log("\n   ✅ packagesCount = nombre de RÉSERVATIONS forfait");
      } else if (celia.loyaltyProfile.packagesCount === Math.floor(forfaitCount / 4)) {
        console.log("\n   ✅ packagesCount = nombre de FORFAITS COMPLÉTÉS (4 séances)");
      } else {
        console.log("\n   ⚠️  packagesCount ne correspond ni aux réservations ni aux forfaits complets");
      }
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testForfaitCounting();