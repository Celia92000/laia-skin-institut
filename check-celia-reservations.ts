import { getPrismaClient } from './src/lib/prisma';

async function checkCeliaReservations() {
  const prisma = await getPrismaClient();
  
  try {
    // Trouver Celia
    const celia = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Celia', mode: 'insensitive' } },
          { email: { contains: 'celia', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!celia) {
      console.log("❌ Utilisateur Celia non trouvé");
      return;
    }
    
    console.log("👤 Celia trouvée:", celia.name, "-", celia.email);
    
    // Toutes les réservations de Celia
    const allReservations = await prisma.reservation.findMany({
      where: { userId: celia.id },
      orderBy: { date: 'desc' }
    });
    
    console.log("\n📋 Total des réservations:", allReservations.length);
    
    // Grouper par statut
    const byStatus = allReservations.reduce((acc, res) => {
      acc[res.status] = (acc[res.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("\n📊 Répartition par statut:");
    for (const [status, count] of Object.entries(byStatus)) {
      console.log(`  - ${status}: ${count}`);
    }
    
    console.log("\n📝 Détail des 5 dernières réservations:");
    for (const res of allReservations.slice(0, 5)) {
      console.log(`\n  ID: ${res.id}`);
      console.log(`  Date: ${res.date.toLocaleDateString('fr-FR')} ${res.time}`);
      console.log(`  Statut: ${res.status}`);
      console.log(`  Paiement: ${res.paymentStatus} (${res.paymentAmount}€)`);
      console.log(`  Services: ${res.services}`);
      console.log(`  Forfaits: ${res.packages || 'Aucun'}`);
      
      // Déterminer le type de prestation
      const packages = res.packages ? 
        (typeof res.packages === 'string' ? JSON.parse(res.packages) : res.packages) : null;
      
      if (packages && Object.keys(packages).length > 0) {
        console.log(`  ➡️ Type: FORFAIT`);
      } else {
        console.log(`  ➡️ Type: SOIN INDIVIDUEL`);
      }
    }
    
    // Simuler le passage en completed pour voir l'effet
    console.log("\n\n💡 Pour marquer une réservation comme complétée et incrémenter le compteur fidélité:");
    console.log("   1. Dans l'admin, onglet 'Gestion des soins'");
    console.log("   2. Cliquer sur 'Enregistrer le paiement' pour la réservation");
    console.log("   3. Indiquer que le client était présent");
    console.log("   4. Valider → Le statut passera à 'completed' et le compteur sera incrémenté");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCeliaReservations();