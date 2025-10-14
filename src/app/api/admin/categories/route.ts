import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer toutes les catégories avec leurs sous-catégories
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const categories = await prisma.serviceCategory.findMany({
      include: {
        subcategories: {
          orderBy: { order: 'asc' },
          where: { active: true }
        },
        _count: {
          select: { services: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid || auth.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, color, image, metaTitle, metaDescription, keywords, featured } = body;

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Vérifier si le slug existe déjà
    const existingCategory = await prisma.serviceCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Obtenir le prochain ordre
    const lastCategory = await prisma.serviceCategory.findFirst({
      orderBy: { order: 'desc' }
    });
    const order = (lastCategory?.order ?? -1) + 1;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        color: color || '#e11d48',
        image,
        metaTitle,
        metaDescription,
        keywords,
        featured: featured || false,
        order
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}
