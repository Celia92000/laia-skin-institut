import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    const reservationCount = await prisma.reservation.count();
    
    console.log('✅ Connexion à la base de données réussie!');
    console.log('📊 Statistiques actuelles:');
    console.log(`   - Utilisateurs: ${userCount}`);
    console.log(`   - Services: ${serviceCount}`);
    console.log(`   - Réservations: ${reservationCount}`);
  } catch (error: any) {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error('   Message:', error.message);
    if (error.code === 'P1001') {
      console.error('   → Vérifiez que la base de données Supabase est accessible');
      console.error('   → Vérifiez l\'URL de connexion dans DATABASE_URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();