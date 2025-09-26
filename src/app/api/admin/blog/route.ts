import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// GET - Récupérer tous les articles
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    // Récupération sans authentification pour debug
    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' }
    });

    console.log('📚 Articles trouvés dans la DB:', posts.length);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des articles:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouvel article
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

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}