import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-skin-secret-key-2024') as any;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
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

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a le droit de voir cette réservation
    if (reservation.userId !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la réservation' },
      { status: 500 }
    );
  }
}

// PUT - Modifier une réservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-skin-secret-key-2024') as any;

    // Récupérer la réservation existante
    const existingReservation = await prisma.reservation.findUnique({
      where: { id }
    });

    if (!existingReservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a le droit de modifier
    if (existingReservation.userId !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les nouvelles données
    const { services, date, time, totalPrice } = await request.json();

    // Vérifier la disponibilité du nouveau créneau (sauf si c'est le même)
    if (date !== existingReservation.date.toISOString().split('T')[0] || time !== existingReservation.time) {
      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          date: new Date(date),
          time: time,
          status: { in: ['CONFIRMED', 'PENDING'] },
          id: { not: id }
        }
      });

      if (conflictingReservation) {
        return NextResponse.json(
          { error: 'Ce créneau est déjà réservé' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        services: JSON.stringify(services),
        date: new Date(date),
        time,
        totalPrice
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

    return NextResponse.json({
      success: true,
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Erreur modification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    );
  }
}

// DELETE - Annuler une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-skin-secret-key-2024') as any;

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // Vérifier les droits
    if (reservation.userId !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Mettre à jour le statut à CANCELLED
    const cancelledReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Réservation annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur annulation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}