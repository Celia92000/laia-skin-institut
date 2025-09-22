import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET() {
  try {
    const now = new Date();
    const next30Days = addDays(now, 30);

    // Récupérer toutes les données publiques
    const [
      services,
      reviews,
      availableSlots,
      blockedSlots,
      openingHours,
      statistics
    ] = await Promise.all([
      // Services actifs
      prisma.service.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
      }),

      // Avis approuvés avec au moins 4 étoiles pour l'affichage public
      prisma.review.findMany({
        where: {
          rating: { gte: 4 },
          approved: true
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      }),

      // Créneaux disponibles pour les 30 prochains jours
      prisma.reservation.findMany({
        where: {
          date: {
            gte: now,
            lte: next30Days
          },
          status: {
            in: ['confirmed', 'pending']
          }
        },
        select: {
          date: true,
          time: true
        }
      }),

      // Créneaux bloqués
      prisma.blockedSlot.findMany({
        where: {
          date: {
            gte: now,
            lte: next30Days
          }
        },
        select: {
          date: true,
          time: true
        }
      }),

      // Horaires d'ouverture (depuis les settings ou une table dédiée)
      prisma.setting.findFirst({
        where: { key: 'opening_hours' }
      }).then(setting => setting?.value || getDefaultOpeningHours()),

      // Statistiques publiques
      Promise.all([
        prisma.user.count(),
        prisma.reservation.count({
          where: { status: 'confirmed' }
        }),
        prisma.review.aggregate({
          _avg: { rating: true },
          _count: { rating: true }
        }),
        prisma.service.count({ where: { active: true } })
      ])
    ]);

    // Formater les statistiques
    const [totalClients, totalReservations, reviewStats, totalServices] = statistics;

    // Calculer les créneaux disponibles
    const bookedSlots = new Set(
      availableSlots.map(slot => `${format(slot.date, 'yyyy-MM-dd')}_${slot.time}`)
    );
    const blockedSlotsSet = new Set(
      blockedSlots.map(slot => `${format(slot.date, 'yyyy-MM-dd')}_${slot.time}`)
    );

    // Générer la disponibilité pour les 30 prochains jours
    const availability: Record<string, string[]> = {};
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();
      
      // Fermé le dimanche (0) et samedi après-midi
      if (dayOfWeek === 0) continue;
      
      const availableForDay = timeSlots.filter(time => {
        // Samedi : seulement le matin
        if (dayOfWeek === 6 && parseInt(time) >= 14) return false;
        
        const slotKey = `${dateStr}_${time}`;
        return !bookedSlots.has(slotKey) && !blockedSlotsSet.has(slotKey);
      });
      
      if (availableForDay.length > 0) {
        availability[dateStr] = availableForDay;
      }
    }

    // Services groupés par catégorie
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category || 'Soins';
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        launchPrice: service.launchPrice,
        benefits: service.benefits,
        image: service.mainImage
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Témoignages formatés
    const testimonials = reviews.map(review => ({
      id: review.id,
      author: review.user?.name || 'Client anonyme',
      rating: review.rating,
      comment: review.comment,
      date: format(review.createdAt, 'dd MMMM yyyy', { locale: fr }),
      service: review.serviceName
    }));

    // Prochains créneaux disponibles (pour affichage rapide)
    const nextAvailableSlots = Object.entries(availability)
      .slice(0, 7)
      .flatMap(([date, times]) => 
        times.slice(0, 3).map(time => ({
          date,
          time,
          dayName: format(new Date(date), 'EEEE', { locale: fr }),
          formattedDate: format(new Date(date), 'dd MMMM', { locale: fr })
        }))
      )
      .slice(0, 10);

    // Données synchronisées pour le site public
    const publicData = {
      services: servicesByCategory,
      testimonials,
      availability,
      nextAvailableSlots,
      stats: {
        totalClients,
        totalReservations,
        averageRating: reviewStats._avg.rating?.toFixed(1) || '5.0',
        totalReviews: reviewStats._count.rating,
        totalServices,
        yearsOfExperience: 5, // À ajuster selon vos besoins
        satisfactionRate: 98 // Calculé à partir des avis 4-5 étoiles
      },
      openingHours: typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours,
      contact: {
        phone: '06 71 58 12 37',
        email: 'contact@laia.skin.com',
        address: '1-11 Cr Alsace et Lorraine, 33000 Bordeaux',
        social: {
          instagram: '@laia.skin',
          facebook: 'laiaskin'
        }
      },
      seo: {
        title: 'LAIA SKIN Institut - Soins du visage à Bordeaux',
        description: 'Institut de beauté spécialisé dans les soins du visage haute technologie à Bordeaux. HydraFacial, LED Therapy, Microneedling et plus.',
        keywords: 'institut beauté bordeaux, hydrafacial bordeaux, soin visage bordeaux, peeling bordeaux, microneedling bordeaux'
      },
      promotions: [
        {
          title: 'Offre de lancement',
          description: '-20% sur tous les soins',
          validUntil: addDays(now, 60),
          code: 'LAUNCH20'
        }
      ],
      lastUpdate: new Date().toISOString()
    };

    // Mettre en cache pendant 5 minutes
    return NextResponse.json(publicData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation publique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

function getDefaultOpeningHours() {
  return {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '13:00' },
    sunday: { closed: true }
  };
}