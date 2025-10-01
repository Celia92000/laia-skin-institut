import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer les réductions disponibles pour le client
    const discounts = await prisma.discount.findMany({
      where: {
        userId: userId,
        status: 'available'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(discounts);

  } catch (error) {
    console.error('Erreur récupération réductions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réductions' },
      { status: 500 }
    );
  }
}
