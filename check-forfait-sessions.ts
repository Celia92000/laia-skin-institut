import { getPrismaClient } from './src/lib/prisma';

async function checkForfaitSessions() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔍 ANALYSE DES FORFAITS ET SÉANCES");
    console.log("=" .repeat(80));
    
    // Récupérer les clients avec des forfaits
    const profiles = await prisma.loyaltyProfile.findMany({
      where: {
        packagesCount: { gt: 0 }
      },
      include: {
        user: true
      }
    });
    
    console.log(`\n📊 Clients avec forfaits: ${profiles.length}`);
    
    for (const profile of profiles) {
      console.log(`\n👤 ${profile.user.name} (${profile.user.email})`);
      console.log(`   Forfaits complétés: ${profile.packagesCount}/3`);
      
      // Récupérer les réservations avec forfaits
      const forfaitReservations = await prisma.reservation.findMany({
        where: {
          userId: profile.userId,
          OR: [
            { services: { contains: 'Forfait' } },
            { services: { contains: 'forfait' } }
          ]
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      console.log(`   Réservations forfait trouvées: ${forfaitReservations.length}`);
      
      // Analyser chaque forfait
      const forfaitAnalysis: { [key: string]: number } = {};
      
      for (const res of forfaitReservations) {
        const services = typeof res.services === 'string' 
          ? JSON.parse(res.services) 
          : res.services;
        
        const packages = res.packages 
          ? (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages)
          : {};
        
        // Compter les séances par type de forfait
        for (const service of services) {
          if (service.toLowerCase().includes('forfait')) {
            if (!forfaitAnalysis[service]) {
              forfaitAnalysis[service] = 0;
            }
            forfaitAnalysis[service]++;
          }
        }
      }
      
      // Afficher l'analyse
      if (Object.keys(forfaitAnalysis).length > 0) {
        console.log("   📦 Détail des forfaits:");
        for (const [forfaitName, count] of Object.entries(forfaitAnalysis)) {
          const forfaitsCompletes = Math.floor(count / 3);
          const seancesEnCours = count % 3;
          
          console.log(`      • ${forfaitName}:`);
          console.log(`        Total séances: ${count}`);
          console.log(`        Forfaits complets: ${forfaitsCompletes}`);
          if (seancesEnCours > 0) {
            console.log(`        Forfait en cours: ${seancesEnCours}/3 séances`);
            console.log(`        Séances restantes: ${3 - seancesEnCours}`);
          }
        }
      }
      
      // Calculer où on en est dans la progression vers la réduction
      const totalForfaitsCompletes = profile.packagesCount;
      const positionDansLeCycle = totalForfaitsCompletes % 3;
      
      console.log("\n   🎯 Progression vers la réduction:");
      if (totalForfaitsCompletes >= 3) {
        console.log(`      ✅ RÉDUCTION DISPONIBLE: -40€`);
        console.log(`      Total forfaits: ${totalForfaitsCompletes} (cycle complet de 3)`);
      } else {
        console.log(`      Position dans le cycle: ${positionDansLeCycle}/3`);
        
        if (positionDansLeCycle === 0) {
          console.log(`      📍 Prochain forfait sera le 1er/3`);
        } else if (positionDansLeCycle === 1) {
          console.log(`      📍 Actuellement au 1er forfait, encore 2 forfaits avant réduction`);
        } else if (positionDansLeCycle === 2) {
          console.log(`      📍 Actuellement au 2e forfait, encore 1 forfait avant réduction`);
        }
      }
    }
    
    console.log("\n" + "=" .repeat(80));
    console.log("✅ Analyse terminée!");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkForfaitSessions();