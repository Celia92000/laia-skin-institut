import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les créneaux bloqués futurs ou d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: today
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    return NextResponse.json(blockedSlots);
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux bloqués:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { date, allDay, time, reason } = await request.json();

    // Créer le créneau bloqué
    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        date: new Date(date),
        allDay: allDay || false,
        time: allDay ? null : time,
        reason: reason || 'Indisponible'
      }
    });

    return NextResponse.json(blockedSlot);
  } catch (error) {
    console.error('Erreur lors de la création du créneau bloqué:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}