import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAvailability() {
  try {
    const testDate = '2025-09-26'; // Demain
    const testTime = '14:30';
    
    console.log('🔍 Test de disponibilité pour:', testDate, 'à', testTime);
    
    // Test 1: Date directe
    const date1 = new Date(testDate);
    console.log('Date créée avec new Date():', date1.toISOString());
    
    // Test 2: Recherche de réservations
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        date: date1,
        time: testTime,
        status: {
          notIn: ['cancelled']
        }
      }
    });
    
    console.log('Réservation trouvée avec date1?', existingReservation ? 'OUI' : 'NON');
    
    // Test 3: Normaliser la date
    const date2 = new Date(testDate);
    date2.setHours(0, 0, 0, 0);
    console.log('Date normalisée:', date2.toISOString());
    
    const existingReservation2 = await prisma.reservation.findFirst({
      where: {
        date: date2,
        time: testTime,
        status: {
          notIn: ['cancelled']
        }
      }
    });
    
    console.log('Réservation trouvée avec date normalisée?', existingReservation2 ? 'OUI' : 'NON');
    
    // Test 4: Voir toutes les réservations demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    const allReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: tomorrow,
          lte: tomorrowEnd
        },
        status: {
          notIn: ['cancelled']
        }
      },
      select: {
        date: true,
        time: true,
        status: true
      }
    });
    
    console.log('\n📅 Toutes les réservations de demain:');
    allReservations.forEach(r => {
      console.log(`- ${r.date.toISOString()} à ${r.time} (${r.status})`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAvailability();