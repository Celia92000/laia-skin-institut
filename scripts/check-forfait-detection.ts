import { getPrismaClient } from './src/lib/prisma';

async function checkForfaitDetection() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔍 VÉRIFICATION DE LA DÉTECTION FORFAIT/SOIN");
    console.log("=" .repeat(80));
    
    // Trouver les réservations avec "Forfait" dans le nom
    const reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          { services: { contains: 'Forfait' } },
          { services: { contains: 'forfait' } }
        ]
      },
      include: {
        user: true
      },
      take: 10
    });
    
    console.log(`\n📊 Réservations avec "Forfait" trouvées: ${reservations.length}`);
    
    for (const res of reservations) {
      console.log(`\n📝 Réservation ${res.id}:`);
      console.log(`   Client: ${res.user?.name || 'Inconnu'}`);
      console.log(`   Services: ${res.services}`);
      console.log(`   Packages: ${res.packages}`);
      
      const services = typeof res.services === 'string' ? 
        JSON.parse(res.services) : res.services;
      const packages = res.packages ? 
        (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
      
      const hasPackages = packages && Object.keys(packages).length > 0;
      
      if (!hasPackages && services.some((s: string) => s.toLowerCase().includes('forfait'))) {
        console.log(`   ❌ PROBLÈME: Service "Forfait" mais packages vide!`);
        
        // Déterminer le type de forfait
        let packageType = 'forfait-custom';
        const serviceName = services[0].toLowerCase();
        
        if (serviceName.includes('hydra-cleaning') || serviceName.includes('hydro-cleaning')) {
          packageType = 'hydra-cleaning';
        } else if (serviceName.includes('hydra-naissance') || serviceName.includes('hydro-naissance')) {
          packageType = 'hydra-naissance';
        } else if (serviceName.includes('renaissance')) {
          packageType = 'renaissance';
        } else if (serviceName.includes('bb-glow') || serviceName.includes('bb glow')) {
          packageType = 'bb-glow';
        }
        
        console.log(`   → Correction: ajout du package "${packageType}"`);
        
        // Corriger
        await prisma.reservation.update({
          where: { id: res.id },
          data: {
            packages: JSON.stringify({ [packageType]: 1 })
          }
        });
        
        console.log(`   ✅ Corrigé!`);
      } else if (hasPackages) {
        console.log(`   ✅ OK: Détecté comme FORFAIT`);
      }
    }
    
    // Vérifier spécifiquement pour Célia Ivorra
    console.log("\n" + "=" .repeat(80));
    console.log("🎯 VÉRIFICATION CÉLIA IVORRA");
    console.log("=" .repeat(80));
    
    const celiaRes = await prisma.reservation.findMany({
      where: {
        user: {
          email: 'celia.ivorra95@hotmail.fr'
        },
        date: {
          gte: new Date('2025-09-27T00:00:00Z'),
          lt: new Date('2025-09-28T00:00:00Z')
        }
      }
    });
    
    for (const res of celiaRes) {
      console.log(`\n📅 ${res.time}:`);
      console.log(`   Services: ${res.services}`);
      console.log(`   Packages: ${res.packages}`);
      
      const services = typeof res.services === 'string' ? 
        JSON.parse(res.services) : res.services;
      const packages = res.packages ? 
        (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
      
      const hasPackages = packages && Object.keys(packages).length > 0;
      const hasForfaitInName = services.some((s: string) => s.toLowerCase().includes('forfait'));
      
      if (hasForfaitInName && !hasPackages) {
        console.log(`   ❌ INCOHÉRENCE: "Forfait" dans le nom mais pas de package!`);
      } else if (hasForfaitInName && hasPackages) {
        console.log(`   ✅ OK: Forfait correctement configuré`);
      } else if (!hasForfaitInName && !hasPackages) {
        console.log(`   ✅ OK: Soin individuel`);
      }
    }
    
    console.log("\n✅ Vérification terminée!");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkForfaitDetection();