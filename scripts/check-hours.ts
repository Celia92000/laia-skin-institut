import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHours() {
  const hours = await prisma.workingHours.findMany({ 
    orderBy: { dayOfWeek: 'asc' } 
  });
  
  console.log('📅 Horaires actuels:', hours.length);
  
  if (hours.length === 0) {
    console.log('Aucun horaire trouvé. Création des horaires par défaut...');
    
    // Créer les horaires par défaut
    const defaultHours = [
      { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isOpen: false }, // Dimanche
      { dayOfWeek: 1, startTime: '14:00', endTime: '20:00', isOpen: true },  // Lundi
      { dayOfWeek: 2, startTime: '14:00', endTime: '20:00', isOpen: true },  // Mardi
      { dayOfWeek: 3, startTime: '14:00', endTime: '20:00', isOpen: true },  // Mercredi
      { dayOfWeek: 4, startTime: '14:00', endTime: '20:00', isOpen: true },  // Jeudi
      { dayOfWeek: 5, startTime: '14:00', endTime: '20:00', isOpen: true },  // Vendredi
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00', isOpen: true },  // Samedi
    ];
    
    for (const hour of defaultHours) {
      await prisma.workingHours.create({ data: hour });
    }
    
    console.log('✅ Horaires créés avec succès!');
    
    // Afficher les nouveaux horaires
    const newHours = await prisma.workingHours.findMany({ 
      orderBy: { dayOfWeek: 'asc' } 
    });
    displayHours(newHours);
  } else {
    displayHours(hours);
  }
  
  await prisma.$disconnect();
}

function displayHours(hours: any[]) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  console.log('\n📋 Horaires configurés:');
  hours.forEach(h => {
    console.log(`  ${days[h.dayOfWeek]}: ${h.isOpen ? h.startTime + ' - ' + h.endTime : 'Fermé'}`);
  });
}

checkHours().catch(console.error);