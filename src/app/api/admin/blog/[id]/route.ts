import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// PUT - Mettre à jour un article
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
    
    // Générer le slug si non fourni
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[àáäâ]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.published ? data.publishedAt || new Date() : null
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Désactivé pour éviter la suppression accidentelle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  // La suppression est désactivée pour protéger les articles
  return NextResponse.json(
    { error: 'La suppression d\'articles est désactivée pour des raisons de sécurité' }, 
    { status: 403 }
  );
}