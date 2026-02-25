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
            email: true,
            phone: true
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
      senderName,
      purchasedFor,
      recipientEmail,
      recipientPhone,
      message,
      expiryDate,
      notes,
      paymentMethod
    } = body;

    // Validation
    if (!amount) {
      return NextResponse.json({ error: 'Le montant est requis' }, { status: 400 });
    }

    // Générer un code si non fourni
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'GC-';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      result += '-';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const finalCode = code || generateCode();

    // Définir la date d'expiration (1 an par défaut si non spécifiée)
    let finalExpiryDate: Date;
    if (expiryDate) {
      finalExpiryDate = new Date(expiryDate);
    } else {
      finalExpiryDate = new Date();
      finalExpiryDate.setFullYear(finalExpiryDate.getFullYear() + 1);
    }

    // Gérer l'émetteur (purchaser) si senderName est fourni
    let purchaserId = null;
    if (senderName) {
      // Créer un nouvel utilisateur pour l'émetteur
      const purchaser = await prisma.user.create({
        data: {
          name: senderName,
          email: `gift_sender_${Date.now()}@temp.com`,
          password: 'temp_password',
          role: 'client'
        }
      });
      purchaserId = purchaser.id;
    }

    // Créer la carte cadeau
    const giftCard = await prisma.giftCard.create({
      data: {
        code: finalCode,
        amount,
        initialAmount: amount,
        balance: amount,
        purchasedBy: purchaserId,
        purchasedFor,
        recipientEmail,
        recipientPhone,
        message,
        expiryDate: finalExpiryDate,
        notes,
        createdBy: decoded.userId,
        status: 'active',
        paymentMethod: paymentMethod || 'CB',
        paymentStatus: 'paid'
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
