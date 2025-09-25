import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// PATCH - Mettre à jour le statut d'une réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { status, paymentStatus, paymentAmount, paymentMethod, paymentDate, paymentNotes } = body;
    const reservationId = id;

    // Récupérer la réservation actuelle
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Si on passe au statut "completed" et que ce n'était pas déjà le cas
    // On incrémente les compteurs de fidélité car le client a bien reçu le soin
    // (qu'il ait payé ou non - cas des modèles, proches, etc.)
    if (status === 'completed' && reservation.status !== 'completed') {
      // Vérifier qu'on n'a pas déjà compté ce soin
      const existingHistory = await prisma.loyaltyHistory.findFirst({
        where: {
          reservationId: reservationId,
          action: { in: ['SERVICE_COMPLETED', 'PACKAGE_COMPLETED'] }
        }
      });

      // Si pas déjà compté, on incrémente
      if (!existingHistory) {
        // Déterminer si c'est un soin individuel ou un forfait
        const services = typeof reservation.services === 'string' 
          ? JSON.parse(reservation.services) 
          : reservation.services;
        
        const packages = typeof reservation.packages === 'string'
          ? JSON.parse(reservation.packages || '{}')
          : reservation.packages || {};
        
        const isPackage = packages && Object.keys(packages).length > 0;

        // Récupérer ou créer le profil de fidélité
        let loyaltyProfile = await prisma.loyaltyProfile.findUnique({
          where: { userId: reservation.userId }
        });

        if (!loyaltyProfile) {
          loyaltyProfile = await prisma.loyaltyProfile.create({
            data: {
              userId: reservation.userId,
              individualServicesCount: 0,
              packagesCount: 0,
              totalSpent: 0,
              availableDiscounts: '[]',
              lastVisit: new Date()
            }
          });
        }

        // Incrémenter le compteur approprié
        if (isPackage) {
          await prisma.loyaltyProfile.update({
            where: { userId: reservation.userId },
            data: {
              packagesCount: loyaltyProfile.packagesCount + 1,
              lastVisit: new Date()
            }
          });

          await prisma.loyaltyHistory.create({
            data: {
              userId: reservation.userId,
              action: 'PACKAGE_COMPLETED',
              points: 1,
              description: `Forfait terminé (${Object.keys(packages).join(', ')})`,
              reservationId: reservationId
            }
          });

          console.log(`🎁 Forfait compté pour fidélité: ${loyaltyProfile.packagesCount + 1}/3`);
        } else {
          await prisma.loyaltyProfile.update({
            where: { userId: reservation.userId },
            data: {
              individualServicesCount: loyaltyProfile.individualServicesCount + 1,
              lastVisit: new Date()
            }
          });

          await prisma.loyaltyHistory.create({
            data: {
              userId: reservation.userId,
              action: 'SERVICE_COMPLETED',
              points: 1,
              description: `Soin individuel terminé (${services.join(', ')})`,
              reservationId: reservationId
            }
          });

          console.log(`✨ Soin compté pour fidélité: ${loyaltyProfile.individualServicesCount + 1}/5`);
        }
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { 
      status,
      updatedAt: new Date()
    };

    // Ajouter les données de paiement si elles sont fournies
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    if (paymentAmount !== undefined) {
      updateData.paymentAmount = paymentAmount;
    }
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    if (paymentDate) {
      updateData.paymentDate = paymentDate;
    }
    if (paymentNotes !== undefined) {
      updateData.paymentNotes = paymentNotes;
    }

    // Mettre à jour le statut de la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    await prisma.reservation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}