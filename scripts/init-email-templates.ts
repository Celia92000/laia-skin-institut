import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: "Promotion du mois",
    subject: "🎁 [Prénom], profitez de -20% ce mois-ci !",
    content: `Bonjour [Prénom],

J'espère que vous allez bien !

Ce mois-ci, profitez de -20% sur tous nos soins visage.
C'est le moment idéal pour prendre soin de vous !

Réservez vite votre créneau :
https://laiaskin.fr/reservation

À très bientôt,
Laïa
LAIA SKIN Institut`,
    category: "promo"
  },
  {
    name: "Rappel de soin",
    subject: "Il est temps de reprendre soin de votre peau !",
    content: `Bonjour [Prénom],

Cela fait maintenant 2 mois depuis votre dernier soin.

Pour maintenir les bienfaits et continuer à sublimer votre peau, je vous recommande de planifier votre prochain rendez-vous.

Réservez en ligne : https://laiaskin.fr/reservation
Ou répondez simplement à cet email !

Au plaisir de vous revoir,
Laïa`,
    category: "rappel"
  },
  {
    name: "Nouveau soin",
    subject: "✨ Découvrez notre nouveau soin exclusif !",
    content: `Bonjour [Prénom],

J'ai le plaisir de vous annoncer l'arrivée d'un nouveau soin !

[Description du nouveau soin]

Tarif : [Prix]

Je serais ravie de vous accueillir pour découvrir ce nouveau soin.

Pour réserver : https://laiaskin.fr/reservation

À bientôt,
Laïa`,
    category: "nouveaute"
  },
  {
    name: "Anniversaire client",
    subject: "🎂 Joyeux anniversaire [Prénom] !",
    content: `Joyeux anniversaire [Prénom] !

Pour célébrer votre jour spécial, je vous offre -30% sur tous nos soins durant tout le mois de votre anniversaire.

Profitez-en pour vous faire plaisir et prendre soin de vous !

Réservez dès maintenant : https://laiaskin.fr/reservation

Je vous souhaite une merveilleuse journée,
Laïa
LAIA SKIN Institut`,
    category: "anniversaire"
  },
  {
    name: "Récompense fidélité",
    subject: "🎁 Félicitations [Prénom] ! Vous avez débloqué une récompense",
    content: `Bravo [Prénom] !

Vous venez de débloquer un nouveau palier de fidélité !

Votre récompense :
[Description de la récompense]

Merci pour votre fidélité et votre confiance.

Utilisez votre récompense dès maintenant : https://laiaskin.fr/reservation

À très vite,
Laïa`,
    category: "fidelite"
  }
];

async function main() {
  console.log('🚀 Initialisation des templates email...');

  for (const template of templates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: template.name }
    });

    if (existing) {
      console.log(`✓ Template "${template.name}" existe déjà`);
    } else {
      await prisma.emailTemplate.create({
        data: template
      });
      console.log(`✅ Template "${template.name}" créé`);
    }
  }

  console.log('✨ Initialisation terminée !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
