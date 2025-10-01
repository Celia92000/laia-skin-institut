import { getPrismaClient } from './src/lib/prisma';

async function createTestReservation() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("📝 CRÉATION D'UNE RÉSERVATION TEST POUR CÉLIA IVORRA");
    console.log("=" .repeat(80));
    
    // Trouver Célia Ivorra
    const celia = await prisma.user.findFirst({
      where: {
        email: 'celia.ivorra95@hotmail.fr'
      }
    });
    
    if (!celia) {
      console.log("❌ Célia Ivorra non trouvée");
      return;
    }
    
    // Créer une nouvelle réservation pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: celia.id,
        date: tomorrow,
        time: '14:00',
        services: JSON.stringify(['Soin Hydra-Facial']),
        totalPrice: 80,
        status: 'confirmed',
        paymentStatus: 'pending',
        source: 'admin',
        notes: 'Réservation test pour vérifier la réduction fidélité'
      }
    });
    
    console.log("\n✅ Réservation créée:");
    console.log(`   ID: ${reservation.id}`);
    console.log(`   Client: ${celia.name}`);
    console.log(`   Date: ${reservation.date.toLocaleDateString('fr-FR')} à ${reservation.time}`);
    console.log(`   Service: Soin Hydra-Facial`);
    console.log(`   Prix: ${reservation.totalPrice}€`);
    
    // Vérifier le profil de fidélité
    const profile = await prisma.loyaltyProfile.findUnique({
      where: { userId: celia.id }
    });
    
    console.log("\n📊 Profil de fidélité:");
    console.log(`   ✨ Soins: ${profile!.individualServicesCount}/5`);
    
    if (profile!.individualServicesCount === 5) {
      console.log("\n🎉 RÉDUCTION DISPONIBLE!");
      console.log("   → Prix normal: 80€");
      console.log("   → Réduction fidélité: -20€");
      console.log("   → Prix final: 60€");
    }
    
    console.log("\n📋 INSTRUCTIONS POUR TESTER:");
    console.log("1. Allez dans l'admin : http://localhost:3001/admin");
    console.log("2. Onglet 'Gestion des soins'");
    console.log("3. Trouvez la réservation de Célia Ivorra pour demain");
    console.log("4. Cliquez sur 'Enregistrer le paiement'");
    console.log("5. La réduction de 20€ devrait apparaître automatiquement !");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReservation();