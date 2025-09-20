import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkWorkingHours() {
  try {
    console.log('Vérification des horaires de travail...\n');
    
    // Récupérer tous les horaires
    const workingHours = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    if (workingHours.length === 0) {
      console.log('❌ Aucun horaire de travail configuré dans la base de données!');
      console.log('Création des horaires par défaut...\n');
      
      // Créer les horaires par défaut
      for (let i = 0; i < 7; i++) {
        const isWeekend = i === 0 || i === 6;
        await prisma.workingHours.create({
          data: {
            dayOfWeek: i,
            isOpen: !isWeekend,
            startTime: isWeekend ? '09:00' : '09:00',
            endTime: isWeekend ? '18:00' : '19:00'
          }
        });
      }
      
      console.log('✅ Horaires créés avec succès!');
      
      // Récupérer à nouveau
      const newHours = await prisma.workingHours.findMany({
        orderBy: { dayOfWeek: 'asc' }
      });
      
      newHours.forEach(hour => {
        console.log(`${dayNames[hour.dayOfWeek]}: ${hour.isOpen ? `Ouvert ${hour.startTime} - ${hour.endTime}` : 'Fermé'}`);
      });
    } else {
      console.log('Horaires actuels:');
      workingHours.forEach(hour => {
        console.log(`${dayNames[hour.dayOfWeek]}: ${hour.isOpen ? `Ouvert ${hour.startTime} - ${hour.endTime}` : 'Fermé'}`);
      });
    }
    
    // Vérifier les réservations
    console.log('\n\nVérification des réservations existantes...');
    const reservations = await prisma.reservation.count({
      where: {
        status: {
          in: ['confirmed', 'pending']
        }
      }
    });
    
    console.log(`Nombre de réservations confirmées/en attente: ${reservations}`);
    
    // Vérifier les créneaux bloqués
    const blockedSlots = await prisma.blockedSlot.count();
    console.log(`Nombre de créneaux bloqués: ${blockedSlots}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkingHours();