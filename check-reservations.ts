import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReservations() {
  try {
    const today = new Date();
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: today
        },
        status: {
          in: ['pending', 'confirmed']
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true,
        time: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      take: 20
    });
    
    console.log('📅 Réservations à venir:');
    console.log('========================');
    
    if (reservations.length === 0) {
      console.log('Aucune réservation à venir');
    } else {
      reservations.forEach(r => {
        const date = new Date(r.date);
        const dateStr = date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        console.log(`- ${dateStr} à ${r.time} - ${r.status} (${r.user?.name || r.user?.email || 'Sans nom'})`);
      });
    }
    
    // Afficher les créneaux disponibles pour aujourd'hui et demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('\n🕐 Créneaux occupés aujourd\'hui et demain:');
    console.log('==========================================');
    
    const nearReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: today,
          lte: tomorrow
        },
        status: {
          in: ['pending', 'confirmed']
        }
      },
      select: {
        date: true,
        time: true
      }
    });
    
    nearReservations.forEach(r => {
      const date = new Date(r.date);
      console.log(`- ${date.toLocaleDateString('fr-FR')} à ${r.time} (OCCUPÉ)`);
    });
    
    if (nearReservations.length === 0) {
      console.log('Tous les créneaux sont disponibles !');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReservations();