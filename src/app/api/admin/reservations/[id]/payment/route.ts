import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { sendWhatsApp, sendEmail } from '@/lib/notifications';

// Fonction pour générer un numéro de facture
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Compter le nombre de factures ce mois-ci
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0, 23, 59, 59);
  
  const prisma = await getPrismaClient();
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
    
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    const { amount, method, invoiceNumber, notes, appliedDiscount, resetIndividualServicesCount, resetPackagesCount, birthdayDiscountApplied } = data;

    // Récupérer la réservation actuelle pour obtenir le prix total
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: id }
    });

    if (!currentReservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Si une réduction anniversaire a été appliquée, créer la réduction dans la base
    if (birthdayDiscountApplied && currentReservation.userId) {
      // Vérifier qu'une réduction anniversaire n'existe pas déjà cette année
      const currentYear = new Date().getFullYear();
      const existingBirthdayDiscount = await prisma.discount.findFirst({
        where: {
          userId: currentReservation.userId,
          type: 'birthday',
          createdAt: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1)
          }
        }
      });

      if (!existingBirthdayDiscount) {
        // Créer la réduction anniversaire et la marquer comme utilisée
        await prisma.discount.create({
          data: {
            userId: currentReservation.userId,
            type: 'birthday',
            amount: 10,
            status: 'used',
            originalReason: 'Réduction anniversaire offerte',
            notes: `Utilisée sur la réservation ${id}`,
            usedAt: new Date()
          }
        });

        // Créer une notification
        await prisma.notification.create({
          data: {
            userId: currentReservation.userId,
            type: 'discount',
            title: 'Réduction anniversaire',
            message: '🎂 Votre réduction anniversaire de 10€ a été appliquée !',
            read: false
          }
        });

        console.log(`🎂 Réduction anniversaire appliquée pour l'utilisateur ${currentReservation.userId}`);
      }
    }

    // Marquer les réductions de la base de données comme utilisées
    if (appliedDiscount && currentReservation.userId) {
      // Trouver et marquer les réductions disponibles comme utilisées
      const availableDiscounts = await prisma.discount.findMany({
        where: {
          userId: currentReservation.userId,
          status: 'available'
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Marquer les réductions correspondant au montant appliqué
      let remainingDiscount = appliedDiscount.amount;
      for (const discount of availableDiscounts) {
        if (remainingDiscount <= 0) break;

        await prisma.discount.update({
          where: { id: discount.id },
          data: {
            status: 'used',
            usedAt: new Date(),
            usedForReservation: id
          }
        });

        remainingDiscount -= discount.amount;
        console.log(`✅ Réduction ${discount.originalReason} (${discount.amount}€) marquée comme utilisée`);
      }
    }

    // Si une réduction de fidélité a été appliquée, réinitialiser les compteurs
    if (resetIndividualServicesCount || resetPackagesCount) {
      const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId: currentReservation.userId }
      });

      if (loyaltyProfile) {
        const updateData: any = {};
        const historyEntries = [];
        
        // Réinitialiser le compteur de soins individuels si la réduction 6ème soin a été utilisée
        if (resetIndividualServicesCount) {
          updateData.individualServicesCount = 0;
          historyEntries.push({
            userId: currentReservation.userId,
            action: 'DISCOUNT_USED',
            points: -5,
            description: `Réduction fidélité 5 soins utilisée (-20€)`,
            reservationId: id
          });
        }
        
        // Réinitialiser le compteur de forfaits si la réduction 4ème forfait a été utilisée
        if (resetPackagesCount) {
          updateData.packagesCount = 0;
          historyEntries.push({
            userId: currentReservation.userId,
            action: 'DISCOUNT_USED',
            points: -3,
            description: `Réduction fidélité 3 forfaits utilisée (-40€)`,
            reservationId: id
          });
        }
        
        // Mettre à jour le profil de fidélité
        if (Object.keys(updateData).length > 0) {
          await prisma.loyaltyProfile.update({
            where: { userId: currentReservation.userId },
            data: updateData
          });
          
          // Enregistrer dans l'historique
          for (const entry of historyEntries) {
            await prisma.loyaltyHistory.create({ data: entry });
          }
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

        // Vérifier si c'est le premier paiement d'un client parrainé
        if (loyaltyProfile.referredBy && amount > 0) {
          // Vérifier si c'est le premier paiement
          const previousPayments = await prisma.reservation.count({
            where: {
              userId: reservation.user.id,
              paymentStatus: 'paid',
              id: { not: id }
            }
          });

          if (previousPayments === 0) {
            // C'est le premier paiement ! 
            // Trouver le parrain
            const sponsorProfile = await prisma.loyaltyProfile.findFirst({
              where: { referralCode: loyaltyProfile.referredBy },
              include: { user: true }
            });

            if (sponsorProfile) {
              // Activer la réduction du parrain (passer de pending à available)
              const pendingDiscount = await prisma.discount.findFirst({
                where: {
                  userId: sponsorProfile.userId,
                  type: 'referral_sponsor',
                  status: 'pending',
                  originalReason: { contains: reservation.user.name }
                }
              });

              if (pendingDiscount) {
                await prisma.discount.update({
                  where: { id: pendingDiscount.id },
                  data: { 
                    status: 'available',
                    notes: `Activée suite au premier soin de ${reservation.user.name}`
                  }
                });

                // Créer une notification dans la base de données
                await prisma.notification.create({
                  data: {
                    userId: sponsorProfile.userId,
                    type: 'referral',
                    title: 'Parrainage réussi',
                    message: `🎉 Félicitations ! ${reservation.user.name} vient de faire son premier soin. Vous avez gagné 15€ de réduction sur votre prochain soin !`,
                    read: false
                  }
                });

                // Envoyer notification WhatsApp au parrain
                if (sponsorProfile.user.phone) {
                  const message = `🎉 Félicitations ${sponsorProfile.user.name} ! 

${reservation.user.name} vient de faire son premier soin chez LAIA SKIN Institut.

✨ Vous avez gagné 15€ de réduction sur votre prochain soin !

Cette réduction est maintenant disponible dans votre espace client et sera automatiquement appliquée lors de votre prochaine réservation.

Merci pour votre confiance et votre fidélité ! 💝

L'équipe LAIA SKIN Institut`;

                  try {
                    await sendWhatsApp(sponsorProfile.user.phone, message);
                    console.log(`📱 WhatsApp envoyé au parrain ${sponsorProfile.user.name}`);
                  } catch (error) {
                    console.error('Erreur envoi WhatsApp au parrain:', error);
                    // Envoyer par email en cas d'échec WhatsApp
                    if (sponsorProfile.user.email) {
                      await sendEmail(
                        sponsorProfile.user.email,
                        'Félicitations pour votre parrainage ! 🎉',
                        message
                      );
                    }
                  }
                }

                console.log(`🎁 Réduction parrain activée pour ${sponsorProfile.user.name}`);
              }
            }
          }
        }
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
    
    const prisma = await getPrismaClient();
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