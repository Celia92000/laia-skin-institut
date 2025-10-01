import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  console.log('🔄 Mise à jour des prix dans Supabase...');

  const services = [
    {
      slug: 'bb-glow',
      name: 'BB Glow',
      price: 150,
      duration: 90,
      description: 'Le BB Glow offre un teint unifié et lumineux en infusant un fond de teint semi-permanent dans les couches superficielles de la peau.'
    },
    {
      slug: 'hydrocleaning',
      name: 'Hydrocleaning',
      price: 120,
      duration: 60,
      description: "L'Hydrocleaning est un soin complet qui nettoie, exfolie et hydrate votre peau en profondeur pour un teint éclatant."
    },
    {
      slug: 'renaissance',
      name: 'Renaissance',
      price: 250,
      duration: 120,
      description: 'Le soin Renaissance est notre protocole signature anti-âge qui combine plusieurs techniques pour une régénération complète de la peau.'
    },
    {
      slug: 'led-therapie',
      name: 'LED Thérapie',
      price: 80,
      duration: 45,
      description: "La LED thérapie utilise différentes longueurs d'onde de lumière pour traiter divers problèmes de peau et stimuler la régénération cellulaire."
    },
    {
      slug: 'hydro-naissance',
      name: "Hydro'Naissance",
      price: 150,
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
        // Mettre à jour le service
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
        console.log(`✅ ${service.name} mis à jour: ${service.price}€ (${service.duration} min)`);
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
        console.log(`✅ ${service.name} créé: ${service.price}€ (${service.duration} min)`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${service.name}:`, error);
    }
  }

  // Afficher un résumé
  console.log('\n📊 Résumé des prix mis à jour:');
  const allServices = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });

  allServices.forEach(s => {
    console.log(`- ${s.name}: ${s.price}€ (${s.duration} min)`);
  });

  await prisma.$disconnect();
}

updatePrices().catch(console.error);