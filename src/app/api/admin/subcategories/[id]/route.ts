import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer une sous-catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const subcategory = await prisma.serviceSubcategory.findUnique({
      where: { id: params.id },
      include: {
        category: true,
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

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la sous-catégorie' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une sous-catégorie
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid || auth.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, name, description, icon, image, active, order } = body;

    // Si le nom change, régénérer le slug
    let slug = body.slug;
    if (name && !slug) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Vérifier si le slug existe déjà (sauf pour cette sous-catégorie)
      const existingSubcategory = await prisma.serviceSubcategory.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      });

      if (existingSubcategory) {
        return NextResponse.json(
          { error: 'Une sous-catégorie avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    // Si changement de catégorie parente, vérifier qu'elle existe
    if (categoryId) {
      const category = await prisma.serviceCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Catégorie parente non trouvée' },
          { status: 404 }
        );
      }
    }

    const subcategory = await prisma.serviceSubcategory.update({
      where: { id: params.id },
      data: {
        ...(categoryId && { categoryId }),
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(image !== undefined && { image }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order })
      },
      include: {
        category: true,
        _count: {
          select: { services: true }
        }
      }
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la sous-catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une sous-catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid || auth.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier si la sous-catégorie a des services associés
    const subcategory = await prisma.serviceSubcategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { services: true }
        }
      }
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (subcategory._count.services > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer cette sous-catégorie. Elle contient ${subcategory._count.services} service(s). Veuillez d'abord réassigner ou supprimer ces services.` },
        { status: 400 }
      );
    }

    await prisma.serviceSubcategory.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Sous-catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la sous-catégorie' },
      { status: 500 }
    );
  }
}
