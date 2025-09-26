import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const prisma = await getPrismaClient();
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Récupérer toutes les données du client
    const [
      user,
      reservations,
      loyaltyProfile,
      reviews,
      notifications
    ] = await Promise.all([
      // Informations du client
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          birthDate: true,
          skinType: true,
          allergies: true,
          preferences: true,
          createdAt: true
        }
      }),

      // Réservations du client
      prisma.reservation.findMany({
        where: { userId },
        include: {
          service: true
        },
        orderBy: {
          date: 'desc'
        }
      }),

      // Profil de fidélité
      prisma.loyaltyProfile.findUnique({
        where: { userId },
        include: {
          history: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 20
          }
        }
      }),

      // Avis du client
      prisma.review.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Notifications (si implémenté)
      prisma.notification.findMany({
        where: { 
          userId,
          read: false 
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }).catch(() => []) // Si la table n'existe pas encore
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Calculer les statistiques du client
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
    const totalSpent = confirmedReservations.reduce((sum, r) => sum + (r.service?.price || 0), 0);
    const upcomingReservations = reservations.filter(r => 
      r.status === 'confirmed' && new Date(r.date) > new Date()
    );
    const pastReservations = reservations.filter(r => 
      r.status === 'confirmed' && new Date(r.date) <= new Date()
    );

    // Services favoris
    const serviceCount: Record<string, number> = {};
    confirmedReservations.forEach(r => {
      if (r.service) {
        serviceCount[r.service.name] = (serviceCount[r.service.name] || 0) + 1;
      }
    });
    const favoriteServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Prochaine réservation
    const nextReservation = upcomingReservations[0] || null;

    // Dernière visite
    const lastVisit = pastReservations[0]?.date || null;

    // Points de fidélité
    const loyaltyPoints = loyaltyProfile?.points || 0;
    const loyaltyLevel = loyaltyProfile?.tier || 'BRONZE';
    
    // Calculer les points jusqu'au prochain niveau
    const pointsToNextLevel = 
      loyaltyLevel === 'BRONZE' ? Math.max(0, 500 - loyaltyPoints) :
      loyaltyLevel === 'SILVER' ? Math.max(0, 1000 - loyaltyPoints) :
      loyaltyLevel === 'GOLD' ? Math.max(0, 2000 - loyaltyPoints) :
      0;

    // Récompenses disponibles
    const availableRewards = 
      loyaltyPoints >= 100 ? Math.floor(loyaltyPoints / 100) : 0;

    // Données synchronisées
    const syncData = {
      user: {
        ...user,
        stats: {
          totalReservations: confirmedReservations.length,
          totalSpent,
          memberSince: user.createdAt,
          lastVisit,
          favoriteServices
        }
      },
      reservations: {
        upcoming: upcomingReservations.map(r => ({
          id: r.id,
          date: r.date,
          time: r.time,
          service: r.service?.name,
          price: r.service?.price,
          status: r.status
        })),
        past: pastReservations.slice(0, 10).map(r => ({
          id: r.id,
          date: r.date,
          time: r.time,
          service: r.service?.name,
          price: r.service?.price,
          status: r.status,
          canReview: !reviews.some(rev => rev.reservationId === r.id)
        })),
        nextReservation: nextReservation ? {
          date: nextReservation.date,
          time: nextReservation.time,
          service: nextReservation.service?.name,
          countdown: Math.floor((new Date(nextReservation.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        } : null
      },
      loyalty: {
        points: loyaltyPoints,
        level: loyaltyLevel,
        pointsToNextLevel,
        availableRewards,
        history: loyaltyProfile?.history || [],
        benefits: getLoyaltyBenefits(loyaltyLevel)
      },
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        response: r.response
      })),
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message,
        date: n.createdAt,
        read: n.read
      })),
      quickActions: {
        canBook: true,
        canReview: pastReservations.some(r => !reviews.some(rev => rev.reservationId === r.id)),
        hasUpcoming: upcomingReservations.length > 0,
        hasRewards: availableRewards > 0
      }
    };

    return NextResponse.json(syncData);
  } catch (error) {
    console.error('Erreur lors de la synchronisation client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}

// Helper pour obtenir les avantages par niveau
function getLoyaltyBenefits(level: string) {
  const benefits = {
    BRONZE: [
      '5% de réduction sur tous les soins',
      'Newsletter exclusive',
      'Invitation aux événements'
    ],
    SILVER: [
      '10% de réduction sur tous les soins',
      'Produit offert à votre anniversaire',
      'Accès prioritaire aux nouveaux soins',
      'Newsletter exclusive',
      'Invitation VIP aux événements'
    ],
    GOLD: [
      '15% de réduction sur tous les soins',
      'Soin gratuit à votre anniversaire',
      'Accès exclusif aux soins premium',
      'Consultation personnalisée offerte',
      'Newsletter exclusive',
      'Événements privés'
    ],
    PLATINUM: [
      '20% de réduction sur tous les soins',
      'Soin premium gratuit à votre anniversaire',
      'Accès illimité aux soins premium',
      'Consultation mensuelle offerte',
      'Service conciergerie',
      'Événements ultra-privés'
    ]
  };

  return benefits[level as keyof typeof benefits] || benefits.BRONZE;
}