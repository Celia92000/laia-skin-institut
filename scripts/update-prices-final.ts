import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  console.log('🔄 Mise à jour des prix dans Supabase...');

  // Prix individuels
  const services = [
    {
      slug: 'bb-glow',
      name: 'BB Glow',
      price: 60,
      packagePrice: 220, // (60 * 4) - 20
      duration: 90,
      description: 'Le BB Glow offre un teint unifié et lumineux en infusant un fond de teint semi-permanent dans les couches superficielles de la peau.'
    },
    {
      slug: 'hydrocleaning',
      name: 'Hydrocleaning',
      price: 70,
      packagePrice: 260, // (70 * 4) - 20
      duration: 60,
      description: "L'Hydrocleaning est un soin complet qui nettoie, exfolie et hydrate votre peau en profondeur pour un teint éclatant."
    },
    {
      slug: 'renaissance',
      name: 'Renaissance',
      price: 70,
      packagePrice: 260, // (70 * 4) - 20
      duration: 120,
      description: 'Le soin Renaissance est notre protocole signature anti-âge qui combine plusieurs techniques pour une régénération complète de la peau.'
    },
    {
      slug: 'led-therapie',
      name: 'LED Thérapie',
      price: 50,
      packagePrice: 180, // (50 * 4) - 20
      duration: 45,
      description: "La LED thérapie utilise différentes longueurs d'onde de lumière pour traiter divers problèmes de peau et stimuler la régénération cellulaire."
    },
    {
      slug: 'hydro-naissance',
      name: "Hydro'Naissance",
      price: 90,
      packagePrice: 340, // (90 * 4) - 20
      duration: 90,
      description: "Le soin Hydro'Naissance est notre traitement signature qui combine hydradermabrasion et infusion de principes actifs pour une peau parfaitement régénérée."
    }
  ];

  for (const service of services) {
    try {
      // Chercher le service existant
      const existing = await prisma.service.findFirst({
        where: {
          OR: [
            { slug: service.slug },
            { name: service.name }
          ]
        }
      });

      if (existing) {
        // Mettre à jour le service avec le nouveau prix
        const updated = await prisma.service.update({
          where: { id: existing.id },
          data: {
            price: service.price,
            duration: service.duration,
            promoPrice: null, // Retirer les prix promotionnels
            launchPrice: null,
            description: service.description,
            slug: service.slug
          }
        });
        console.log(`✅ ${service.name} mis à jour: ${service.price}€ (Forfait 4 séances: ${service.packagePrice}€)`);
      } else {
        // Créer le service s'il n'existe pas
        const created = await prisma.service.create({
          data: {
            name: service.name,
            slug: service.slug,
            price: service.price,
            duration: service.duration,
            description: service.description,
            category: 'soins',
            active: true,
            featured: true
          }
        });
        console.log(`✅ ${service.name} créé: ${service.price}€ (Forfait 4 séances: ${service.packagePrice}€)`);
      }

      // Créer ou mettre à jour le forfait correspondant
      const packageName = `Forfait ${service.name} - 4 séances`;
      const existingPackage = await prisma.service.findFirst({
        where: {
          name: packageName
        }
      });

      if (existingPackage) {
        await prisma.service.update({
          where: { id: existingPackage.id },
          data: {
            price: service.packagePrice,
            description: `Économisez 20€ ! Forfait de 4 séances ${service.name}. Prix unitaire: ${service.price}€`,
            category: 'forfaits',
            active: true
          }
        });
        console.log(`  📦 Forfait mis à jour: ${service.packagePrice}€`);
      } else {
        await prisma.service.create({
          data: {
            name: packageName,
            slug: `forfait-${service.slug}`,
            price: service.packagePrice,
            duration: service.duration,
            description: `Économisez 20€ ! Forfait de 4 séances ${service.name}. Prix unitaire: ${service.price}€`,
            category: 'forfaits',
            active: true,
            featured: false
          }
        });
        console.log(`  📦 Forfait créé: ${service.packagePrice}€`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${service.name}:`, error);
    }
  }

  // Afficher un résumé
  console.log('\n📊 Résumé des prix mis à jour:');
  console.log('\n🎯 Services individuels:');
  services.forEach(s => {
    console.log(`- ${s.name}: ${s.price}€`);
  });
  
  console.log('\n📦 Forfaits 4 séances (-20€):');
  services.forEach(s => {
    console.log(`- Forfait ${s.name}: ${s.packagePrice}€`);
  });

  const allServices = await prisma.service.findMany({
    where: { active: true },
    orderBy: { category: 'asc' }
  });

  console.log('\n✨ Tous les services actifs en base:');
  allServices.forEach(s => {
    console.log(`- ${s.name}: ${s.price}€ (${s.category})`);
  });

  await prisma.$disconnect();
}

updatePrices().catch(console.error);