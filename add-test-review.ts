import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestReview() {
  try {
    // Récupérer un client existant pour l'avis
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      take: 1
    });

    if (clients.length === 0) {
      console.log("Aucun client trouvé. Création d'un client test...");
      const testClient = await prisma.user.create({
        data: {
          name: "Sophie Martin",
          email: "sophie.test@email.com",
          password: "test123",
          role: "client",
          phone: "06 12 34 56 78"
        }
      });
      clients.push(testClient);
    }

    // Créer un avis test
    const review = await prisma.review.create({
      data: {
        userId: clients[0].id,
        rating: 5,
        comment: "Je suis absolument ravie de mon expérience chez Laia Skin Institut ! Le soin du visage était divin, ma peau n'a jamais été aussi douce et lumineuse. L'accueil est chaleureux et professionnel. Je recommande vivement !",
        serviceName: "Soin Hydratant Intense",
        approved: false, // Non approuvé pour que vous puissiez tester la modération
        source: "site"
      }
    });

    // Créer un deuxième client pour un autre avis
    const client2 = await prisma.user.upsert({
      where: { email: "marie.test@email.com" },
      update: {},
      create: {
        name: "Marie Dubois",
        email: "marie.test@email.com",
        password: "test123",
        role: "client",
        phone: "06 98 76 54 32"
      }
    });

    // Ajouter un deuxième avis
    const review2 = await prisma.review.create({
      data: {
        userId: client2.id,
        rating: 4,
        comment: "Très bon massage relaxant, j'ai passé un moment très agréable. Le cadre est apaisant et Laia est très professionnelle. Petit bémol sur le temps d'attente mais sinon parfait !",
        serviceName: "Massage Relaxant",
        approved: false,
        source: "site"
      }
    });

    // Créer un troisième client
    const client3 = await prisma.user.upsert({
      where: { email: "julie.test@email.com" },
      update: {},
      create: {
        name: "Julie Perrin",
        email: "julie.test@email.com",
        password: "test123",
        role: "client",
        phone: "06 45 67 89 10"
      }
    });

    // Ajouter un troisième avis déjà approuvé
    const review3 = await prisma.review.create({
      data: {
        userId: client3.id,
        rating: 5,
        comment: "Un institut au top ! J'ai fait une épilation et un soin du visage, tout était parfait. Laia est très douce et attentionnée. Les produits utilisés sont de qualité. Je reviendrai sans hésiter !",
        serviceName: "Épilation & Soin Visage",
        approved: true, // Déjà approuvé pour voir la différence
        featured: true, // En vedette
        source: "site"
      }
    });

    // Ajouter un avis Google simulé
    const review4 = await prisma.review.create({
      data: {
        userId: clients[0].id,
        rating: 5,
        comment: "Excellente expérience ! L'institut est très propre, moderne et accueillant. Les soins sont de grande qualité. Je recommande vivement !",
        serviceName: "Soin Anti-Âge",
        approved: true,
        googleReview: true,
        source: "google",
        googleUrl: "https://g.page/review/example"
      }
    });

    console.log("✅ Avis tests ajoutés avec succès !");
    console.log("📝 Avis non approuvés:", [clients[0].name, client2.name].filter(Boolean));
    console.log("✓ Avis approuvés:", [client3.name, "Avis Google"].filter(Boolean));
    console.log("\n👉 Allez dans l'onglet 'Photos & Avis' de votre dashboard admin pour modérer les avis !");
    
  } catch (error) {
    console.error("Erreur lors de l'ajout des avis:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestReview();