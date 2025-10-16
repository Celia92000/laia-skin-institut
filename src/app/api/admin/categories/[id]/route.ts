import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { id: params.id },
      include: {
        subcategories: {
          orderBy: { order: 'asc' }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            active: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une catégorie
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, color, image, metaTitle, metaDescription, keywords, featured, active, order } = body;

    // Si le nom change, régénérer le slug
    let slug = body.slug;
    if (name && !slug) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Vérifier si le slug existe déjà (sauf pour cette catégorie)
      const existingCategory = await prisma.serviceCategory.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Une catégorie avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.serviceCategory.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color && { color }),
        ...(image !== undefined && { image }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(keywords !== undefined && { keywords }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order })
      },
      include: {
        subcategories: true,
        _count: {
          select: { services: true }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token || '');
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier si la catégorie a des services associés
    const category = await prisma.serviceCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { services: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (category._count.services > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer cette catégorie. Elle contient ${category._count.services} service(s). Veuillez d'abord réassigner ou supprimer ces services.` },
        { status: 400 }
      );
    }

    await prisma.serviceCategory.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}
