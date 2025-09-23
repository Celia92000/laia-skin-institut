import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
});

async function fixReservations() {
  try {
    console.log('🔧 Correction des réservations sans service...\n');
    
    // Récupérer tous les services
    const services = await prisma.service.findMany();
    console.log(`📋 ${services.length} services trouvés:`);
    services.forEach(s => console.log(`  - ${s.name} (${s.id})`));
    
    // Récupérer les réservations sans service
    const reservations = await prisma.reservation.findMany({
      where: {
        serviceId: null
      }
    });
    
    console.log(`\n🔍 ${reservations.length} réservations sans service trouvées`);
    
    if (services.length === 0) {
      console.log('❌ Aucun service trouvé dans la base de données');
      return;
    }
    
    // Assigner un service aléatoire à chaque réservation
    for (const reservation of reservations) {
      const randomService = services[Math.floor(Math.random() * services.length)];
      
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { 
          serviceId: randomService.id,
          totalPrice: reservation.totalPrice || randomService.price
        }
      });
      
      console.log(`✅ Réservation ${reservation.id} liée au service "${randomService.name}"`);
    }
    
    // Vérifier le résultat
    const updatedReservations = await prisma.reservation.findMany({
      include: { service: true }
    });
    
    console.log('\n📊 Résumé des réservations par service:');
    const serviceCount: Record<string, number> = {};
    updatedReservations.forEach(r => {
      const serviceName = r.service?.name || 'Sans service';
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });
    
    Object.entries(serviceCount).forEach(([service, count]) => {
      console.log(`  - ${service}: ${count} réservations`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReservations();