import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPrices() {
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { 
      name: true, 
      slug: true, 
      price: true, 
      promoPrice: true, 
      forfaitPrice: true, 
      forfaitPromo: true 
    },
    orderBy: { order: 'asc' }
  });
  
  console.log('\n=== TARIFS ACTUELS DES SERVICES ===\n');
  
  services.forEach(s => {
    console.log(`📌 ${s.name} (${s.slug}):`);
    console.log(`   Prix séance: ${s.price}€`);
    
    if (s.promoPrice) {
      console.log(`   Prix promo: ${s.promoPrice}€`);
    }
    
    if (s.forfaitPrice) {
      console.log(`   Forfait 4 séances: ${s.forfaitPrice}€`);
    }
    
    if (s.forfaitPromo) {
      console.log(`   Forfait promo: ${s.forfaitPromo}€`);
    }
    
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkPrices().catch(console.error);