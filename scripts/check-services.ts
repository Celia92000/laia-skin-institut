import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkServices() {
  try {
    console.log('🔍 Vérification des services dans la base de données...\n');
    
    const services = await prisma.service.findMany();
    
    if (services.length === 0) {
      console.log('❌ Aucun service trouvé dans la base de données !');
      console.log('\n📝 Ajout des services...\n');
      
      // Ajouter les services
      const servicesToAdd = [
        {
          slug: 'hydro-naissance',
          name: "Hydro'Naissance",
          description: 'Le soin signature qui révolutionne votre peau',
          fullDescription: 'Soin complet combinant nettoyage en profondeur et régénération cellulaire.',
          price: 110,
          duration: 75,
          category: 'Soins Signature',
          image: '/services/hydro-naissance.jpg',
          benefits: JSON.stringify([
            'Nettoyage en profondeur',
            'Hydratation intense',
            'Éclat immédiat',
            'Régénération cellulaire'
          ]),
          active: true,
          featured: true,
          order: 1
        },
        {
          slug: 'hydro-cleaning',
          name: "Hydro'Cleaning",
          description: 'Nettoyage profond et hydratation',
          fullDescription: 'Soin de nettoyage en profondeur avec hydratation intense.',
          price: 70,
          duration: 60,
          category: 'Soins Essentiels',
          image: '/services/hydro-cleaning.jpg',
          benefits: JSON.stringify([
            'Extraction des impuretés',
            'Hydratation profonde',
            'Peau purifiée'
          ]),
          active: true,
          featured: false,
          order: 2
        },
        {
          slug: 'renaissance',
          name: 'Renaissance',
          description: 'Soin anti-âge global',
          fullDescription: 'Traitement complet anti-âge pour une peau rajeunie.',
          price: 90,
          duration: 60,
          category: 'Soins Anti-âge',
          image: '/services/renaissance.jpg',
          benefits: JSON.stringify([
            'Réduction des rides',
            'Fermeté améliorée',
            'Teint unifié'
          ]),
          active: true,
          featured: true,
          order: 3
        },
        {
          slug: 'bb-glow',
          name: 'BB Glow',
          description: 'Teint parfait effet bonne mine',
          fullDescription: 'Soin révolutionnaire pour un teint parfait longue durée.',
          price: 120,
          duration: 90,
          category: 'Soins Innovants',
          image: '/services/bb-glow.jpg',
          benefits: JSON.stringify([
            'Effet bonne mine immédiat',
            'Uniformise le teint',
            'Résultats durables'
          ]),
          active: true,
          featured: true,
          order: 4
        },
        {
          slug: 'led-therapie',
          name: 'LED Thérapie',
          description: 'Technologie avancée de photomodulation',
          fullDescription: 'Traitement par LED pour stimuler la régénération cellulaire.',
          price: 50,
          duration: 30,
          category: 'Soins Technologiques',
          image: '/services/led-therapie.jpg',
          benefits: JSON.stringify([
            'Stimulation du collagène',
            'Réduction de l\'inflammation',
            'Cicatrisation améliorée'
          ]),
          active: true,
          featured: false,
          order: 5
        }
      ];
      
      for (const service of servicesToAdd) {
        const created = await prisma.service.create({
          data: service
        });
        console.log(`✅ Service ajouté: ${created.name}`);
      }
      
      console.log('\n✨ Tous les services ont été ajoutés !');
      
    } else {
      console.log(`✅ ${services.length} services trouvés :`);
      services.forEach(service => {
        console.log(`   - ${service.name} (${service.price}€)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();