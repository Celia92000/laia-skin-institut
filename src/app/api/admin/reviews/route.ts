import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    // Récupérer les avis de la base de données
    const reviews = await prisma.review.findMany({
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer aussi les avis Google
    const googleReviews = await prisma.googleReview.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Formater les avis pour l'interface
    const formattedReviews = [
      ...reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        satisfaction: r.satisfaction,
        clientName: r.user?.name || 'Client anonyme',
        clientEmail: r.user?.email,
        clientPhone: r.user?.phone,
        serviceName: r.serviceName,
        source: r.source || 'website',
        createdAt: r.createdAt,
        published: r.approved,
        response: r.response,
        photos: r.photos ? JSON.parse(r.photos) : []
      })),
      ...googleReviews.map(g => ({
        id: 'google_' + g.id,
        rating: g.rating,
        comment: g.comment,
        clientName: g.authorName,
        clientEmail: null,
        clientPhone: null,
        serviceName: null,
        source: 'google',
        createdAt: g.publishedAt,
        published: true,
        response: g.replyText,
        photos: []
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const data = await request.json();
    
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.clientId,
        serviceName: data.serviceName,
        source: data.source || 'website',
        approved: data.published || false
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}