import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function getAdminStatistics() {
  try {
    // Vérifier le cache (30 secondes pour les stats)
    const cacheKey = 'admin:statistics';
    const cachedStats = cache.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Récupérer toutes les réservations et commandes
    // Optimisation : Ne pas inclure les relations si pas nécessaire pour les stats
    const reservations = await prisma.reservation.findMany({
      select: {
        id: true,
        date: true,
        totalPrice: true,
        status: true,
        paymentStatus: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        totalAmount: true,
        items: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Séparer les commandes par type (produits vs formations)
    const productOrders: any[] = [];
    const formationOrders: any[] = [];

    orders.forEach(order => {
      try {
        const items = JSON.parse(order.items || '[]');
        const hasProducts = items.some((item: any) => item.type === 'product');
        const hasFormations = items.some((item: any) => item.type === 'formation');

        if (hasProducts) productOrders.push(order);
        if (hasFormations) formationOrders.push(order);
      } catch (e) {}
    });

    // Calculer les revenus des commandes
    const ordersRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrdersRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrdersRevenue = orders
      .filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'unpaid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculer les revenus par type
    const productRevenue = productOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const formationRevenue = formationOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidProductRevenue = productOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidFormationRevenue = formationOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculer les statistiques (réservations + commandes)
    const servicesRevenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const paidServicesRevenue = reservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const stats: any = {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
      completedReservations: reservations.filter(r => r.status === 'completed').length,
      todayReservations: reservations.filter(r => {
        const resDate = new Date(r.date);
        return resDate >= today && resDate < tomorrow;
      }).length,
      totalOrders: orders.length,
      totalProductOrders: productOrders.length,
      totalFormationOrders: formationOrders.length,
      totalRevenue: servicesRevenue + ordersRevenue,
      servicesRevenue: servicesRevenue,
      productRevenue: productRevenue,
      formationRevenue: formationRevenue,
      paidRevenue: paidServicesRevenue + paidOrdersRevenue,
      paidServicesRevenue: paidServicesRevenue,
      paidProductRevenue: paidProductRevenue,
      paidFormationRevenue: paidFormationRevenue,
      pendingPayments: reservations
        .filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'unpaid')
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0) + pendingOrdersRevenue
    };
    
    // Calculer les revenus du mois (réservations + commandes)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthReservations = reservations.filter(r => {
      const resDate = new Date(r.date);
      return resDate >= startOfMonth && resDate <= endOfMonth;
    });

    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startOfMonth && orderDate <= endOfMonth;
    });

    const monthProductOrders = monthOrders.filter(o => {
      try {
        const items = JSON.parse(o.items || '[]');
        return items.some((item: any) => item.type === 'product');
      } catch { return false; }
    });

    const monthFormationOrders = monthOrders.filter(o => {
      try {
        const items = JSON.parse(o.items || '[]');
        return items.some((item: any) => item.type === 'formation');
      } catch { return false; }
    });

    const monthServicesRevenue = monthReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const monthOrdersRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const monthProductRevenue = monthProductOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const monthFormationRevenue = monthFormationOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    stats.monthlyRevenue = monthServicesRevenue + monthOrdersRevenue;
    stats.monthlyServicesRevenue = monthServicesRevenue;
    stats.monthlyProductRevenue = monthProductRevenue;
    stats.monthlyFormationRevenue = monthFormationRevenue;
    stats.monthlyReservations = monthReservations.length;
    stats.monthlyOrders = monthOrders.length;
    stats.monthlyProductOrders = monthProductOrders.length;
    stats.monthlyFormationOrders = monthFormationOrders.length;

    // Calculer le chiffre d'affaires du jour (réservations + commandes)
    const todayReservationsRevenue = reservations.filter(r => {
      const resDate = new Date(r.date);
      return resDate >= today && resDate < tomorrow;
    }).reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const todayOrdersRevenue = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    stats.todayRevenue = todayReservationsRevenue + todayOrdersRevenue;

    // Mettre en cache pour 30 secondes
    cache.set(cacheKey, stats, 30000);

    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      totalReservations: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      completedReservations: 0,
      todayReservations: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      pendingPayments: 0,
      monthlyRevenue: 0,
      monthlyReservations: 0,
      todayRevenue: 0
    };
  }
}