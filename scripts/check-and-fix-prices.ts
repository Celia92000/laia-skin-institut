import { getPrismaClient } from '../src/lib/prisma';

async function checkAndFixPrices() {
  const prisma = await getPrismaClient();

  console.log('🔍 Vérification des prix des services...\n');

  // Récupérer tous les services
  const services = await prisma.service.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      promoPrice: true,
      forfaitPrice: true
    }
  });

  console.log('📋 Prix actuels dans la base de données:\n');
  services.forEach(service => {
    console.log(`${service.name} (${service.slug}):`);
    console.log(`  - Prix: ${service.price}€`);
    if (service.promoPrice) console.log(`  - Prix promo: ${service.promoPrice}€`);
    if (service.forfaitPrice) console.log(`  - Prix forfait: ${service.forfaitPrice}€`);
    console.log('');
  });

  // Prix corrects connus
  const correctPrices: { [key: string]: { price: number, forfaitPrice?: number } } = {
    'renaissance': { price: 70 },
    'hydro-naissance': { price: 90 },
    'hydro-cleaning': { price: 70 },
    'led-therapie': { price: 45 },
    // Ajoutez les autres prix corrects ici si nécessaire
  };

  // Vérifier et corriger les prix
  console.log('🔧 Correction des prix si nécessaire...\n');

  for (const [slug, prices] of Object.entries(correctPrices)) {
    const service = services.find(s => s.slug === slug);

    if (service) {
      if (service.price !== prices.price) {
        console.log(`❌ ${service.name}: prix incorrect (${service.price}€ au lieu de ${prices.price}€)`);

        await prisma.service.update({
          where: { id: service.id },
          data: { price: prices.price }
        });

        console.log(`✅ ${service.name}: prix corrigé à ${prices.price}€`);
      } else {
        console.log(`✅ ${service.name}: prix correct (${service.price}€)`);
      }

      if (prices.forfaitPrice && service.forfaitPrice !== prices.forfaitPrice) {
        await prisma.service.update({
          where: { id: service.id },
          data: { forfaitPrice: prices.forfaitPrice }
        });
        console.log(`✅ ${service.name}: prix forfait corrigé à ${prices.forfaitPrice}€`);
      }
    }
  }

  console.log('\n✨ Vérification terminée !');
}

checkAndFixPrices()
  .catch(console.error)
  .finally(() => process.exit(0));
