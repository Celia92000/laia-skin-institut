// Données statiques pour GitHub Pages
export const staticServices = [
  {
    id: 'bb-glow',
    name: 'BB Glow',
    slug: 'bb-glow',
    description: 'Le BB Glow offre un teint unifié et lumineux en infusant un fond de teint semi-permanent dans les couches superficielles de la peau.',
    longDescription: 'Le BB Glow est une technique révolutionnaire qui permet d\'obtenir un effet "bonne mine" durable. Cette méthode utilise la micro-perforation pour infuser un fond de teint semi-permanent dans les couches superficielles de la peau, créant ainsi un teint unifié et lumineux qui dure plusieurs mois.',
    image: '/images/bb-glow.jpg',
    duration: 90,
    price: 60,
    priceRange: '60€',
    benefits: [
      'Teint unifié et lumineux',
      'Réduction des imperfections',
      'Effet bonne mine longue durée',
      'Hydratation profonde'
    ],
    indications: [
      'Teint terne',
      'Taches pigmentaires',
      'Imperfections cutanées',
      'Pores dilatés'
    ],
    featured: true,
    active: true,
    order: 1
  },
  {
    id: 'hydrocleaning',
    name: 'Hydrocleaning',
    slug: 'hydrocleaning',
    description: 'L\'Hydrocleaning est un soin complet qui nettoie, exfolie et hydrate votre peau en profondeur pour un teint éclatant.',
    longDescription: 'L\'Hydrocleaning est une technique de nettoyage en profondeur qui combine plusieurs technologies pour purifier et hydrater la peau. Ce soin utilise l\'aspiration douce, l\'exfoliation et l\'infusion de sérums pour éliminer les impuretés tout en nourrissant la peau.',
    image: '/images/hydro-cleaning.jpg',
    duration: 60,
    price: 70,
    priceRange: '70€',
    benefits: [
      'Nettoyage en profondeur',
      'Exfoliation douce',
      'Hydratation intense',
      'Teint éclatant'
    ],
    indications: [
      'Peau grasse',
      'Points noirs',
      'Pores dilatés',
      'Teint terne'
    ],
    featured: true,
    active: true,
    order: 2
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    slug: 'renaissance',
    description: 'Le soin Renaissance est notre protocole signature anti-âge qui combine plusieurs techniques pour une régénération complète de la peau.',
    longDescription: 'Le soin Renaissance est notre protocole le plus complet, combinant microneedling, LED thérapie et cocktails de vitamines pour une régénération totale de la peau. Ce traitement stimule la production naturelle de collagène et d\'élastine pour un effet rajeunissant visible.',
    image: '/images/renaissance.jpg',
    duration: 120,
    price: 70,
    priceRange: '70€',
    benefits: [
      'Régénération cellulaire',
      'Effet liftant',
      'Réduction des rides',
      'Éclat du teint'
    ],
    indications: [
      'Signes de l\'âge',
      'Perte de fermeté',
      'Rides profondes',
      'Teint fatigué'
    ],
    featured: true,
    active: true,
    order: 3
  },
  {
    id: 'led-therapie',
    name: 'LED Thérapie',
    slug: 'led-therapie',
    description: 'La LED thérapie utilise différentes longueurs d\'onde de lumière pour traiter divers problèmes de peau et stimuler la régénération cellulaire.',
    longDescription: 'La LED thérapie est une technique non invasive qui utilise différentes couleurs de lumière LED pour traiter divers problèmes cutanés. Chaque couleur a des propriétés spécifiques : rouge pour l\'anti-âge, bleue pour l\'acné, verte pour les taches pigmentaires.',
    image: '/images/led-therapie.jpg',
    duration: 45,
    price: 50,
    priceRange: '50€',
    benefits: [
      'Stimulation du collagène',
      'Réduction de l\'acné',
      'Amélioration du teint',
      'Effet anti-âge'
    ],
    indications: [
      'Rides et ridules',
      'Acné',
      'Taches pigmentaires',
      'Relâchement cutané'
    ],
    featured: false,
    active: true,
    order: 4
  }
];

export const openingHours = {
  monday: { open: '09:00', close: '19:00' },
  tuesday: { open: '09:00', close: '19:00' },
  wednesday: { open: '09:00', close: '19:00' },
  thursday: { open: '09:00', close: '19:00' },
  friday: { open: '09:00', close: '19:00' },
  saturday: { open: '09:00', close: '17:00' },
  sunday: { open: 'Fermé', close: 'Fermé' }
};

export const contactInfo = {
  phone: '06 23 45 67 89',
  email: 'contact@laia.skin.com',
  address: '33 Avenue Victor Hugo, 06000 Nice',
  instagram: '@laia.skin',
  facebook: 'Laia Skin Institut'
};