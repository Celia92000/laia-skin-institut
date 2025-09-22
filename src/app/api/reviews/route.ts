import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const featured = searchParams.get('featured');
    
    const where: any = {};
    if (approved !== null) where.approved = approved === 'true';
    if (featured !== null) where.featured = featured === 'true';

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculer les statistiques
    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0,
      distribution: {
        '5': reviews.filter(r => r.rating === 5).length,
        '4': reviews.filter(r => r.rating === 4).length,
        '3': reviews.filter(r => r.rating === 3).length,
        '2': reviews.filter(r => r.rating === 2).length,
        '1': reviews.filter(r => r.rating === 1).length,
      }
    };

    return NextResponse.json({
      reviews,
      stats
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, serviceName, rating, comment, reservationId, source } = body;

    // Si un reservationId est fourni, vérifier la réservation
    if (reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          userId: userId || undefined
        }
      });

      if (!reservation) {
        return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 400 });
      }

      // Utiliser l'userId de la réservation si pas fourni
      if (!userId && reservation.userId) {
        body.userId = reservation.userId;
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: body.userId || userId,
        reservationId,
        serviceName: serviceName || 'Service',
        rating,
        comment,
        source: source || 'site',
        approved: false, // Les avis doivent être approuvés manuellement
        googleReview: rating === 5 // Suggérer Google pour 5 étoiles
      }
    });

    // URL Google Business LAIA SKIN Institut
    const googleUrl = rating === 5 
      ? 'https://www.google.com/maps/place/?q=place_id:3014602962211627658' 
      : null;

    return NextResponse.json({
      review,
      suggestGoogle: rating === 5,
      googleUrl
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'avis' }, { status: 500 });
  }
}