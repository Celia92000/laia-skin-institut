import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateServicesOrder() {
  try {
    console.log('🔄 Mise à jour de l\'ordre des services...');
    
    // Mettre à jour l'ordre des services
    const updates = [
      { slug: 'hydro-naissance', order: 1, featured: true },   // Soin signature en premier
      { slug: 'hydro-cleaning', order: 2, featured: false },   // Hydro'Cleaning
      { slug: 'renaissance', order: 3, featured: false },      // Renaissance avant BB Glow
      { slug: 'bb-glow', order: 4, featured: false },         // BB Glow après Renaissance
      { slug: 'led-therapie', order: 5, featured: false }     // LED Thérapie en dernier
    ];

    for (const update of updates) {
      const result = await prisma.service.updateMany({
        where: { slug: update.slug },
        data: { 
          order: update.order,
          featured: update.featured
        }
      });
      
      if (result.count > 0) {
        console.log(`✅ ${update.slug}: ordre ${update.order}${update.featured ? ' (Soin Signature)' : ''}`);
      }
    }

    console.log('\n📋 Nouvel ordre des services :');
    console.log('1. Hydro\'Naissance (Soin Signature)');
    console.log('2. Hydro\'Cleaning');
    console.log('3. Renaissance');
    console.log('4. BB Glow');
    console.log('5. LED Thérapie');
    
    console.log('\n✨ Ordre mis à jour avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServicesOrder();