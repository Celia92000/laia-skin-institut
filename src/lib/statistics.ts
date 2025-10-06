import { getPrismaClient } from '@/lib/prisma';

export async function getAdminStatistics() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Récupérer toutes les réservations et commandes
    const prisma = await getPrismaClient();
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Calculer les revenus des commandes
    const ordersRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrdersRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrdersRevenue = orders
      .filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'unpaid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculer les statistiques (réservations + commandes)
    const stats = {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
      completedReservations: reservations.filter(r => r.status === 'completed').length,
      todayReservations: reservations.filter(r => {
        const resDate = new Date(r.date);
        return resDate >= today && resDate < tomorrow;
      }).length,
      totalOrders: orders.length,
      totalRevenue: reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0) + ordersRevenue,
      paidRevenue: reservations
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0) + paidOrdersRevenue,
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

    stats.monthlyRevenue = monthReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0) +
                           monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    stats.monthlyReservations = monthReservations.length;
    stats.monthlyOrders = monthOrders.length;

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