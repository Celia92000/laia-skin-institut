// Test de synchronisation des données entre comptes
import prisma from '../src/lib/prisma';

async function testDataSync() {
  console.log('🔄 TEST DE SYNCHRONISATION DES DONNÉES\n');
  console.log('=' . repeat(50) + '\n');
  
  // 1. Récupérer toutes les réservations
  const reservations = await prisma.reservation.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log(`📅 ${reservations.length} dernières réservations:\n`);
  
  // Grouper par statut
  const byStatus = reservations.reduce((acc, res) => {
    if (!acc[res.status]) acc[res.status] = [];
    acc[res.status].push(res);
    return acc;
  }, {} as Record<string, typeof reservations>);
  
  // Afficher par statut
  Object.entries(byStatus).forEach(([status, statusRes]) => {
    console.log(`\n📊 Statut: ${status} (${statusRes.length} réservations)`);
    console.log('-'.repeat(40));
    statusRes.forEach(res => {
      const date = new Date(res.date).toLocaleDateString('fr-FR');
      console.log(`  • ${res.user.name} (${res.user.email})`);
      console.log(`    Date: ${date} à ${res.time}`);
      console.log(`    Prix: ${res.totalPrice}€`);
      console.log(`    Rôle client: ${res.user.role}`);
    });
  });
  
  // 2. Vérifier les utilisateurs admin
  console.log('\n\n👑 ACCÈS ADMIN:\n');
  const admins = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'admin' },
        { role: 'ADMIN' }
      ]
    },
    select: {
      email: true,
      name: true,
      role: true,
      _count: {
        select: { reservations: true }
      }
    }
  });
  
  admins.forEach(admin => {
    console.log(`• ${admin.email} (${admin.role})`);
    console.log(`  Réservations créées: ${admin._count.reservations}`);
  });
  
  // 3. Vérifier les employés
  console.log('\n\n💼 ACCÈS EMPLOYÉS:\n');
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      email: true,
      name: true,
      _count: {
        select: { reservations: true }
      }
    }
  });
  
  employees.forEach(emp => {
    console.log(`• ${emp.email}`);
    console.log(`  Réservations créées: ${emp._count.reservations}`);
  });
  
  // 4. Statistiques globales
  console.log('\n\n📈 STATISTIQUES GLOBALES:\n');
  const stats = {
    totalReservations: await prisma.reservation.count(),
    pending: await prisma.reservation.count({ where: { status: 'pending' } }),
    confirmed: await prisma.reservation.count({ where: { status: 'confirmed' } }),
    completed: await prisma.reservation.count({ where: { status: 'completed' } }),
    cancelled: await prisma.reservation.count({ where: { status: 'cancelled' } })
  };
  
  console.log(`Total réservations: ${stats.totalReservations}`);
  console.log(`  • En attente: ${stats.pending}`);
  console.log(`  • Confirmées: ${stats.confirmed}`);
  console.log(`  • Terminées: ${stats.completed}`);
  console.log(`  • Annulées: ${stats.cancelled}`);
  
  // 5. Test de visibilité
  console.log('\n\n👁️  TEST DE VISIBILITÉ:\n');
  console.log('Les admins et employés devraient voir TOUTES ces réservations.');
  console.log('Les clients ne devraient voir QUE leurs propres réservations.');
  
  await prisma.$disconnect();
}

testDataSync().catch(console.error);