// Script pour synchroniser les 5 services officiels LAIA SKIN
const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

// Les 5 prestations officielles de LAIA SKIN
const officialServices = [
    {
        name: "💧 Hydro'Naissance",
        description: "Notre soin phare qui combine hydratation profonde et technologie avancée pour une peau rebondie et éclatante. Ce protocole exclusif utilise les dernières innovations pour hydrater, repulper et illuminer votre peau en profondeur.",
        shortDescription: "Hydratation profonde et technologie avancée pour une peau éclatante",
        price: {
            single: 80,
            packages: [
                { sessions: 3, price: 220, savings: 20 },
                { sessions: 5, price: 350, savings: 50 }
            ]
        },
        duration: 60,
        category: 'hydrafacial',
        benefits: [
            "Hydratation profonde et durable",
            "Éclat immédiat du teint",
            "Réduction des ridules",
            "Effet repulpant visible"
        ],
        contraindications: [
            "Allergie aux algues",
            "Peau lésée"
        ],
        preparationAdvice: [
            "Éviter l'exposition solaire 48h avant",
            "Ne pas faire de gommage la veille"
        ],
        aftercareAdvice: [
            "Boire beaucoup d'eau",
            "Protection solaire SPF50",
            "Éviter le maquillage 24h"
        ],
        isActive: true,
        order: 1
    },
    {
        name: "✨ BB Glow",
        description: "Technique innovante de maquillage semi-permanent pour un effet bonne mine naturel et durable. Le BB Glow unifie le teint, corrige les imperfections et donne un effet bonne mine qui dure plusieurs mois.",
        shortDescription: "Maquillage semi-permanent pour un teint parfait et lumineux",
        price: {
            single: 120,
            packages: [
                { sessions: 3, price: 330, savings: 30 },
                { sessions: 5, price: 525, savings: 75 }
            ]
        },
        duration: 90,
        category: 'bbglow',
        benefits: [
            "Teint unifié et lumineux",
            "Correction des imperfections",
            "Effet bonne mine 24/7",
            "Durée 3-6 mois"
        ],
        contraindications: [
            "Grossesse",
            "Allaitement",
            "Acné active",
            "Rosacée"
        ],
        preparationAdvice: [
            "Pas de maquillage le jour J",
            "Peau propre et hydratée"
        ],
        aftercareAdvice: [
            "Pas de maquillage 48h",
            "Protection solaire obligatoire",
            "Hydratation intense"
        ],
        isActive: true,
        order: 2
    },
    {
        name: "🌟 Renaissance (Microneedling)",
        description: "Stimulation du collagène par micro-perforations contrôlées pour une peau visiblement rajeunie. Ce traitement stimule la régénération cellulaire naturelle pour améliorer la texture, réduire les rides et les cicatrices.",
        shortDescription: "Régénération cellulaire pour une peau visiblement rajeunie",
        price: {
            single: 110,
            packages: [
                { sessions: 3, price: 300, savings: 30 },
                { sessions: 5, price: 475, savings: 75 }
            ]
        },
        duration: 75,
        category: 'microneedling',
        benefits: [
            "Stimulation du collagène",
            "Réduction des rides",
            "Amélioration texture peau",
            "Atténuation des cicatrices"
        ],
        contraindications: [
            "Infections cutanées",
            "Herpès actif",
            "Diabète non contrôlé",
            "Traitement Roaccutane"
        ],
        preparationAdvice: [
            "Arrêter les rétinoïdes 1 semaine avant",
            "Éviter l'alcool 24h avant"
        ],
        aftercareAdvice: [
            "Éviter soleil 72h",
            "Pas de sport 48h",
            "Soins réparateurs prescrits"
        ],
        isActive: true,
        order: 3
    },
    {
        name: "💎 Hydrafacial",
        description: "Technologie brevetée combinant nettoyage, extraction et hydratation pour une peau parfaitement purifiée. Un traitement complet qui nettoie en profondeur tout en hydratant et nourrissant votre peau.",
        shortDescription: "Nettoyage profond et hydratation pour une peau purifiée",
        price: {
            single: 90,
            packages: [
                { sessions: 3, price: 250, savings: 20 },
                { sessions: 5, price: 400, savings: 50 }
            ]
        },
        duration: 60,
        category: 'hydrafacial',
        benefits: [
            "Extraction douce des impuretés",
            "Hydratation intense",
            "Peau nette et lumineuse",
            "Résultats immédiats"
        ],
        contraindications: [
            "Peau très sensible",
            "Couperose sévère",
            "Traitement isotrétinoïne"
        ],
        preparationAdvice: [
            "Venir démaquillée",
            "Pas de peeling récent"
        ],
        aftercareAdvice: [
            "Maquillage léger possible",
            "Protection solaire",
            "Maintenir hydratation"
        ],
        isActive: true,
        order: 4
    },
    {
        name: "💡 LED Thérapie",
        description: "Photobiomodulation par LED médicales pour traiter diverses problématiques cutanées sans douleur. Chaque couleur de LED a des propriétés spécifiques pour traiter acné, rides, taches ou inflammation.",
        shortDescription: "Lumière thérapeutique pour traiter diverses problématiques",
        price: {
            single: 50,
            packages: [
                { sessions: 5, price: 225, savings: 25 },
                { sessions: 10, price: 400, savings: 100 }
            ]
        },
        duration: 30,
        category: 'led',
        benefits: [
            "Sans douleur ni effets secondaires",
            "Stimulation naturelle de la peau",
            "Résultats progressifs durables",
            "Compatible tous types de peau"
        ],
        contraindications: [
            "Épilepsie",
            "Médicaments photosensibilisants",
            "Cancer de la peau"
        ],
        preparationAdvice: [
            "Peau propre sans maquillage",
            "Pas de produits photosensibilisants"
        ],
        aftercareAdvice: [
            "Hydratation renforcée",
            "Protection solaire normale"
        ],
        isActive: true,
        order: 5
    }
];

async function syncServices() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://institut_db:Laia2024Skin!@laia-cluster.bftzg.mongodb.net/laia_skin_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connecté à MongoDB');

        // Supprimer les anciens services
        await Service.deleteMany({});
        console.log('🗑️ Services existants supprimés');

        // Créer les 5 services officiels
        for (const serviceData of officialServices) {
            const service = new Service(serviceData);
            await service.save();
            console.log(`✅ Service créé: ${service.name} - ${service.price}€`);
        }

        console.log('\n🎉 Synchronisation terminée avec succès!');
        console.log('📊 Total: 5 services officiels LAIA SKIN');

        // Vérifier
        const services = await Service.find({}).sort('order');
        console.log('\n📋 Services dans la base de données:');
        services.forEach(s => {
            console.log(`  ${s.emoji} ${s.name} - ${s.price}€ (${s.duration} min)`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

syncServices();