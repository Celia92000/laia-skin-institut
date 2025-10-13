import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les cartes cadeaux achetées par le client
    const purchasedGiftCards = await prisma.giftCard.findMany({
      where: {
        purchaserId: decoded.userId
      },
      include: {
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            giftCardUsedAmount: true,
            status: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les cartes cadeaux reçues (où purchasedFor correspond à l'email du client)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true, name: true }
    });

    const receivedGiftCards = await prisma.giftCard.findMany({
      where: {
        purchasedFor: user?.email
      },
      include: {
        purchaser: {
          select: {
            name: true,
            email: true
          }
        },
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            giftCardUsedAmount: true,
            status: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      purchased: purchasedGiftCards.map(card => ({
        id: card.id,
        code: card.code,
        initialAmount: card.initialAmount,
        balance: card.balance,
        purchasedFor: card.purchasedFor,
        status: card.status,
        createdAt: card.createdAt.toISOString(),
        expiryDate: card.expiryDate?.toISOString(),
        usedDate: card.usedDate?.toISOString(),
        reservations: card.reservations.map(res => ({
          id: res.id,
          date: res.date.toISOString(),
          time: res.time,
          amount: res.giftCardUsedAmount,
          status: res.status
        }))
      })),
      received: receivedGiftCards.map(card => ({
        id: card.id,
        code: card.code,
        initialAmount: card.initialAmount,
        balance: card.balance,
        purchasedBy: card.purchaser?.name,
        status: card.status,
        createdAt: card.createdAt.toISOString(),
        expiryDate: card.expiryDate?.toISOString(),
        usedDate: card.usedDate?.toISOString(),
        reservations: card.reservations.map(res => ({
          id: res.id,
          date: res.date.toISOString(),
          time: res.time,
          amount: res.giftCardUsedAmount,
          status: res.status
        }))
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes cadeaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
