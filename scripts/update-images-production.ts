// Script pour mettre à jour les images des services dans la base de données de production
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateServiceImages() {
  console.log('🚀 Mise à jour des images des services dans la base de données de production...\n');
  
  try {
    // Mise à jour de chaque service avec son image
    const updates = [
      { slug: 'hydro-cleaning', mainImage: '/images/hydro-cleaning.jpg', name: "Hydro'Cleaning" },
      { slug: 'bb-glow', mainImage: '/images/bb-glow.jpg', name: 'BB Glow' },
      { slug: 'renaissance', mainImage: '/images/renaissance.jpg', name: 'Renaissance' },
      { slug: 'led-therapie', mainImage: '/images/led.jpg', name: 'LED Thérapie' },
      { slug: 'hydro-naissance', mainImage: '/images/hydro-naissance.jpg', name: "Hydro'Naissance" }
    ];

    for (const update of updates) {
      try {
        const service = await prisma.service.update({
          where: { slug: update.slug },
          data: { mainImage: update.mainImage }
        });
        console.log(`✅ ${update.name}: Image ajoutée (${update.mainImage})`);
      } catch (err) {
        console.log(`⚠️  ${update.name}: Service non trouvé ou erreur`);
      }
    }

    console.log('\n📊 Vérification finale...\n');
    
    // Vérifier que toutes les images sont bien ajoutées
    const services = await prisma.service.findMany({
      select: {
        name: true,
        slug: true,
        mainImage: true
      },
      orderBy: { order: 'asc' }
    });

    console.log('État actuel des services :');
    services.forEach(service => {
      const status = service.mainImage ? '✅' : '❌';
      console.log(`${status} ${service.name}: ${service.mainImage || 'PAS D\'IMAGE'}`);
    });

    console.log('\n🎉 Mise à jour terminée !');
    console.log('Les images devraient maintenant s\'afficher sur https://laia-skin-institut.vercel.app');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateServiceImages();