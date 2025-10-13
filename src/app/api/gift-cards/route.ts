import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// Fonction pour générer un code unique
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GIFT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Achat d'une carte cadeau par un client
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const body = await request.json();
    const {
      amount,
      recipientName,
      recipientEmail,
      message,
      senderName,
      senderEmail,
      senderPhone,
      paymentMethod,
      bookNow,       // true si le client veut réserver maintenant
      reservationData // données de réservation si bookNow = true
    } = body;

    // Validation
    if (!amount || amount < 20) {
      return NextResponse.json(
        { error: 'Le montant minimum est de 20€' },
        { status: 400 }
      );
    }

    if (!recipientName || !recipientEmail || !senderName || !senderEmail || !senderPhone) {
      return NextResponse.json(
        { error: 'Informations manquantes' },
        { status: 400 }
      );
    }

    // Générer un code unique
    let code = generateGiftCardCode();
    let codeExists = await prisma.giftCard.findUnique({ where: { code } });

    while (codeExists) {
      code = generateGiftCardCode();
      codeExists = await prisma.giftCard.findUnique({ where: { code } });
    }

    // Créer ou trouver l'utilisateur acheteur
    let purchaser = await prisma.user.findUnique({
      where: { email: senderEmail }
    });

    // Date d'expiration (1 an)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Créer la carte cadeau avec statut en attente de paiement
    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount,
        initialAmount: amount,
        balance: amount,
        purchasedBy: purchaser?.id,
        purchasedFor: recipientName,
        recipientEmail,
        recipientPhone: senderPhone,
        message,
        status: 'active',
        paymentStatus: 'pending', // En attente de paiement sur place
        expiryDate,
        notes: `Achetée par ${senderName} (${senderEmail}) pour ${recipientName}`
      }
    });

    // Si le client veut réserver maintenant, créer une réservation
    let reservation = null;
    if (bookNow && reservationData) {
      // Créer ou trouver l'utilisateur bénéficiaire
      let recipient = await prisma.user.findUnique({
        where: { email: recipientEmail }
      });

      if (!recipient) {
        // Créer un compte pour le bénéficiaire
        const bcrypt = await import('bcryptjs');
        const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);

        recipient = await prisma.user.create({
          data: {
            email: recipientEmail,
            name: recipientName,
            password: tempPassword,
            role: 'client'
          }
        });
      }

      // Créer la réservation avec la carte cadeau
      const amountUsed = Math.min(giftCard.balance, reservationData.totalPrice);

      reservation = await prisma.reservation.create({
        data: {
          userId: recipient.id,
          date: new Date(reservationData.date),
          time: reservationData.time,
          services: JSON.stringify(reservationData.services),
          totalPrice: reservationData.totalPrice,
          status: 'confirmed',
          source: 'site',
          paymentStatus: amountUsed >= reservationData.totalPrice ? 'paid' : 'partial',
          paymentMethod: 'giftcard',
          giftCardId: giftCard.id,
          giftCardUsedAmount: amountUsed
        }
      });

      // Mettre à jour le solde de la carte
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          balance: giftCard.balance - amountUsed,
          status: giftCard.balance - amountUsed <= 0 ? 'used' : 'active'
        }
      });
    }

    // Envoyer email de confirmation d'achat avec instructions de paiement
    try {
      await fetch(`${request.nextUrl.origin}/api/gift-cards/send-purchase-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftCardId: giftCard.id,
          senderEmail,
          senderName
        })
      });
    } catch (emailError) {
      console.error('Erreur envoi email confirmation achat:', emailError);
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      giftCard: {
        code: giftCard.code,
        amount: giftCard.amount,
        balance: giftCard.balance,
        expiryDate: giftCard.expiryDate
      },
      reservation: reservation ? {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time
      } : null
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'achat de la carte cadeau:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Vérifier une carte cadeau par code
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code manquant' },
        { status: 400 }
      );
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            giftCardUsedAmount: true
          }
        }
      }
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Carte cadeau introuvable' },
        { status: 404 }
      );
    }

    // Vérifier le statut (sauf si expirée, on laisse passer pour exception admin)
    if (giftCard.status !== 'active') {
      return NextResponse.json({
        valid: false,
        error: `Carte cadeau ${giftCard.status}`,
        status: giftCard.status
      });
    }

    // Vérifier si la carte est expirée (mais permettre quand même l'utilisation avec avertissement)
    const isExpired = giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date();

    return NextResponse.json({
      valid: true,
      expired: isExpired,
      warning: isExpired ? 'Carte cadeau expirée - Utilisation possible en exception' : null,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        balance: giftCard.balance,
        initialAmount: giftCard.initialAmount,
        expiryDate: giftCard.expiryDate
      },
      balance: giftCard.balance,
      initialAmount: giftCard.initialAmount,
      reservations: giftCard.reservations
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de la carte cadeau:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
