import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cache } from '@/lib/cache';

// API publique pour vérifier s'il y a des produits actifs
export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'products:active';

    // Vérifier le cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const prisma = await getPrismaClient();
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    // Mettre en cache pour 2 minutes
    cache.set(cacheKey, products, 120000);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json([], { status: 200 }); // Retourne tableau vide en cas d'erreur
  }
}
