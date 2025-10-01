import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixServices() {
  try {
    console.log('🔧 Correction des services dans la base de données...\n');

    // 1. Supprimer le doublon Hydrocleaning
    const hydrocleaning = await prisma.service.findFirst({ 
      where: { slug: 'hydrocleaning' }
    });
    
    if (hydrocleaning) {
      await prisma.service.delete({ where: { id: hydrocleaning.id }});
      console.log('✅ Supprimé: Hydrocleaning (doublon)');
    }

    // 2. Mettre à jour les prix corrects
    const updates = [
      { slug: 'hydro-cleaning', name: "Hydro'Cleaning", price: 70 },
      { slug: 'hydro-naissance', name: "Hydro'Naissance", price: 90 },
      { slug: 'renaissance', name: 'Renaissance', price: 70 },
      { slug: 'led-therapie', name: 'LED Thérapie', price: 50 },
      { slug: 'bb-glow', name: 'BB Glow', price: 60 }
    ];

    for (const service of updates) {
      await prisma.service.updateMany({
        where: { slug: service.slug },
        data: { 
          name: service.name,
          price: service.price 
        }
      });
      console.log(`✅ Mis à jour: ${service.name} - ${service.price}€`);
    }

    // 3. Supprimer tous les forfaits existants
    await prisma.service.deleteMany({
      where: { category: 'forfaits' }
    });
    console.log('✅ Forfaits supprimés');

    // 4. Vérifier les services finaux
    console.log('\n📋 Services actuels:');
    const services = await prisma.service.findMany({
      orderBy: { price: 'asc' }
    });
    
    services.forEach(s => {
      console.log(`- ${s.name}: ${s.price}€ (${s.slug})`);
    });

    console.log('\n✅ Base de données corrigée avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixServices();