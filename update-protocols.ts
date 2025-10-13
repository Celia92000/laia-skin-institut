import { prisma } from './src/lib/prisma';

const protocols = {
  'hydro-naissance': [
    {
      step: 1,
      title: "Accueil & Diagnostic personnalisé",
      description: "Analyse approfondie de votre type de peau, de vos besoins spécifiques et de vos objectifs beauté. Nous établissons ensemble le protocole optimal pour votre peau.",
      duration: "10 min"
    },
    {
      step: 2,
      title: "Double nettoyage purifiant",
      description: "Démaquillage à l'huile suivi d'un nettoyage doux à base d'eau micellaire pour éliminer toutes les impuretés sans agresser la barrière cutanée.",
      duration: "8 min"
    },
    {
      step: 3,
      title: "Gommage enzymatique doux",
      description: "Exfoliation délicate aux enzymes de fruits pour éliminer les cellules mortes, affiner le grain de peau et préparer l'épiderme aux soins suivants.",
      duration: "10 min"
    },
    {
      step: 4,
      title: "Hydrodermabrasion diamant",
      description: "Technologie révolutionnaire combinant aspiration douce et microdermabrasion pour un nettoyage en profondeur des pores, élimination des points noirs et lissage de la texture cutanée.",
      duration: "20 min"
    },
    {
      step: 5,
      title: "Infusion de sérums concentrés",
      description: "Application d'actifs hautement dosés (acide hyaluronique, vitamine C, peptides) en fonction de votre diagnostic. La technologie d'infusion garantit une pénétration optimale.",
      duration: "12 min"
    },
    {
      step: 6,
      title: "Massage sculptant japonais",
      description: "Techniques ancestrales de massage Kobido pour stimuler la circulation, drainer les toxines, lifter l'ovale du visage et favoriser l'absorption des actifs.",
      duration: "15 min"
    },
    {
      step: 7,
      title: "Masque biocellulose sur-mesure",
      description: "Masque en fibres de cellulose ultra-adhérent gorgé d'actifs ciblés : hydratation intense, apaisement ou éclat selon vos besoins.",
      duration: "15 min"
    },
    {
      step: 8,
      title: "Sérum & Protection finale",
      description: "Application d'un sérum adapté, d'une crème hydratante riche et d'une protection SPF pour sceller les bienfaits et protéger votre peau fraîchement traitée.",
      duration: "5 min"
    }
  ],

  'hydro-cleaning': [
    {
      step: 1,
      title: "Consultation & Analyse de peau",
      description: "Diagnostic complet à la loupe éclairante pour identifier vos zones de congestion, points noirs, excès de sébum et besoins spécifiques.",
      duration: "8 min"
    },
    {
      step: 2,
      title: "Nettoyage profond bi-phasé",
      description: "Première phase à l'huile pour dissoudre le sébum et les impuretés lipophiles, suivie d'un nettoyage aqueux pour une pureté absolue.",
      duration: "7 min"
    },
    {
      step: 3,
      title: "Vaporisation aux huiles essentielles",
      description: "Vapeur d'eau chaude enrichie en huiles purifiantes (tea tree, eucalyptus) pour ouvrir les pores en douceur et faciliter l'extraction des comédons.",
      duration: "5 min"
    },
    {
      step: 4,
      title: "Hydrodermabrasion & Aspiration",
      description: "Nettoyage en profondeur par hydro-abrasion douce combinée à une aspiration calibrée pour extraire points noirs, microkystes et impuretés incrustées sans traumatiser la peau.",
      duration: "20 min"
    },
    {
      step: 5,
      title: "Extractions manuelles ciblées",
      description: "Extractions manuelles précises et hygieniques des comédons résistants, réalisées avec douceur et expertise pour éviter cicatrices et inflammations.",
      duration: "10 min"
    },
    {
      step: 6,
      title: "Masque purifiant à l'argile",
      description: "Masque détoxifiant à l'argile verte et au charbon actif pour absorber l'excès de sébum, resserrer les pores et matifier durablement.",
      duration: "12 min"
    },
    {
      step: 7,
      title: "LED Bleue anti-bactérienne",
      description: "Séance de luminothérapie bleue pour éliminer les bactéries responsables de l'acné, réduire l'inflammation et prévenir les futures imperfections.",
      duration: "10 min"
    },
    {
      step: 8,
      title: "Hydratation & Équilibrage",
      description: "Sérum sébo-régulateur, crème matifiante légère et protection solaire adaptée aux peaux mixtes à grasses pour maintenir l'équilibre cutané.",
      duration: "5 min"
    }
  ],

  'renaissance': [
    {
      step: 1,
      title: "Bilan anti-âge complet",
      description: "Évaluation détaillée des signes de l'âge : rides, ridules, relâchement, taches pigmentaires, perte de densité. Définition de vos objectifs de rajeunissement.",
      duration: "10 min"
    },
    {
      step: 2,
      title: "Démaquillage & Nettoyage précieux",
      description: "Nettoyage haute couture aux huiles botaniques précieuses (rose, néroli, immortelle) pour préparer la peau aux soins anti-âge intensifs.",
      duration: "8 min"
    },
    {
      step: 3,
      title: "Peeling enzymatique régénérant",
      description: "Exfoliation douce mais efficace aux AHA et enzymes de papaye pour stimuler le renouvellement cellulaire, atténuer les taches et lisser les ridules.",
      duration: "12 min"
    },
    {
      step: 4,
      title: "Radiofréquence anti-âge",
      description: "Technologie de radiofréquence bipolaire pour chauffer en profondeur le derme, stimuler la production de collagène et d'élastine, lifter et raffermir durablement.",
      duration: "25 min"
    },
    {
      step: 5,
      title: "Mésothérapie virtuelle",
      description: "Électroporation pour faire pénétrer des cocktails anti-âge concentrés (acide hyaluronique, peptides, vitamines) au cœur du derme sans aiguilles.",
      duration: "15 min"
    },
    {
      step: 6,
      title: "Massage lifting & Drainage",
      description: "Protocole exclusif combinant techniques de lifting manuel, drainage lymphatique et acupression pour sculpter l'ovale, défroisser les traits et illuminer le teint.",
      duration: "18 min"
    },
    {
      step: 7,
      title: "Masque bio-régénérant intensif",
      description: "Masque en tissu biomimétique imprégné de facteurs de croissance, cellules souches végétales et peptides biomimétiques pour une régénération cellulaire optimale.",
      duration: "15 min"
    },
    {
      step: 8,
      title: "Rituel anti-âge complet",
      description: "Application d'une routine complète : sérum rétinol/vitamine C, crème riche restructurante, contour des yeux et lèvres, huile précieuse et SPF 50+ anti-âge.",
      duration: "7 min"
    }
  ],

  'bb-glow': [
    {
      step: 1,
      title: "Consultation teint & Colorimétrie",
      description: "Analyse de votre carnation, sous-ton et imperfections pigmentaires. Sélection de la teinte de pigments parfaitement adaptée à votre peau pour un résultat naturel.",
      duration: "10 min"
    },
    {
      step: 2,
      title: "Préparation & Nettoyage",
      description: "Double nettoyage méticuleux et désinfection de la zone à traiter pour garantir une peau parfaitement propre et réceptive aux pigments.",
      duration: "8 min"
    },
    {
      step: 3,
      title: "Peeling préparatoire léger",
      description: "Exfoliation enzymatique douce pour affiner la couche cornée et optimiser la pénétration uniforme des pigments BB Glow.",
      duration: "7 min"
    },
    {
      step: 4,
      title: "Microneedling & Infusion pigmentaire",
      description: "Utilisation d'un stylo de microneedling automatisé avec aiguilles stériles nano pour infuser les pigments teintés enrichis en acide hyaluronique dans l'épiderme superficiel.",
      duration: "30 min"
    },
    {
      step: 5,
      title: "Masque apaisant post-traitement",
      description: "Application d'un masque en gel calmant et hydratant pour apaiser les micro-rougeurs, favoriser la cicatrisation et fixer les pigments.",
      duration: "10 min"
    },
    {
      step: 6,
      title: "Sérum illuminateur & Protection",
      description: "Application d'un sérum illuminateur, d'une crème apaisante teintée et d'une protection solaire haute (SPF 50+) indispensable pour préserver le résultat.",
      duration: "5 min"
    },
    {
      step: 7,
      title: "Conseils post-soin personnalisés",
      description: "Remise d'une fiche conseil détaillée avec les gestes à adopter pendant 48h (pas d'eau chaude, pas de soleil, pas de maquillage) pour maximiser la tenue des pigments.",
      duration: "5 min"
    }
  ],

  'led-therapie': [
    {
      step: 1,
      title: "Diagnostic & Sélection du protocole LED",
      description: "Analyse de votre problématique cutanée (acné, anti-âge, cicatrisation, rosacée) et sélection des longueurs d'onde adaptées : rouge, bleue, jaune ou combinées.",
      duration: "5 min"
    },
    {
      step: 2,
      title: "Nettoyage & Dégraissage",
      description: "Nettoyage minutieux pour éliminer tout résidu de maquillage, sébum ou crème qui pourrait faire obstacle à la pénétration des photons lumineux.",
      duration: "8 min"
    },
    {
      step: 3,
      title: "Application de sérum photosensibilisant",
      description: "Application d'un sérum transparent enrichi en actifs qui potentialisent l'effet de la lumière LED (vitamine C, niacinamide, acide hyaluronique selon le protocole).",
      duration: "3 min"
    },
    {
      step: 4,
      title: "Séance LED personnalisée",
      description: "Exposition à la lumière LED thérapeutique selon le protocole choisi : rouge (anti-âge, collagène), bleue (anti-acné), jaune (anti-inflammatoire) ou multicolore (complet).",
      duration: "20 min"
    },
    {
      step: 5,
      title: "Massage énergisant du visage",
      description: "Massage doux pour stimuler la microcirculation, booster l'oxygénation cutanée et amplifier les effets régénérants de la luminothérapie.",
      duration: "10 min"
    },
    {
      step: 6,
      title: "Masque booster d'éclat",
      description: "Application d'un masque hydrogel enrichi en antioxydants et vitamines pour décupler les bénéfices de la LED et apporter un coup d'éclat immédiat.",
      duration: "10 min"
    },
    {
      step: 7,
      title: "Finitions & Protection quotidienne",
      description: "Application finale d'une crème adaptée à votre besoin (anti-acné, anti-âge, apaisante) et conseils pour prolonger les effets à domicile.",
      duration: "4 min"
    }
  ]
};

async function updateProtocols() {
  console.log('🚀 Mise à jour des protocoles de soins...\n');

  for (const [slug, protocol] of Object.entries(protocols)) {
    try {
      const service = await prisma.service.findUnique({
        where: { slug },
        select: { id: true, name: true }
      });

      if (service) {
        await prisma.service.update({
          where: { slug },
          data: {
            protocol: JSON.stringify(protocol),
            process: JSON.stringify(protocol) // Pour compatibilité
          }
        });
        console.log(`✅ ${service.name} - Protocole mis à jour (${protocol.length} étapes)`);
      } else {
        console.log(`⚠️  Service non trouvé: ${slug}`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${slug}:`, error);
    }
  }

  console.log('\n✨ Mise à jour terminée !');
}

updateProtocols()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
