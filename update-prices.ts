// Script pour mettre à jour les prix des services
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  try {
    // Hydro'Naissance - Soin signature premium
    await prisma.service.update({
      where: { slug: 'hydro-naissance' },
      data: {
        price: 169,
        promoPrice: null,
        forfaitPrice: 640,  // 4 séances avec réduction
        forfaitPromo: null
      }
    });

    // Hydro'Cleaning  
    await prisma.service.update({
      where: { slug: 'hydro-cleaning' },
      data: {
        price: 89,
        promoPrice: null,
        forfaitPrice: 320,  // 4 séances avec réduction
        forfaitPromo: null
      }
    });

    // Renaissance
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        price: 89,
        promoPrice: null,
        forfaitPrice: 320,  // 4 séances avec réduction
        forfaitPromo: null
      }
    });

    // BB Glow
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        price: 90,
        promoPrice: null,
        forfaitPrice: 340,  // 4 séances avec petite réduction
        forfaitPromo: null
      }
    });

    // LED Thérapie (option)
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        price: 50,
        promoPrice: null,
        forfaitPrice: 180,  // 4 séances avec réduction
        forfaitPromo: null
      }
    });

    console.log('✅ Prix mis à jour avec succès !');
    
    // Afficher les nouveaux prix
    const services = await prisma.service.findMany({
      where: { active: true },
      select: {
        name: true,
        slug: true,
        price: true,
        forfaitPrice: true
      }
    });
    
    console.log('\nNouveau tarifs:');
    services.forEach(s => {
      console.log(`- ${s.name}: ${s.price}€ (forfait: ${s.forfaitPrice}€)`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrices();