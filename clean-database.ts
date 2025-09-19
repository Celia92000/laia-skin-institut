import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...\n');
  
  try {
    // 1. Lister toutes les prestations
    const allServices = await prisma.service.findMany({
      select: { id: true, name: true, slug: true }
    });
    
    console.log('📋 Prestations actuelles:');
    allServices.forEach(s => console.log(`  - ${s.name} (${s.slug})`));
    
    // 2. Identifier les doublons ou prestations à supprimer
    const toDelete = allServices.filter(s => 
      s.name === 'Hydrocleaning' || 
      s.slug === 'hydrocleaning'
    );
    
    if (toDelete.length > 0) {
      console.log('\n🗑️  Suppression des doublons:');
      for (const service of toDelete) {
        await prisma.service.delete({ where: { id: service.id } });
        console.log(`  ✅ ${service.name} supprimé`);
      }
    }
    
    // 3. Vérifier et corriger les images
    console.log('\n🖼️  Vérification des images:');
    const services = await prisma.service.findMany();
    
    for (const service of services) {
      let imagePath = `/images/${service.slug}.jpg`;
      
      // Mise à jour si nécessaire
      if (service.mainImage !== imagePath) {
        await prisma.service.update({
          where: { id: service.id },
          data: { mainImage: imagePath }
        });
        console.log(`  ✅ Image mise à jour pour ${service.name}: ${imagePath}`);
      } else {
        console.log(`  ✓ ${service.name}: ${service.mainImage}`);
      }
    }
    
    // 4. Afficher le résultat final
    console.log('\n📊 État final de la base:');
    const finalServices = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
    
    finalServices.forEach(s => {
      console.log(`  - ${s.name}`);
      console.log(`    Slug: ${s.slug}`);
      console.log(`    Image: ${s.mainImage}`);
      console.log(`    Prix: ${s.price}€`);
    });
    
    console.log(`\n✅ Total: ${finalServices.length} prestations`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();