import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

export async function GET() {
  const prisma = await getPrismaClient();
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Récupérer toutes les données nécessaires
    const [
      todayReservations,
      weekReservations,
      monthReservations,
      pendingReservations,
      totalClients,
      activeClients,
      recentReservations,
      upcomingReservations,
      services,
      reviews,
      blockedSlots
    ] = await Promise.all([
      // Réservations d'aujourd'hui
      prisma.reservation.findMany({
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        include: {
          user: true,
          service: true
        }
      }),

      // Réservations de la semaine
      prisma.reservation.findMany({
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        include: {
          service: true
        }
      }),

      // Réservations du mois
      prisma.reservation.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        include: {
          service: true
        }
      }),

      // Réservations en attente
      prisma.reservation.findMany({
        where: {
          status: 'pending',
          date: {
            gte: now
          }
        },
        include: {
          user: true,
          service: true
        }
      }),

      // Total des clients
      prisma.user.count(),

      // Clients actifs (avec réservation dans les 30 derniers jours)
      prisma.user.count({
        where: {
          reservations: {
            some: {
              date: {
                gte: subDays(now, 30)
              }
            }
          }
        }
      }),

      // Réservations récentes
      prisma.reservation.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          user: true,
          service: true
        }
      }),

      // Prochaines réservations
      prisma.reservation.findMany({
        where: {
          date: {
            gte: now
          },
          status: 'confirmed'
        },
        orderBy: {
          date: 'asc'
        },
        take: 10,
        include: {
          user: true,
          service: true
        }
      }),

      // Services
      prisma.service.findMany({
        include: {
          _count: {
            select: { reservations: true }
          }
        }
      }),

      // Avis récents
      prisma.review.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        include: {
          user: true
        }
      }),

      // Créneaux bloqués
      prisma.blockedSlot.findMany({
        where: {
          date: {
            gte: now
          }
        },
        orderBy: {
          date: 'asc'
        }
      })
    ]);

    // Calculer les statistiques
    const todayRevenue = todayReservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.service?.price || 0), 0);

    const weekRevenue = weekReservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.service?.price || 0), 0);

    const monthRevenue = monthReservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.service?.price || 0), 0);

    // Service le plus populaire
    const popularService = services.sort((a, b) => 
      b._count.reservations - a._count.reservations
    )[0];

    // Taux d'occupation pour aujourd'hui
    const totalSlotsPerDay = 16; // 8 créneaux de 1h de 9h à 17h
    const occupancyRate = (todayReservations.length / totalSlotsPerDay) * 100;

    // Note moyenne des avis
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Préparer la réponse
    const dashboardData = {
      stats: {
        todayReservations: todayReservations.length,
        weekReservations: weekReservations.length,
        monthReservations: monthReservations.length,
        pendingReservations: pendingReservations.length,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalClients,
        activeClients,
        occupancyRate: Math.round(occupancyRate),
        averageRating: averageRating.toFixed(1)
      },
      recentReservations: recentReservations.map(r => ({
        id: r.id,
        client: r.user?.name || 'Client inconnu',
        service: r.service?.name || 'Service inconnu',
        date: r.date,
        time: r.time,
        status: r.status,
        price: r.service?.price || 0
      })),
      upcomingReservations: upcomingReservations.map(r => ({
        id: r.id,
        client: r.user?.name || 'Client inconnu',
        service: r.service?.name || 'Service inconnu',
        date: r.date,
        time: r.time,
        status: r.status,
        price: r.service?.price || 0
      })),
      pendingReservationsList: pendingReservations.map(r => ({
        id: r.id,
        client: r.user?.name || 'Client inconnu',
        service: r.service?.name || 'Service inconnu',
        date: r.date,
        time: r.time,
        status: r.status,
        price: r.service?.price || 0
      })),
      popularServices: services
        .sort((a, b) => b._count.reservations - a._count.reservations)
        .slice(0, 5)
        .map(s => ({
          name: s.name,
          count: s._count.reservations,
          revenue: s.price * s._count.reservations
        })),
      recentReviews: reviews.map(r => ({
        id: r.id,
        client: r.user?.name || 'Client anonyme',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      })),
      blockedSlots: blockedSlots.map(slot => ({
        id: slot.id,
        date: slot.date,
        time: slot.time,
        reason: slot.reason
      }))
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}