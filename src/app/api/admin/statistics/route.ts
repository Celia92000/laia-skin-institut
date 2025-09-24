import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, subDays, differenceInDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode') || 'month';
    const selectedDate = searchParams.get('selectedDate') || new Date().toISOString();
    const selectedMonth = searchParams.get('selectedMonth') || new Date().toISOString().slice(0, 7);
    const selectedYear = searchParams.get('selectedYear') || new Date().getFullYear().toString();

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Déterminer les dates selon le mode de vue
    if (viewMode === 'day') {
      const date = new Date(selectedDate);
      startDate = startOfDay(date);
      endDate = endOfDay(date);
      previousStartDate = startOfDay(subDays(date, 1));
      previousEndDate = endOfDay(subDays(date, 1));
    } else if (viewMode === 'month') {
      const date = new Date(selectedMonth + '-01');
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      previousStartDate = startOfMonth(subMonths(date, 1));
      previousEndDate = endOfMonth(subMonths(date, 1));
    } else {
      const date = new Date(selectedYear + '-01-01');
      startDate = startOfYear(date);
      endDate = endOfYear(date);
      previousStartDate = startOfYear(subYears(date, 1));
      previousEndDate = endOfYear(subYears(date, 1));
    }

    // Récupérer toutes les réservations
    const [
      totalReservations,
      currentReservations,
      previousReservations,
      todayReservations,
      weekReservations,
      monthReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalClients,
      activeClients,
      newClients,
      allServices,
      allReservationsWithServices,
      recentReviews,
      clientRetentionData
    ] = await Promise.all([
      // Total des réservations
      prisma.reservation.count(),
      
      // Réservations période actuelle
      prisma.reservation.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: true,
          service: true
        }
      }),

      // Réservations période précédente
      prisma.reservation.findMany({
        where: {
          date: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        },
        include: {
          service: true
        }
      }),

      // Réservations d'aujourd'hui
      prisma.reservation.count({
        where: {
          date: {
            gte: startOfDay(now),
            lte: endOfDay(now)
          }
        }
      }),

      // Réservations de la semaine
      prisma.reservation.count({
        where: {
          date: {
            gte: startOfWeek(now, { weekStartsOn: 1 }),
            lte: endOfWeek(now, { weekStartsOn: 1 })
          }
        }
      }),

      // Réservations du mois
      prisma.reservation.count({
        where: {
          date: {
            gte: startOfMonth(now),
            lte: endOfMonth(now)
          }
        }
      }),

      // Réservations en attente
      prisma.reservation.count({
        where: {
          status: 'pending',
          date: {
            gte: now
          }
        }
      }),

      // Réservations confirmées
      prisma.reservation.count({
        where: {
          status: 'confirmed',
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Réservations annulées
      prisma.reservation.count({
        where: {
          status: 'cancelled',
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Total des clients
      prisma.user.count(),

      // Clients actifs (avec réservation dans les 3 derniers mois)
      prisma.user.count({
        where: {
          reservations: {
            some: {
              date: {
                gte: subMonths(now, 3)
              }
            }
          }
        }
      }),

      // Nouveaux clients du mois
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth(now)
          }
        }
      }),

      // Tous les services
      prisma.service.findMany(),

      // Toutes les réservations avec services pour calculer les revenus
      prisma.reservation.findMany({
        where: {
          status: 'confirmed'
        },
        include: {
          service: true
        }
      }),

      // Avis récents
      prisma.review.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          user: true
        }
      }),

      // Données de rétention
      prisma.user.findMany({
        include: {
          reservations: {
            orderBy: {
              date: 'desc'
            }
          }
        }
      })
    ]);

    // Calculer les revenus
    const currentRevenue = currentReservations.reduce((sum, r) => 
      sum + (r.service?.price || 0), 0
    );
    const previousRevenue = previousReservations.reduce((sum, r) => 
      sum + (r.service?.price || 0), 0
    );
    const totalRevenue = allReservationsWithServices.reduce((sum, r) => 
      sum + (r.service?.price || 0), 0
    );
    const thisYearRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfYear(now))
      .reduce((sum, r) => sum + (r.service?.price || 0), 0);
    const lastYearRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfYear(subYears(now, 1)) && r.date < startOfYear(now))
      .reduce((sum, r) => sum + (r.service?.price || 0), 0);

    // Calculer le taux de conversion
    const conversionRate = totalReservations > 0 
      ? ((confirmedReservations / (confirmedReservations + cancelledReservations)) * 100).toFixed(1)
      : 0;

    // Calculer le taux de croissance
    const growthRate = previousRevenue > 0 
      ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : 0;

    // Services populaires
    const serviceCount: Record<string, number> = {};
    currentReservations.forEach(r => {
      if (r.service) {
        serviceCount[r.service.name] = (serviceCount[r.service.name] || 0) + 1;
      }
    });
    const popularServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Distribution horaire
    const hourlyDistribution: Record<string, number> = {};
    currentReservations.forEach(r => {
      const hour = r.time.split(':')[0] + 'h';
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourlyDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([hour, bookings]) => ({ hour, bookings }));

    // Rétention client
    const clientsWithMultipleVisits = clientRetentionData.filter(c => 
      c.reservations.length > 1
    ).length;
    const retentionRate = totalClients > 0 
      ? ((clientsWithMultipleVisits / totalClients) * 100).toFixed(1)
      : 0;

    // Clients perdus (pas de visite depuis 6 mois)
    const lostClients = clientRetentionData.filter(c => {
      const lastVisit = c.reservations[0]?.date;
      return lastVisit && differenceInDays(now, lastVisit) > 180;
    }).length;

    // Moyenne de visites par client
    const totalVisits = clientRetentionData.reduce((sum, c) => 
      sum + c.reservations.length, 0
    );
    const averageVisitsPerClient = totalClients > 0 
      ? (totalVisits / totalClients).toFixed(1)
      : 0;

    // Note moyenne des avis
    const averageRating = recentReviews.length > 0
      ? (recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length).toFixed(1)
      : 0;

    // Panier moyen
    const averageCartValue = currentReservations.length > 0
      ? (currentRevenue / currentReservations.length).toFixed(2)
      : 0;

    const stats = {
      reservations: {
        total: totalReservations,
        today: todayReservations,
        thisWeek: weekReservations,
        thisMonth: monthReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        cancelled: cancelledReservations,
        conversionRate: typeof conversionRate === 'number' ? conversionRate : parseFloat(conversionRate)
      },
      revenue: {
        total: totalRevenue,
        thisMonth: currentRevenue,
        lastMonth: previousRevenue,
        thisYear: thisYearRevenue,
        lastYear: lastYearRevenue,
        growthRate: typeof growthRate === 'number' ? growthRate : parseFloat(growthRate),
        averageCartValue: typeof averageCartValue === 'number' ? averageCartValue : parseFloat(averageCartValue)
      },
      clients: {
        total: totalClients,
        active: activeClients,
        new: newClients,
        returning: clientsWithMultipleVisits,
        conversionRate: typeof retentionRate === 'number' ? retentionRate : parseFloat(retentionRate)
      },
      services: {
        total: allServices.length,
        totalBookings: currentReservations.length,
        popularServices,
        averageRating: typeof averageRating === 'number' ? averageRating : parseFloat(averageRating)
      },
      performance: {
        occupancyRate: 75.5, // À calculer selon les créneaux disponibles
        peakHours,
        averageSessionTime: 90,
        satisfactionScore: typeof averageRating === "number" ? averageRating : parseFloat(averageRating)
      },
      clientRetention: {
        rate: typeof retentionRate === "number" ? retentionRate : parseFloat(retentionRate),
        newClients,
        lostClients,
        averageVisitsPerClient: typeof averageVisitsPerClient === 'number' ? averageVisitsPerClient : parseFloat(averageVisitsPerClient),
        timeBetweenVisits: 42 // À calculer
      }
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