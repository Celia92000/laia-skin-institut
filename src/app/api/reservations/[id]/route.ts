import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { formatDateLocal } from "@/lib/date-utils";

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
    // Les admins peuvent modifier toutes les réservations
    const isAdmin = decoded.role === 'admin' || decoded.role === 'ADMIN';
    const isOwner = existingReservation.userId === decoded.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les nouvelles données
    const body = await request.json();
    const { services, date, time, totalPrice, status, paymentStatus, notes } = body;

    // Vérifier la disponibilité du nouveau créneau (sauf si c'est le même)
    if (date && time && (date !== formatDateLocal(existingReservation.date) || time !== existingReservation.time)) {
      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          date: new Date(date),
          time: time,
          status: { in: ['confirmed', 'pending'] },
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

    // Préparer les données à mettre à jour (seulement les champs fournis)
    const updateData: any = {};

    if (services) updateData.services = JSON.stringify(services);
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
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