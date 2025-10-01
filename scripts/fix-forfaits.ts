import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixForfaits() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  });
  
  console.log('🔍 VÉRIFICATION ET CORRECTION DES FORFAITS :');
  console.log('Formule : (Prix séance × 4) - 20€');
  console.log('================================================\n');
  
  for (const s of services) {
    console.log(`📌 ${s.name}`);
    const prixSeance = s.promoPrice || s.price;
    const forfaitCalcule = (prixSeance * 4) - 20;
    const forfaitActuel = s.forfaitPromo || s.forfaitPrice;
    
    console.log(`   Prix séance : ${prixSeance}€`);
    console.log(`   Forfait actuel : ${forfaitActuel}€`);
    console.log(`   Forfait calculé : (${prixSeance} × 4) - 20 = ${forfaitCalcule}€`);
    
    if (forfaitActuel !== forfaitCalcule) {
      console.log(`   ❌ À corriger : ${forfaitActuel}€ → ${forfaitCalcule}€`);
      
      // Corriger dans la base
      if (s.forfaitPromo) {
        await prisma.service.update({
          where: { id: s.id },
          data: { forfaitPromo: forfaitCalcule }
        });
      } else {
        await prisma.service.update({
          where: { id: s.id },
          data: { forfaitPrice: forfaitCalcule }
        });
      }
      console.log(`   ✅ Corrigé !`);
    } else {
      console.log(`   ✅ Déjà correct`);
    }
    console.log('');
  }
  
  console.log('\n📊 RÉSUMÉ FINAL :');
  const updated = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  });
  
  updated.forEach(s => {
    const forfait = s.forfaitPromo || s.forfaitPrice;
    const prix = s.promoPrice || s.price;
    console.log(`• ${s.name} : ${prix}€/séance → ${forfait}€ forfait`);
  });
  
  await prisma.$disconnect();
}

fixForfaits().catch(console.error);