import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Statistiques des réservations
  const stats = {
    total: await prisma.reservation.count(),
    pending: await prisma.reservation.count({ where: { status: 'pending' }}),
    confirmed: await prisma.reservation.count({ where: { status: 'confirmed' }}),
    completed: await prisma.reservation.count({ where: { status: 'completed' }}),
    today: await prisma.reservation.count({ 
      where: { 
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
  };
  
  // Calcul des revenus
  const reservations = await prisma.reservation.findMany();
  const revenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const paidRevenue = reservations
    .filter(r => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  
  console.log('📊 Statistiques des réservations:');
  console.log('   Total:', stats.total);
  console.log('   En attente:', stats.pending);
  console.log('   Confirmées:', stats.confirmed);
  console.log('   Terminées:', stats.completed);
  console.log('   Aujourd\'hui:', stats.today);
  console.log('');
  console.log('💰 Revenus:');
  console.log('   Total (toutes réservations):', revenue, '€');
  console.log('   Payées:', paidRevenue, '€');
  
  // Vérifier les statuts uniques
  const uniqueStatuses = await prisma.reservation.findMany({
    select: { status: true },
    distinct: ['status']
  });
  console.log('\n📋 Statuts existants:', uniqueStatuses.map(s => s.status));
  
  // Vérifier les paiements
  const paymentStatuses = await prisma.reservation.findMany({
    select: { paymentStatus: true },
    distinct: ['paymentStatus']
  });
  console.log('💳 Statuts de paiement:', paymentStatuses.map(p => p.paymentStatus));
  
  await prisma.$disconnect();
}

checkStats().catch(console.error);