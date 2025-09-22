import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début de l\'initialisation de la base de données...');

  // Nettoyer la base de données
  await prisma.reservation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();

  // Créer l'admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@laia.skin.com',
      password: adminPassword,
      name: 'Laia Admin',
      phone: '0600000000',
      role: 'admin',
      loyaltyPoints: 0,
      totalSpent: 0
    }
  });
  console.log('✅ Admin créé : admin@laia.skin.com / admin123');

  // Créer des clients de test
  const clientPassword = await bcrypt.hash('client123', 12);
  
  const client1 = await prisma.user.create({
    data: {
      email: 'sophie.martin@email.com',
      password: clientPassword,
      name: 'Sophie Martin',
      phone: '0612345678',
      role: 'client',
      loyaltyPoints: 150,
      totalSpent: 450,
      skinType: 'normal',
      preferences: 'Préfère les soins doux, sensible aux odeurs fortes'
    }
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'marie.dubois@email.com',
      password: clientPassword,
      name: 'Marie Dubois',
      phone: '0623456789',
      role: 'client',
      loyaltyPoints: 280,
      totalSpent: 840,
      skinType: 'combination',
      allergies: 'Allergie aux huiles essentielles de lavande',
      preferences: 'Aime les soins relaxants'
    }
  });

  const client3 = await prisma.user.create({
    data: {
      email: 'julie.bernard@email.com',
      password: clientPassword,
      name: 'Julie Bernard',
      phone: '0634567890',
      role: 'client',
      loyaltyPoints: 50,
      totalSpent: 150,
      skinType: 'sensitive'
    }
  });

  console.log('✅ 3 clients créés (mot de passe : client123)');
  console.log('   - sophie.martin@email.com (Silver)');
  console.log('   - marie.dubois@email.com (Gold)');
  console.log('   - julie.bernard@email.com (Découverte)');

  // Créer les services
  const services = [
    {
      name: 'Hydro\'Cleaning',
      description: 'Nettoyage en profondeur et hydratation intensive',
      price: 90,
      promoPrice: 70,
      duration: 60,
      forfaitPrice: 340,
      forfaitPromo: 280
    },
    {
      name: 'Renaissance',
      description: 'Soin anti-âge révolutionnaire',
      price: 90,
      promoPrice: 70,
      duration: 60,
      forfaitPrice: 340,
      forfaitPromo: 280
    },
    {
      name: 'BB Glow',
      description: 'Teint unifié et lumineux',
      price: 90,
      promoPrice: 70,
      duration: 30,
      forfaitPrice: 340,
      forfaitPromo: 280
    },
    {
      name: 'LED Thérapie',
      description: 'Traitement par lumière LED',
      price: 60,
      promoPrice: 50,
      duration: 30,
      forfaitPrice: 199,
      forfaitPromo: 199
    },
    {
      name: 'Hydro\'Naissance',
      description: 'Soin combiné d\'exception',
      price: 120,
      promoPrice: 90,
      duration: 90,
      forfaitPrice: 360,
      forfaitPromo: 360
    }
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log('✅ Services créés');

  // Créer des réservations de test
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Réservations pour aujourd'hui
  await prisma.reservation.create({
    data: {
      userId: client1.id,
      services: JSON.stringify(['hydro']),
      date: today,
      time: '10:00',
      totalPrice: 70,
      status: 'confirmed',
      source: 'site',
      notes: 'Première visite'
    }
  });

  await prisma.reservation.create({
    data: {
      userId: client2.id,
      services: JSON.stringify(['renaissance']),
      date: today,
      time: '14:00',
      totalPrice: 70,
      status: 'pending',
      source: 'planity'
    }
  });

  // Réservations pour demain
  await prisma.reservation.create({
    data: {
      userId: client3.id,
      services: JSON.stringify(['bb-glow']),
      date: tomorrow,
      time: '11:00',
      totalPrice: 70,
      status: 'pending',
      source: 'treatwell'
    }
  });

  await prisma.reservation.create({
    data: {
      userId: client1.id,
      services: JSON.stringify(['hydro-naissance']),
      date: tomorrow,
      time: '15:30',
      totalPrice: 90,
      status: 'confirmed',
      source: 'appel',
      notes: 'Cliente régulière, préfère une ambiance calme'
    }
  });

  // Réservations passées (complétées)
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  await prisma.reservation.create({
    data: {
      userId: client2.id,
      services: JSON.stringify(['hydro']),
      date: lastWeek,
      time: '10:00',
      totalPrice: 70,
      status: 'completed',
      source: 'site'
    }
  });

  await prisma.reservation.create({
    data: {
      userId: client2.id,
      services: JSON.stringify(['led']),
      date: lastWeek,
      time: '14:00',
      totalPrice: 199,
      status: 'completed',
      source: 'reseaux'
    }
  });

  console.log('✅ 6 réservations de test créées');
  console.log('   - 2 aujourd\'hui (10h et 14h)');
  console.log('   - 2 demain (11h et 15h30)');
  console.log('   - 2 complétées la semaine dernière');

  console.log('\n🎉 Base de données initialisée avec succès !');
  console.log('\n📝 Pour tester :');
  console.log('1. Admin : admin@laia.skin.com / admin123');
  console.log('2. Client : sophie.martin@email.com / client123');
  console.log('3. Le site est accessible sur : http://localhost:3001');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });