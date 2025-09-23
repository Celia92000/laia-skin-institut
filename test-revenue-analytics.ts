import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
});

async function testRevenueAnalytics() {
  try {
    console.log('📊 Test Analyse du Chiffre d\'Affaires\n');
    console.log('=' .repeat(50));
    
    const now = new Date();
    
    // Récupérer les réservations pour différentes périodes
    const allReservations = await prisma.reservation.findMany({
      include: {
        service: true,
        user: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log(`\n📅 TOTAL: ${allReservations.length} réservations au total`);
    
    // Analyser par statut de paiement
    const paidReservations = allReservations.filter(r => r.paymentStatus === 'paid');
    const unpaidReservations = allReservations.filter(r => r.paymentStatus !== 'paid');
    
    console.log(`💰 Payées: ${paidReservations.length} réservations`);
    console.log(`⏳ Non payées: ${unpaidReservations.length} réservations`);
    
    // Calculer les revenus par période
    console.log('\n💵 REVENUS PAR PÉRIODE:');
    console.log('-' .repeat(30));
    
    // Aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = allReservations
      .filter(r => {
        const rDate = new Date(r.date);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === today.getTime() && r.paymentStatus === 'paid';
      })
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    console.log(`📍 Aujourd'hui: ${todayRevenue}€`);
    
    // Cette semaine
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekRevenue = allReservations
      .filter(r => {
        const rDate = new Date(r.date);
        return rDate >= weekStart && r.paymentStatus === 'paid';
      })
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    console.log(`📅 Cette semaine: ${weekRevenue}€`);
    
    // Ce mois
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = allReservations
      .filter(r => {
        const rDate = new Date(r.date);
        return rDate >= monthStart && r.paymentStatus === 'paid';
      })
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    console.log(`📆 Ce mois: ${monthRevenue}€`);
    
    // Cette année
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearRevenue = allReservations
      .filter(r => {
        const rDate = new Date(r.date);
        return rDate >= yearStart && r.paymentStatus === 'paid';
      })
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    console.log(`📊 Cette année: ${yearRevenue}€`);
    
    // Détails des réservations payées
    console.log('\n📝 DÉTAIL DES RÉSERVATIONS PAYÉES:');
    console.log('-' .repeat(50));
    paidReservations.forEach(r => {
      console.log(`  ${new Date(r.date).toLocaleDateString('fr-FR')} | ${r.service?.name || 'Service'} | ${r.totalPrice}€ | ${r.paymentStatus}`);
    });
    
    // Note importante
    console.log('\n⚠️  IMPORTANT:');
    console.log('Le composant RevenueAnalytics filtre uniquement les réservations avec:');
    console.log('  - status !== "cancelled"');
    console.log('  - paymentStatus === "paid"');
    console.log('\nSi les montants sont à 0, vérifiez que les réservations ont bien paymentStatus="paid"');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRevenueAnalytics();