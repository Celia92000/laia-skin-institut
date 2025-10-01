import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// API publique pour vérifier s'il y a des formations actives
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const formations = await prisma.formation.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    return NextResponse.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return NextResponse.json([], { status: 200 }); // Retourne tableau vide en cas d'erreur
  }
}
