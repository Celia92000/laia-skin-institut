import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const { slug } = await params;

    const formation = await prisma.formation.findUnique({
      where: { slug }
    });

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(formation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
