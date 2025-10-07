import { getPrismaClient } from '../src/lib/prisma';

async function testBlockedSlots() {
  const prisma = await getPrismaClient();
  
  try {
    // Supprimer les anciens tests
    await prisma.blockedSlot.deleteMany({
      where: {
        reason: 'Test automatique'
      }
    });
    
    // Ajouter quelques créneaux bloqués pour test
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    // Bloquer une journée entière demain
    await prisma.blockedSlot.create({
      data: {
        date: tomorrow,
        allDay: true,
        reason: 'Test automatique - Journée complète bloquée'
      }
    });
    
    // Bloquer des créneaux spécifiques après-demain
    await prisma.blockedSlot.createMany({
      data: [
        {
          date: dayAfterTomorrow,
          allDay: false,
          time: '14:00',
          reason: 'Test automatique - Créneau 14h'
        },
        {
          date: dayAfterTomorrow,
          allDay: false,
          time: '15:00',
          reason: 'Test automatique - Créneau 15h'
        },
        {
          date: dayAfterTomorrow,
          allDay: false,
          time: '16:00',
          reason: 'Test automatique - Créneau 16h'
        }
      ]
    });
    
    console.log('✅ Créneaux bloqués créés pour les tests :');
    console.log(`- ${tomorrow.toISOString().split('T')[0]} : Journée complète bloquée`);
    console.log(`- ${dayAfterTomorrow.toISOString().split('T')[0]} : Créneaux 14h, 15h, 16h bloqués`);
    
    // Vérifier ce qui a été créé
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: { reason: 'Test automatique' },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });
    
    console.log('\n📋 Créneaux bloqués dans la base :');
    blockedSlots.forEach(slot => {
      const dateStr = slot.date.toISOString().split('T')[0];
      if (slot.allDay) {
        console.log(`  ${dateStr} : Toute la journée (${slot.reason})`);
      } else {
        console.log(`  ${dateStr} à ${slot.time} (${slot.reason})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testBlockedSlots();