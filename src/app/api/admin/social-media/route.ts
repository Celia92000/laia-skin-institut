import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// GET - Récupérer toutes les publications
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      whereClause = {
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const posts = await prisma.socialMediaPost.findMany({
      where: whereClause,
      orderBy: { scheduledDate: 'asc' }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des publications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle publication
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const data = await request.json();

    const post = await prisma.socialMediaPost.create({
      data: {
        title: data.title,
        content: data.content,
        platform: data.platform || null,
        scheduledDate: new Date(data.scheduledDate),
        status: data.status || 'draft',
        notes: data.notes || null,
        links: data.links ? JSON.stringify(data.links) : null,
        hashtags: data.hashtags || null,
        mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la publication:', error);
    return NextResponse.json({
      error: 'Erreur lors de la création de la publication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour une publication
export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Préparer les données à mettre à jour
    const dataToUpdate: any = {
      title: updateData.title,
      content: updateData.content,
      platform: updateData.platform || null,
      scheduledDate: new Date(updateData.scheduledDate),
      status: updateData.status,
      notes: updateData.notes || null,
      hashtags: updateData.hashtags || null,
    };

    if (updateData.links) {
      dataToUpdate.links = JSON.stringify(updateData.links);
    }

    if (updateData.mediaUrls) {
      dataToUpdate.mediaUrls = JSON.stringify(updateData.mediaUrls);
    }

    if (updateData.status === 'published' && !updateData.publishedAt) {
      dataToUpdate.publishedAt = new Date();
    }

    const post = await prisma.socialMediaPost.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la publication:', error);
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Supprimer une publication
export async function DELETE(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.socialMediaPost.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Publication supprimée' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la publication:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
