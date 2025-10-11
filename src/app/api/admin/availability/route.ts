import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer les dates bloquées et horaires de travail
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    // Récupérer les dates bloquées
    const blockedSlots = await prisma.blockedSlot.findMany({
      orderBy: { date: 'asc' }
    });

    // Récupérer les horaires de travail
    const workingHours = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json({
      blockedSlots,
      workingHours
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter une date bloquée
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin' && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { date, time, allDay, reason } = body;

    // Convertir la date string en DateTime
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0); // Normaliser à minuit

    // Vérifier si la date est déjà bloquée
    const existing = await prisma.blockedSlot.findFirst({
      where: {
        date: dateObj,
        OR: [
          { allDay: true },
          { time: time || null }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Cette date/créneau est déjà bloqué' }, { status: 400 });
    }

    // Créer le blocage
    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        date: dateObj,
        time: allDay ? null : time,
        allDay: allDay || false,
        reason: reason || 'Indisponible'
      }
    });

    return NextResponse.json(blockedSlot);
  } catch (error) {
    console.error('Erreur lors du blocage du créneau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une date bloquée
export async function DELETE(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin' && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.blockedSlot.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Créneau débloqué avec succès' });
  } catch (error) {
    console.error('Erreur lors du déblocage du créneau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour les horaires de travail
export async function PUT(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin' && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { workingHours } = body;

    // Mettre à jour chaque jour
    for (const hours of workingHours) {
      await prisma.workingHours.upsert({
        where: { dayOfWeek: hours.dayOfWeek },
        update: {
          startTime: hours.startTime,
          endTime: hours.endTime,
          isOpen: hours.isOpen
        },
        create: {
          dayOfWeek: hours.dayOfWeek,
          startTime: hours.startTime,
          endTime: hours.endTime,
          isOpen: hours.isOpen
        }
      });
    }

    return NextResponse.json({ message: 'Horaires mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}