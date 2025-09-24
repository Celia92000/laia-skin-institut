import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-skin-secret-key-2024') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    const { amount, method, invoiceNumber, notes, appliedDiscount } = data;

    // Récupérer la réservation actuelle pour obtenir le prix total
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: id }
    });

    if (!currentReservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Si une réduction de fidélité a été appliquée, décrémenter les compteurs
    if (appliedDiscount) {
      const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId: currentReservation.userId }
      });

      if (loyaltyProfile) {
        if (appliedDiscount.type === 'individual' && loyaltyProfile.individualServicesCount >= 5) {
          // Réduction pour 5 soins individuels
          await prisma.loyaltyProfile.update({
            where: { userId: currentReservation.userId },
            data: {
              individualServicesCount: loyaltyProfile.individualServicesCount - 5
            }
          });

          // Enregistrer dans l'historique
          await prisma.loyaltyHistory.create({
            data: {
              userId: currentReservation.userId,
              action: 'DISCOUNT_USED',
              points: -5,
              description: `Réduction de ${appliedDiscount.amount}€ utilisée (5 soins individuels)`,
              reservationId: id
            }
          });
        } else if (appliedDiscount.type === 'package' && loyaltyProfile.packagesCount >= 3) {
          // Réduction pour 3 forfaits
          await prisma.loyaltyProfile.update({
            where: { userId: currentReservation.userId },
            data: {
              packagesCount: loyaltyProfile.packagesCount - 3
            }
          });

          // Enregistrer dans l'historique
          await prisma.loyaltyHistory.create({
            data: {
              userId: currentReservation.userId,
              action: 'DISCOUNT_USED',
              points: -3,
              description: `Réduction de ${appliedDiscount.amount}€ utilisée (3 forfaits)`,
              reservationId: id
            }
          });
        }
      }
    }

    // Mettre à jour la réservation avec les informations de paiement
    const reservation = await prisma.reservation.update({
      where: { id: id },
      data: {
        paymentStatus: amount >= currentReservation.totalPrice ? 'paid' : 'partial',
        paymentDate: new Date(),
        paymentAmount: amount,
        paymentMethod: method,
        invoiceNumber: invoiceNumber || null,
        paymentNotes: notes ? `${notes}${appliedDiscount ? ` | Réduction fidélité: -${appliedDiscount.amount}€` : ''}` : appliedDiscount ? `Réduction fidélité: -${appliedDiscount.amount}€` : null
      }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du paiement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-skin-secret-key-2024') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Réinitialiser les informations de paiement
    const reservation = await prisma.reservation.update({
      where: { id: id },
      data: {
        paymentStatus: 'pending',
        paymentDate: null,
        paymentAmount: null,
        paymentMethod: null,
        invoiceNumber: null,
        paymentNotes: null
      }
    });

    return NextResponse.json({ message: 'Paiement annulé avec succès', reservation });
  } catch (error) {
    console.error('Erreur lors de l\'annulation du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation du paiement' },
      { status: 500 }
    );
  }
}