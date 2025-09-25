import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  console.log('🌱 Ajout des produits et consommables par défaut...');

  const products = [
    // PRODUITS DE SOIN
    {
      name: 'Crème Hydratante Intense',
      description: 'Crème hydratante riche en acide hyaluronique pour une hydratation profonde et durable. Idéale pour les peaux sèches et déshydratées.',
      shortDescription: 'Hydratation intense 24h',
      price: 45,
      salePrice: 39,
      cost: 15,
      stock: 12,
      stockAlert: 5,
      category: 'Soin visage',
      brand: 'LAIA SKIN',
      supplier: 'Laboratoires Dermaceutiques',
      active: true,
      featured: true
    },
    {
      name: 'Sérum Vitamine C',
      description: 'Sérum concentré en vitamine C pure pour un teint éclatant et unifié. Anti-oxydant puissant.',
      shortDescription: 'Éclat et anti-oxydant',
      price: 65,
      cost: 25,
      stock: 8,
      stockAlert: 3,
      category: 'Sérum',
      brand: 'LAIA SKIN',
      supplier: 'Laboratoires Dermaceutiques',
      active: true,
      featured: true
    },
    {
      name: 'Masque Hydrogel',
      description: 'Masque hydrogel à l\'acide hyaluronique pour un boost d\'hydratation immédiat.',
      shortDescription: 'Masque hydratant intensif',
      price: 12,
      cost: 4,
      stock: 25,
      stockAlert: 10,
      category: 'Masque',
      brand: 'K-Beauty',
      supplier: 'Beauty Import Asia',
      active: true
    },
    {
      name: 'Contour des Yeux Liftant',
      description: 'Soin ciblé pour le contour des yeux avec effet liftant et anti-poches.',
      shortDescription: 'Anti-âge yeux',
      price: 38,
      cost: 12,
      stock: 6,
      stockAlert: 3,
      category: 'Soin yeux',
      brand: 'LAIA SKIN',
      supplier: 'Laboratoires Dermaceutiques',
      active: true
    },
    {
      name: 'Huile Précieuse Régénérante',
      description: 'Mélange d\'huiles précieuses pour nourrir et régénérer la peau pendant la nuit.',
      shortDescription: 'Nutrition intense nuit',
      price: 55,
      cost: 18,
      stock: 4,
      stockAlert: 2,
      category: 'Huile',
      brand: 'LAIA SKIN',
      supplier: 'Organic Beauty Lab',
      active: true
    },
    
    // CONSOMMABLES POUR SOINS
    {
      name: 'Aiguilles Microneedling 0.5mm',
      description: 'Cartouches d\'aiguilles stériles pour appareil de microneedling. Boîte de 10 unités.',
      shortDescription: 'Cartouches microneedling x10',
      price: 89,
      cost: 35,
      stock: 3,
      stockAlert: 2,
      category: 'Consommable',
      brand: 'DermaPen',
      supplier: 'Medical Beauty Supply',
      active: true
    },
    {
      name: 'Gel Conducteur Ultrason',
      description: 'Gel conducteur professionnel pour traitements par ultrasons. Flacon 500ml.',
      shortDescription: 'Gel ultrason 500ml',
      price: 18,
      cost: 6,
      stock: 15,
      stockAlert: 5,
      category: 'Consommable',
      brand: 'ProMedical',
      supplier: 'Medical Beauty Supply',
      active: true
    },
    {
      name: 'Gants Nitrile (Boîte 100)',
      description: 'Gants d\'examen en nitrile sans poudre, taille M. Boîte de 100 unités.',
      shortDescription: 'Protection hygiénique',
      price: 12,
      cost: 5,
      stock: 20,
      stockAlert: 8,
      category: 'Hygiène',
      brand: 'MediGlove',
      supplier: 'Hygiene Pro',
      active: true
    },
    {
      name: 'Compresses Stériles',
      description: 'Compresses stériles non tissées 10x10cm. Paquet de 100.',
      shortDescription: 'Compresses 10x10 x100',
      price: 8,
      cost: 3,
      stock: 30,
      stockAlert: 10,
      category: 'Hygiène',
      brand: 'MediCare',
      supplier: 'Hygiene Pro',
      active: true
    },
    {
      name: 'Solution Hydroalcoolique 1L',
      description: 'Solution désinfectante pour les mains. Flacon pompe 1L.',
      shortDescription: 'Désinfectant mains 1L',
      price: 15,
      cost: 5,
      stock: 10,
      stockAlert: 4,
      category: 'Hygiène',
      brand: 'CleanPro',
      supplier: 'Hygiene Pro',
      active: true
    },
    
    // PRODUITS BB GLOW
    {
      name: 'Kit BB Glow Complet',
      description: 'Kit professionnel BB Glow avec 5 teintes, sérum de base et après-soin.',
      shortDescription: 'Kit pro BB Glow',
      price: 189,
      cost: 75,
      stock: 2,
      stockAlert: 1,
      category: 'BB Glow',
      brand: 'BB Glow Pro',
      supplier: 'Korean Beauty Pro',
      active: true,
      featured: true
    },
    {
      name: 'Sérum BB Glow Medium',
      description: 'Sérum pigmenté teinte medium pour traitement BB Glow. Flacon 5ml.',
      shortDescription: 'Pigment BB Glow',
      price: 45,
      cost: 18,
      stock: 5,
      stockAlert: 2,
      category: 'BB Glow',
      brand: 'BB Glow Pro',
      supplier: 'Korean Beauty Pro',
      active: true
    },
    
    // ACCESSOIRES
    {
      name: 'Bandeau Spa Ajustable',
      description: 'Bandeau éponge ajustable pour maintenir les cheveux pendant les soins.',
      shortDescription: 'Protection cheveux',
      price: 8,
      cost: 2,
      stock: 15,
      stockAlert: 5,
      category: 'Accessoire',
      brand: 'Spa Essentials',
      supplier: 'Beauty Accessories',
      active: true
    },
    {
      name: 'Peignoir Jetable',
      description: 'Peignoir jetable en non-tissé pour les soins. Taille unique.',
      shortDescription: 'Confort client',
      price: 3,
      cost: 1,
      stock: 50,
      stockAlert: 20,
      category: 'Accessoire',
      brand: 'Spa Essentials',
      supplier: 'Beauty Accessories',
      active: true
    },
    {
      name: 'Draps d\'Examen (Rouleau)',
      description: 'Rouleau de draps d\'examen en papier. 50m x 60cm.',
      shortDescription: 'Hygiène table de soin',
      price: 25,
      cost: 10,
      stock: 8,
      stockAlert: 3,
      category: 'Hygiène',
      brand: 'MediCare',
      supplier: 'Hygiene Pro',
      active: true
    }
  ];

  // Créer les produits
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });
    
    if (!existing) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Produit créé: ${product.name}`);
    } else {
      console.log(`⏩ Produit existe déjà: ${product.name}`);
    }
  }

  console.log(`✨ ${products.length} produits ajoutés avec succès !`);
}

seedProducts()
  .catch((error) => {
    console.error('❌ Erreur lors du seed produits:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });