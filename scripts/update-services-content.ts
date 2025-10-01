import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateServicesContent() {
  console.log('🔄 Mise à jour du contenu détaillé des services...');

  // Hydrocleaning
  await prisma.service.updateMany({
    where: { slug: 'hydrocleaning' },
    data: {
      description: "L'Hydrocleaning est un soin complet qui nettoie, exfolie et hydrate votre peau en profondeur pour un teint éclatant.",
      benefits: JSON.stringify([
        'Nettoyage en profondeur des pores',
        'Extraction douce des points noirs',
        'Hydratation intense de la peau',
        'Teint plus lumineux et uniforme',
        'Réduction de l\'excès de sébum',
        'Amélioration de la texture cutanée'
      ]),
      process: JSON.stringify([
        { step: 1, title: 'Démaquillage et nettoyage', description: 'Préparation de la peau avec un nettoyage doux', duration: '5 min' },
        { step: 2, title: 'Exfoliation enzymatique', description: 'Application d\'un peeling doux pour éliminer les cellules mortes', duration: '10 min' },
        { step: 3, title: 'Extraction par aspiration', description: 'Nettoyage des pores en profondeur avec aspiration contrôlée', duration: '15 min' },
        { step: 4, title: 'Infusion de sérums', description: 'Application de sérums hydratants et nourrissants adaptés', duration: '15 min' },
        { step: 5, title: 'LED thérapie', description: 'Séance de LED pour apaiser et régénérer', duration: '10 min' },
        { step: 6, title: 'Masque hydratant', description: 'Application d\'un masque adapté à votre type de peau', duration: '10 min' }
      ]),
      contraindications: JSON.stringify([
        'Rosacée sévère',
        'Lésions cutanées actives',
        'Coup de soleil récent',
        'Traitement Roaccutane en cours'
      ]),
      recommendations: JSON.stringify([
        'Venir démaquillée ou avec un maquillage léger',
        'Éviter l\'exposition solaire 48h avant',
        'Bien hydrater sa peau les jours précédents',
        'Prévoir 1h15 pour le soin complet'
      ])
    }
  });
  console.log('✅ Hydrocleaning mis à jour');

  // BB Glow
  await prisma.service.updateMany({
    where: { slug: 'bb-glow' },
    data: {
      description: 'Le BB Glow offre un teint unifié et lumineux en infusant un fond de teint semi-permanent dans les couches superficielles de la peau.',
      benefits: JSON.stringify([
        'Teint unifié et lumineux',
        'Réduction des imperfections',
        'Effet bonne mine longue durée',
        'Hydratation profonde',
        'Correction des taches pigmentaires',
        'Pores moins visibles'
      ]),
      process: JSON.stringify([
        { step: 1, title: 'Consultation', description: 'Analyse de votre peau et choix de la teinte', duration: '10 min' },
        { step: 2, title: 'Nettoyage', description: 'Préparation minutieuse de la peau', duration: '10 min' },
        { step: 3, title: 'Microneedling', description: 'Application du sérum BB Glow avec micro-aiguilles', duration: '30 min' },
        { step: 4, title: 'Massage', description: 'Massage pour favoriser la pénétration', duration: '10 min' },
        { step: 5, title: 'LED thérapie', description: 'Séance de LED pour optimiser les résultats', duration: '15 min' },
        { step: 6, title: 'Protection', description: 'Application de crème apaisante et SPF', duration: '5 min' }
      ]),
      contraindications: JSON.stringify([
        'Grossesse et allaitement',
        'Acné active',
        'Infections cutanées',
        'Diabète non contrôlé'
      ]),
      recommendations: JSON.stringify([
        'Ne pas se maquiller pendant 24h',
        'Éviter le soleil pendant 48h',
        'Utiliser une protection solaire SPF 50',
        'Prévoir 3 à 4 séances pour un résultat optimal'
      ])
    }
  });
  console.log('✅ BB Glow mis à jour');

  // Renaissance
  await prisma.service.updateMany({
    where: { slug: 'renaissance' },
    data: {
      description: 'Le soin Renaissance est notre protocole signature anti-âge qui combine plusieurs techniques pour une régénération complète de la peau.',
      benefits: JSON.stringify([
        'Régénération cellulaire profonde',
        'Effet liftant visible',
        'Réduction des rides et ridules',
        'Éclat du teint retrouvé',
        'Raffermissement cutané',
        'Production de collagène stimulée'
      ]),
      process: JSON.stringify([
        { step: 1, title: 'Diagnostic', description: 'Analyse complète de votre peau', duration: '10 min' },
        { step: 2, title: 'Peeling doux', description: 'Exfoliation pour préparer la peau', duration: '15 min' },
        { step: 3, title: 'Microneedling', description: 'Stimulation du collagène avec micro-aiguilles', duration: '30 min' },
        { step: 4, title: 'Mésothérapie', description: 'Infusion de cocktails vitaminés', duration: '20 min' },
        { step: 5, title: 'LED thérapie', description: 'Stimulation cellulaire par la lumière', duration: '20 min' },
        { step: 6, title: 'Masque régénérant', description: 'Application d\'un masque haute performance', duration: '15 min' }
      ]),
      contraindications: JSON.stringify([
        'Peau très sensible ou réactive',
        'Infections actives',
        'Prise d\'anticoagulants',
        'Maladies auto-immunes'
      ]),
      recommendations: JSON.stringify([
        'Prévoir une journée de repos après le soin',
        'Hydrater intensément la peau',
        'Protection solaire indispensable',
        'Cure de 4 à 6 séances recommandée'
      ])
    }
  });
  console.log('✅ Renaissance mis à jour');

  // LED Thérapie
  await prisma.service.updateMany({
    where: { slug: 'led-therapie' },
    data: {
      description: "La LED thérapie utilise différentes longueurs d'onde de lumière pour traiter divers problèmes de peau et stimuler la régénération cellulaire.",
      benefits: JSON.stringify([
        'Stimulation du collagène',
        'Réduction de l\'acné',
        'Amélioration du teint',
        'Effet anti-âge',
        'Apaisement des inflammations',
        'Accélération de la cicatrisation'
      ]),
      process: JSON.stringify([
        { step: 1, title: 'Nettoyage', description: 'Préparation de la peau', duration: '5 min' },
        { step: 2, title: 'Protection oculaire', description: 'Mise en place des lunettes de protection', duration: '2 min' },
        { step: 3, title: 'LED rouge', description: 'Anti-âge et stimulation du collagène', duration: '10 min' },
        { step: 4, title: 'LED bleue', description: 'Traitement anti-acné et purification', duration: '10 min' },
        { step: 5, title: 'LED verte', description: 'Uniformisation du teint', duration: '10 min' },
        { step: 6, title: 'Soin final', description: 'Application de sérum adapté', duration: '5 min' }
      ]),
      contraindications: JSON.stringify([
        'Épilepsie photosensible',
        'Prise de médicaments photosensibilisants',
        'Cancer de la peau',
        'Grossesse (par précaution)'
      ]),
      recommendations: JSON.stringify([
        'Séances régulières pour des résultats optimaux',
        'Peut être combiné avec d\'autres soins',
        'Aucune éviction sociale',
        'Idéal en cure de 10 séances'
      ])
    }
  });
  console.log('✅ LED Thérapie mise à jour');

  // Hydro'Naissance
  await prisma.service.updateMany({
    where: { slug: 'hydro-naissance' },
    data: {
      description: "Le soin Hydro'Naissance est notre traitement signature qui combine hydradermabrasion et infusion de principes actifs pour une peau parfaitement régénérée.",
      benefits: JSON.stringify([
        'Hydratation profonde et durable',
        'Peau repulpée et rebondie',
        'Teint éclatant et uniforme',
        'Réduction des ridules de déshydratation',
        'Pores resserrés',
        'Texture affinée'
      ]),
      process: JSON.stringify([
        { step: 1, title: 'Diagnostic personnalisé', description: 'Analyse de vos besoins spécifiques', duration: '10 min' },
        { step: 2, title: 'Hydradermabrasion', description: 'Exfoliation douce à l\'eau et aspiration', duration: '20 min' },
        { step: 3, title: 'Extraction', description: 'Nettoyage profond des impuretés', duration: '15 min' },
        { step: 4, title: 'Infusion d\'actifs', description: 'Pénétration de sérums haute performance', duration: '15 min' },
        { step: 5, title: 'LED thérapie', description: 'Optimisation de l\'hydratation cellulaire', duration: '15 min' },
        { step: 6, title: 'Masque hydratant', description: 'Scellement de l\'hydratation', duration: '10 min' }
      ]),
      contraindications: JSON.stringify([
        'Herpès actif',
        'Eczéma sévère',
        'Plaies ouvertes',
        'Couperose très marquée'
      ]),
      recommendations: JSON.stringify([
        'Idéal pour tous types de peau',
        'Parfait avant un événement',
        'Résultats immédiats',
        'Une séance par mois en entretien'
      ])
    }
  });
  console.log('✅ Hydro\'Naissance mis à jour');

  console.log('\n✅ Tous les services ont été mis à jour avec leur contenu détaillé');
  
  await prisma.$disconnect();
}

updateServicesContent().catch(console.error);