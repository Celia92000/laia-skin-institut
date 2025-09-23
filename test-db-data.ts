import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
});

async function testDatabase() {
  try {
    console.log('🔍 Test de connexion à la base de données Supabase...\n');
    
    // Tester la connexion
    await prisma.$connect();
    console.log('✅ Connexion réussie!\n');
    
    // Compter les réservations
    const reservationCount = await prisma.reservation.count();
    console.log(`📅 Nombre total de réservations: ${reservationCount}`);
    
    // Réservations du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthReservations = await prisma.reservation.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
    console.log(`📅 Réservations ce mois: ${monthReservations}`);
    
    // Réservations cette semaine
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekReservations = await prisma.reservation.count({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });
    console.log(`📅 Réservations cette semaine: ${weekReservations}`);
    
    // Réservations aujourd'hui
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayReservations = await prisma.reservation.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    console.log(`📅 Réservations aujourd'hui: ${todayReservations}`);
    
    // Afficher quelques réservations
    const sampleReservations = await prisma.reservation.findMany({
      take: 5,
      include: {
        service: true,
        user: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log('\n📋 Échantillon de réservations:');
    sampleReservations.forEach(r => {
      console.log(`  - ${r.date} | ${r.time} | ${r.service?.name || 'Service inconnu'} | ${r.status} | ${r.totalPrice}€`);
    });
    
    // Compter les services
    const serviceCount = await prisma.service.count();
    console.log(`\n💆 Nombre de services: ${serviceCount}`);
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`👥 Nombre d'utilisateurs: ${userCount}`);
    
    // Afficher les revenus
    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['confirmed', 'completed'] }
      }
    });
    
    const totalRevenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    console.log(`\n💰 Chiffre d'affaires total: ${totalRevenue}€`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();