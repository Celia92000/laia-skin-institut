import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// GET - Récupérer un avis spécifique par ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const { id } = await params;

    // Vérifier si c'est un avis Google ou normal
    const isGoogleReview = id.startsWith('google_');

    if (isGoogleReview) {
      const review = await prisma.googleReview.findUnique({
        where: { id: id.replace('google_', '') }
      });

      if (!review) {
        return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
      }

      return NextResponse.json({
        id: `google_${review.id}`,
        ...review,
        isGoogleReview: true
      });
    } else {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!review) {
        return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
      }

      return NextResponse.json({
        ...review,
        userName: review.user?.name,
        userEmail: review.user?.email,
        photos: typeof review.photos === 'string'
          ? (review.photos ? JSON.parse(review.photos) : [])
          : review.photos,
        isGoogleReview: false
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const { id } = await params;
    const data = await request.json();

    // Vérifier si c'est un avis Google ou normal
    const isGoogleReview = id.startsWith('google_');
    
    if (isGoogleReview) {
      // Pour les avis Google, on peut seulement ajouter une réponse
      if (data.response !== undefined) {
        const review = await prisma.googleReview.update({
          where: { id: id.replace('google_', '') },
          data: { 
            replyText: data.response,
            replyAt: new Date()
          }
        });
        return NextResponse.json(review);
      }
    } else {
      // Pour les avis normaux, on peut tout modifier
      const updateData: any = {};
      if (data.published !== undefined) updateData.approved = data.published;
      if (data.response !== undefined) updateData.response = data.response;
      if (data.photos !== undefined) updateData.photos = JSON.stringify(data.photos);
      
      const review = await prisma.review.update({
        where: { id },
        data: updateData
      });
      
      return NextResponse.json(review);
    }

    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const { id } = await params;
    
    // On ne peut supprimer que les avis non-Google
    if (id.startsWith('google_')) {
      return NextResponse.json({ error: 'Impossible de supprimer un avis Google' }, { status: 403 });
    }
    
    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Avis supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}