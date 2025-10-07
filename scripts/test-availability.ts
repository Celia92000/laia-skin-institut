import { getAvailableSlots } from '../src/lib/availability-service';

async function testAvailability() {
  // Tester pour lundi prochain
  const nextMonday = new Date();
  const dayOfWeek = nextMonday.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  nextMonday.setDate(nextMonday.getDate() + daysToAdd);
  
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  console.log(`Test de disponibilité pour ${dayNames[nextMonday.getDay()]} ${nextMonday.toLocaleDateString('fr-FR')}:\n`);
  
  const slots = await getAvailableSlots(nextMonday);
  
  if (slots.length === 0) {
    console.log('❌ Aucun créneau disponible');
  } else {
    console.log(`✅ ${slots.filter(s => s.available).length} créneaux disponibles sur ${slots.length}:\n`);
    slots.forEach(slot => {
      console.log(`  ${slot.time} - ${slot.available ? '✅ Disponible' : '❌ Occupé'}`);
    });
  }
  
  process.exit(0);
}

testAvailability().catch(console.error);