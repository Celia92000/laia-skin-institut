import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Fonction pour générer un numéro de facture
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Compter le nombre de factures ce mois-ci
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0, 23, 59, 59);
  
  const invoicesThisMonth = await prisma.reservation.count({
    where: {
      paymentDate: {
        gte: startOfMonth,
        lte: endOfMonth
      },
      invoiceNumber: {
        not: null
      }
    }
  });
  
  const nextNumber = String(invoicesThisMonth + 1).padStart(4, '0');
  return `FAC-${year}${month}-${nextNumber}`;
}

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

    // Générer automatiquement un numéro de facture si non fourni
    const finalInvoiceNumber = invoiceNumber || await generateInvoiceNumber();
    
    // Mettre à jour la réservation avec les informations de paiement
    const reservation = await prisma.reservation.update({
      where: { id: id },
      data: {
        paymentStatus: amount >= currentReservation.totalPrice ? 'paid' : 'partial',
        paymentDate: new Date(),
        paymentAmount: amount,
        paymentMethod: method,
        invoiceNumber: finalInvoiceNumber,
        paymentNotes: notes ? `${notes}${appliedDiscount ? ` | Réduction fidélité: -${appliedDiscount.amount}€` : ''}` : appliedDiscount ? `Réduction fidélité: -${appliedDiscount.amount}€` : null
      },
      include: {
        user: true
      }
    });

    // Si le paiement est effectué, mettre à jour UNIQUEMENT le montant total dépensé
    // Les compteurs de soins/forfaits sont incrémentés lors du passage en "completed"
    if (amount > 0 && reservation.user) {
      // Récupérer le profil de fidélité
      const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId: reservation.user.id }
      });

      if (loyaltyProfile) {
        // Mettre à jour uniquement le montant total dépensé
        await prisma.loyaltyProfile.update({
          where: { userId: reservation.user.id },
          data: {
            totalSpent: loyaltyProfile.totalSpent + amount
          }
        });

        // Enregistrer le paiement dans l'historique
        await prisma.loyaltyHistory.create({
          data: {
            userId: reservation.user.id,
            action: 'PAYMENT_RECORDED',
            points: 0,
            description: `Paiement enregistré: ${amount}€ (${method})`,
            reservationId: id
          }
        });

        // Mettre à jour les points de fidélité dans la table User
        const newPoints = Math.floor((loyaltyProfile.totalSpent + amount) / 10);
        await prisma.user.update({
          where: { id: reservation.user.id },
          data: {
            loyaltyPoints: newPoints,
            totalSpent: loyaltyProfile.totalSpent + amount
          }
        });

        console.log(`💰 Paiement enregistré pour ${reservation.user.name}: ${amount}€`);
      }
    }

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

    // Récupérer la réservation avant de réinitialiser pour vérifier si elle était payée
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: id },
      include: {
        user: true
      }
    });

    if (!currentReservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Si la réservation était payée, ajuster UNIQUEMENT le montant total dépensé
    // Les compteurs de soins/forfaits ne sont PAS modifiés (le soin a eu lieu)
    if (currentReservation.paymentStatus === 'paid' && currentReservation.user) {
      const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId: currentReservation.user.id }
      });

      if (loyaltyProfile && currentReservation.paymentAmount) {
        // Ajuster uniquement le montant total dépensé
        await prisma.loyaltyProfile.update({
          where: { userId: currentReservation.user.id },
          data: {
            totalSpent: Math.max(0, loyaltyProfile.totalSpent - currentReservation.paymentAmount)
          }
        });

        // Enregistrer dans l'historique
        await prisma.loyaltyHistory.create({
          data: {
            userId: currentReservation.user.id,
            action: 'PAYMENT_CANCELLED',
            points: 0,
            description: `Paiement annulé: -${currentReservation.paymentAmount}€`,
            reservationId: id
          }
        });

        // Mettre à jour les points dans la table User
        const newPoints = Math.floor(Math.max(0, loyaltyProfile.totalSpent - currentReservation.paymentAmount) / 10);
        await prisma.user.update({
          where: { id: currentReservation.user.id },
          data: {
            loyaltyPoints: newPoints,
            totalSpent: Math.max(0, loyaltyProfile.totalSpent - currentReservation.paymentAmount)
          }
        });

        console.log(`💰 Paiement annulé pour ${currentReservation.user.name}: -${currentReservation.paymentAmount}€`);
      }
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