import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la connexion à la base de données...');
    
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion réussie!');
    
    // Compter les prestations
    const serviceCount = await prisma.service.count();
    console.log(`\n📊 Nombre de prestations en base: ${serviceCount}`);
    
    if (serviceCount === 0) {
      console.log('⚠️  AUCUNE PRESTATION TROUVÉE!');
      console.log('Il faut re-seeder la base de données avec: npm run seed');
    } else {
      const services = await prisma.service.findMany({
        take: 5,
        orderBy: { category: 'asc' }
      });
      
      console.log('\n📋 Exemples de prestations:');
      services.forEach(s => {
        console.log(`  - ${s.name} (${s.category}) - ${s.price}€`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();