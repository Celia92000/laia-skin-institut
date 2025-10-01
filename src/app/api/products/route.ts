import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// API publique pour vérifier s'il y a des produits actifs
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json([], { status: 200 }); // Retourne tableau vide en cas d'erreur
  }
}
