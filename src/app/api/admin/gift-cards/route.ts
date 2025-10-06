import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Liste toutes les cartes cadeaux
export async function GET(request: NextRequest) {
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

    // Récupérer toutes les cartes cadeaux
    const giftCards = await prisma.giftCard.findMany({
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            totalPrice: true,
            giftCardUsedAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(giftCards);
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes cadeaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle carte cadeau
export async function POST(request: NextRequest) {
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
    const {
      code,
      amount,
      purchasedFor,
      recipientEmail,
      recipientPhone,
      message,
      expiryDate,
      notes
    } = body;

    // Créer la carte cadeau
    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount,
        initialAmount: amount,
        balance: amount,
        purchasedFor,
        recipientEmail,
        recipientPhone,
        message,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes,
        createdBy: decoded.userId,
        status: 'active'
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(giftCard, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la carte cadeau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
