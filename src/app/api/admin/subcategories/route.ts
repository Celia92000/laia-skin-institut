import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer toutes les sous-catégories ou par catégorie
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const subcategories = await prisma.serviceSubcategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: { services: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sous-catégories' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle sous-catégorie
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid || auth.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, name, description, icon, image } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'L\'ID de la catégorie parente est requis' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie parente existe
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie parente non trouvée' },
        { status: 404 }
      );
    }

    // Générer un slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Vérifier si le slug existe déjà
    const existingSubcategory = await prisma.serviceSubcategory.findUnique({
      where: { slug }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'Une sous-catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Obtenir le prochain ordre pour cette catégorie
    const lastSubcategory = await prisma.serviceSubcategory.findFirst({
      where: { categoryId },
      orderBy: { order: 'desc' }
    });
    const order = (lastSubcategory?.order ?? -1) + 1;

    const subcategory = await prisma.serviceSubcategory.create({
      data: {
        categoryId,
        name,
        slug,
        description,
        icon,
        image,
        order
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la sous-catégorie' },
      { status: 500 }
    );
  }
}
