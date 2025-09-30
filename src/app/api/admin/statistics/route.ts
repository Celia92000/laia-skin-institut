import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, subDays, differenceInDays } from 'date-fns';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();
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

    // Calculer les revenus uniquement pour les réservations confirmées et terminées
    const currentRevenue = currentReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const previousRevenue = previousReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const totalRevenue = allReservationsWithServices
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const thisYearRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfYear(now) && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const lastYearRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfYear(subYears(now, 1)) && r.date < startOfYear(now) && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);

    // Calculs de revenus supplémentaires
    const todayRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfDay(now) && r.date <= endOfDay(now) && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const yesterdayRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfDay(subDays(now, 1)) && r.date <= endOfDay(subDays(now, 1)) && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const thisWeekRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfWeek(now, { weekStartsOn: 1 }) && r.date <= endOfWeek(now, { weekStartsOn: 1 }) && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
    const lastWeekRevenue = allReservationsWithServices
      .filter(r => r.date >= startOfWeek(subDays(now, 7), { weekStartsOn: 1 }) && r.date <= endOfWeek(subDays(now, 7), { weekStartsOn: 1 }) && (r.status === 'confirmed' || r.status === 'completed'))
      .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);

    // Calculer le taux de conversion
    const conversionRate = totalReservations > 0 
      ? ((confirmedReservations / (confirmedReservations + cancelledReservations)) * 100).toFixed(1)
      : 0;

    // Calculer le taux de croissance
    const growthRate = previousRevenue > 0 
      ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : 0;

    // Services populaires avec revenus
    const serviceStats: Record<string, { count: number; revenue: number }> = {};
    allReservationsWithServices
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .forEach(r => {
        if (r.service) {
          const serviceName = r.service.name;
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = { count: 0, revenue: 0 };
          }
          serviceStats[serviceName].count += 1;
          serviceStats[serviceName].revenue += (r.totalPrice || r.service.price || 0);
        }
      });
    
    const popularServices = Object.entries(serviceStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, stats]) => ({ 
        name, 
        count: stats.count, 
        revenue: stats.revenue,
        satisfaction: 0 // À calculer avec les avis
      }));

    // Revenus par service pour le graphique
    const totalServiceRevenue = Object.values(serviceStats).reduce((sum, s) => sum + s.revenue, 0);
    const revenueByService = Object.entries(serviceStats)
      .map(([service, stats]) => ({
        service,
        revenue: stats.revenue,
        percentage: totalServiceRevenue > 0 ? Math.round((stats.revenue / totalServiceRevenue) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

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

    // Revenus par jour (derniers 7 jours)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRevenue = allReservationsWithServices
        .filter(r => 
          r.date >= startOfDay(date) && 
          r.date <= endOfDay(date) && 
          (r.status === 'confirmed' || r.status === 'completed')
        )
        .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
      return {
        date: dateStr,
        revenue: dayRevenue
      };
    });

    // Revenus par mois (12 derniers mois)
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(now, 11 - i);
      const monthStr = date.toLocaleDateString('fr-FR', { month: 'short' });
      const monthRevenue = allReservationsWithServices
        .filter(r => 
          r.date >= startOfMonth(date) && 
          r.date <= endOfMonth(date) && 
          (r.status === 'confirmed' || r.status === 'completed')
        )
        .reduce((sum, r) => sum + (r.totalPrice || r.service?.price || 0), 0);
      return {
        month: monthStr,
        revenue: monthRevenue,
        year: date.getFullYear()
      };
    });

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
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        thisWeek: thisWeekRevenue,
        lastWeek: lastWeekRevenue,
        averagePerClient: typeof averageCartValue === 'number' ? averageCartValue : parseFloat(averageCartValue),
        averagePerService: totalServiceRevenue > 0 && popularServices.length > 0 ? totalServiceRevenue / popularServices.length : 0,
        byMonth: last12Months,
        byDay: last7Days,
        byService: revenueByService,
        growthRate: typeof growthRate === 'number' ? growthRate : parseFloat(growthRate)
      },
      clients: {
        total: totalClients,
        active: activeClients,
        new: newClients,
        returning: clientsWithMultipleVisits,
        conversionRate: typeof retentionRate === 'number' ? retentionRate : parseFloat(retentionRate)
      },
      satisfaction: {
        average: typeof averageRating === 'number' ? averageRating : parseFloat(averageRating),
        total: recentReviews.length,
        distribution: {
          '5': recentReviews.filter(r => r.rating === 5).length,
          '4': recentReviews.filter(r => r.rating === 4).length,
          '3': recentReviews.filter(r => r.rating === 3).length,
          '2': recentReviews.filter(r => r.rating === 2).length,
          '1': recentReviews.filter(r => r.rating === 1).length
        },
        recentFeedback: recentReviews.slice(0, 5).map(r => ({
          clientName: r.user?.name || 'Client anonyme',
          rating: r.rating,
          comment: r.comment || '',
          date: r.createdAt,
          service: 'Service' // À améliorer avec la relation service
        }))
      },
      topServices: popularServices,
      dailyStats: last7Days.map(day => ({
        _id: day.date,
        count: allReservationsWithServices.filter(r => 
          r.date >= startOfDay(new Date(day.date)) && 
          r.date <= endOfDay(new Date(day.date))
        ).length,
        revenue: day.revenue
      })),
      recurringClients: clientsWithMultipleVisits,
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
      marketingPerformance: {
        emailOpenRate: 0,
        emailClickRate: 0,
        whatsappReadRate: 0,
        whatsappResponseRate: 0,
        campaignConversion: 0
      },
      loyalty: {
        totalActiveMembers: totalClients,
        newMembersThisMonth: newClients,
        totalPointsDistributed: 0, // À calculer depuis loyaltyHistory
        totalRewardsRedeemed: 0,
        averagePointsPerClient: 0,
        redemptionRate: 0,
        clientsNearReward: {
          services: 0,
          packages: 0
        },
        rewardsThisMonth: {
          services: { count: 0, value: 0 },
          packages: { count: 0, value: 0 },
          birthday: { count: 0, value: 0 },
          referral: { count: 0, value: 0 }
        },
        topLoyalClients: [],
        referralProgram: {
          totalReferrals: 0,
          successfulReferrals: 0,
          conversionRate: 0,
          totalRewardsGiven: 0
        }
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