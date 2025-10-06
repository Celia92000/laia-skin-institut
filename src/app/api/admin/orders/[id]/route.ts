import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { scheduledDate, scheduledTime, status } = body;

    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        scheduledTime,
        status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
