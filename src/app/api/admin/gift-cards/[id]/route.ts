import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// PATCH - Mettre à jour une carte cadeau
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
    const {
      initialAmount,
      balance,
      purchasedFor,
      recipientEmail,
      recipientPhone,
      message,
      expiryDate,
      status,
      notes,
      purchaserName
    } = body;

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (initialAmount !== undefined) updateData.initialAmount = initialAmount;
    if (balance !== undefined) updateData.balance = balance;
    if (purchasedFor !== undefined) updateData.purchasedFor = purchasedFor;
    if (recipientEmail !== undefined) updateData.recipientEmail = recipientEmail;
    if (recipientPhone !== undefined) updateData.recipientPhone = recipientPhone;
    if (message !== undefined) updateData.message = message;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'used') updateData.usedDate = new Date();
    }
    if (notes !== undefined) updateData.notes = notes;

    // Gérer le nom de l'émetteur
    if (purchaserName !== undefined) {
      // Récupérer la carte actuelle pour voir si elle a déjà un purchaser
      const currentCard = await prisma.giftCard.findUnique({
        where: { id: params.id },
        include: { purchaser: true }
      });

      if (currentCard?.purchaser) {
        // Mettre à jour le nom de l'utilisateur existant
        await prisma.user.update({
          where: { id: currentCard.purchaser.id },
          data: { name: purchaserName }
        });
      } else if (purchaserName) {
        // Créer un nouvel utilisateur pour l'émetteur
        const newPurchaser = await prisma.user.create({
          data: {
            name: purchaserName,
            email: `gift_purchaser_${Date.now()}@temp.com`,
            password: 'temp_password',
            role: 'client'
          }
        });
        updateData.purchasedBy = newPurchaser.id;
      }
    }

    // Calculer usedAmount si balance et initialAmount sont disponibles
    if (initialAmount !== undefined && balance !== undefined) {
      updateData.usedAmount = initialAmount - balance;
    } else if (balance !== undefined) {
      // Si seulement le balance est fourni, récupérer initialAmount de la base
      const currentCard = await prisma.giftCard.findUnique({
        where: { id: params.id }
      });
      if (currentCard) {
        updateData.usedAmount = currentCard.initialAmount - balance;
      }
    }

    // Mettre à jour la carte cadeau
    const giftCard = await prisma.giftCard.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte cadeau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une carte cadeau
export async function DELETE(
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

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier si la carte a des réservations
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: params.id },
      include: { reservations: true }
    });

    if (!giftCard) {
      return NextResponse.json({ error: 'Carte cadeau non trouvée' }, { status: 404 });
    }

    if (giftCard.reservations && giftCard.reservations.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une carte avec des réservations' },
        { status: 400 }
      );
    }

    // Supprimer la carte cadeau
    await prisma.giftCard.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Carte cadeau supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte cadeau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
