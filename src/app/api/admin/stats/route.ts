import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { formatDateLocal } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - today.getDay());
    
    // Statistiques des réservations
    const [
      totalReservations,
      todayReservations,
      weekReservations,
      monthReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { createdAt: { gte: today } } }),
      prisma.reservation.count({ where: { createdAt: { gte: thisWeek } } }),
      prisma.reservation.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.reservation.count({ where: { status: 'pending' } }),
      prisma.reservation.count({ where: { status: 'confirmed' } }),
      prisma.reservation.count({ where: { status: 'cancelled' } })
    ]);

    // Top services avec agrégation manuelle
    const reservationsWithServices = await prisma.reservation.findMany({
      where: { status: { not: 'cancelled' } },
      include: { service: true }
    });

    const serviceStats = reservationsWithServices.reduce((acc, res) => {
      const serviceName = res.service?.name || 'Service inconnu';
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 };
      }
      acc[serviceName].count++;
      acc[serviceName].revenue += res.totalPrice;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topServices = Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Revenus (basés sur les réservations confirmées ET terminées)
    const confirmedReservationsList = await prisma.reservation.findMany({
      where: { 
        status: { in: ['confirmed', 'completed'] }
      }
    });

    const totalRevenue = confirmedReservationsList.reduce((sum, res) => sum + res.totalPrice, 0);
    
    const thisMonthRevenue = confirmedReservationsList
      .filter(res => res.date >= thisMonth) // Utiliser la date de la réservation, pas la création
      .reduce((sum, res) => sum + res.totalPrice, 0);
    
    const lastMonthRevenue = confirmedReservationsList
      .filter(res => res.date >= lastMonth && res.date < thisMonth)
      .reduce((sum, res) => sum + res.totalPrice, 0);

    // Statistiques par jour (derniers 7 jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReservations = await prisma.reservation.findMany({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    const dailyStatsMap = recentReservations.reduce((acc, res) => {
      const date = formatDateLocal(res.date); // Utiliser la date de réservation
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count++;
      if (res.status === 'confirmed' || res.status === 'completed') {
        acc[date].revenue += res.totalPrice;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const dailyStats = Object.entries(dailyStatsMap)
      .map(([date, stats]) => ({ _id: date, ...stats }))
      .sort((a, b) => a._id.localeCompare(b._id));

    // Taux de conversion
    const conversionRate = totalReservations > 0 
      ? ((confirmedReservations / totalReservations) * 100).toFixed(1)
      : 0;

    // Clients récurrents
    const clientReservations = await prisma.reservation.groupBy({
      by: ['userId'],
      where: { status: { not: 'cancelled' } },
      _count: true
    });

    const recurringClients = clientReservations.filter(c => c._count > 1).length;

    const stats = {
      reservations: {
        total: totalReservations,
        today: todayReservations,
        thisWeek: weekReservations,
        thisMonth: monthReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        cancelled: cancelledReservations,
        conversionRate
      },
      revenue: { 
        total: totalRevenue, 
        thisMonth: thisMonthRevenue, 
        lastMonth: lastMonthRevenue 
      },
      topServices,
      dailyStats,
      recurringClients
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}