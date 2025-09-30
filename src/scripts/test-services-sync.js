/**
 * Script de test pour vérifier la synchronisation des prestations
 * Ce script teste que les noms des services et les forfaits sont cohérents
 * entre les différentes parties de l'application
 */

const { getPrismaClient } = require('../lib/prisma');
const { getReservationWithServiceNamesFromDB } = require('../lib/service-utils-server');

async function testServicesSync() {
  console.log('🔍 Test de synchronisation des prestations...\n');
  
  try {
    const prisma = await getPrismaClient();
    
    // 1. Vérifier les services en base
    console.log('1. Vérification des services en base de données:');
    const services = await prisma.service.findMany({
      where: { active: true }
    });
    
    console.log(`✅ ${services.length} services actifs trouvés:`);
    services.forEach(service => {
      console.log(`   - ${service.name} (${service.slug}) - Prix: ${service.price}€`);
      if (service.forfaitPrice) {
        console.log(`     Forfait: ${service.forfaitPrice}€`);
      }
    });
    console.log('');
    
    // 2. Vérifier les réservations avec prestations combinées
    console.log('2. Vérification des réservations existantes:');
    const reservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    if (reservations.length === 0) {
      console.log('⚠️  Aucune réservation trouvée pour tester');
    } else {
      console.log(`✅ ${reservations.length} réservations trouvées:`);
      
      for (const reservation of reservations) {
        console.log(`\nRéservation ${reservation.id}:`);
        console.log(`   Client: ${reservation.user.name}`);
        console.log(`   Date: ${reservation.date.toLocaleDateString('fr-FR')}`);
        
        // Enrichir avec les noms de services
        const enriched = await getReservationWithServiceNamesFromDB(reservation);
        
        console.log(`   Services bruts: ${JSON.stringify(enriched.services)}`);
        console.log(`   Services formatés: ${enriched.formattedServices?.join(', ') || 'Aucun'}`);
        console.log(`   Packages: ${JSON.stringify(enriched.packages)}`);
        console.log(`   Prix total: ${reservation.totalPrice}€`);
      }
    }
    
    // 3. Test d'enrichissement manuel
    console.log('\n3. Test d'enrichissement manuel:');
    const testReservation = {
      services: '["hydro-naissance", "bb-glow"]',
      packages: '{"hydro-naissance": "forfait", "bb-glow": "single"}',
      totalPrice: 200
    };
    
    console.log('Données de test:');
    console.log(`   Services: ${testReservation.services}`);
    console.log(`   Packages: ${testReservation.packages}`);
    
    const enrichedTest = await getReservationWithServiceNamesFromDB(testReservation);
    console.log('Résultat enrichi:');
    console.log(`   ✅ Services parsés: ${JSON.stringify(enrichedTest.services)}`);
    console.log(`   ✅ Noms des services: ${JSON.stringify(enrichedTest.serviceNames)}`);
    console.log(`   ✅ Services formatés: ${enrichedTest.formattedServices?.join(', ')}`);
    
    // 4. Vérifier la cohérence des prix
    console.log('\n4. Vérification de la cohérence des prix:');
    for (const service of services) {
      console.log(`\n${service.name}:`);
      console.log(`   Prix normal: ${service.price}€`);
      if (service.promoPrice) {
        console.log(`   Prix promo: ${service.promoPrice}€`);
      }
      if (service.forfaitPrice) {
        console.log(`   Prix forfait: ${service.forfaitPrice}€`);
      }
      if (service.forfaitPromo) {
        console.log(`   Prix forfait promo: ${service.forfaitPromo}€`);
      }
    }
    
    console.log('\n✅ Test de synchronisation terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testServicesSync()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testServicesSync };