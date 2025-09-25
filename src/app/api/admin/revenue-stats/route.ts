import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Vérifier que c'est un admin ou employé
      if (!['admin', 'ADMIN', 'EMPLOYEE', 'COMPTABLE'].includes(decoded.role)) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les paramètres
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    const customStart = url.searchParams.get('start');
    const customEnd = url.searchParams.get('end');

    // Calculer les dates
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'day':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay() + 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    }

    // Récupérer les réservations passées (réalisées)
    const pastReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: now
        },
        status: {
          in: ['completed', 'confirmed']
        }
      }
    });

    // Récupérer les réservations futures (prévues)
    const futureReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gt: now,
          lte: endDate
        },
        status: {
          in: ['confirmed', 'pending']
        }
      }
    });

    // Calculer le CA réalisé (passé et payé)
    const realizedRevenue = pastReservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    const realizedCount = pastReservations
      .filter(r => r.paymentStatus === 'paid')
      .length;

    // Calculer le CA prévu (futur confirmé)
    const plannedRevenue = futureReservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    const plannedCount = futureReservations
      .filter(r => r.status === 'confirmed')
      .length;

    // CA en attente de paiement (passé non payé)
    const pendingPayment = pastReservations
      .filter(r => r.paymentStatus !== 'paid')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    // Calculer le total et les moyennes
    const totalRevenue = realizedRevenue + plannedRevenue;
    const totalReservations = realizedCount + plannedCount;
    const averageTicket = totalReservations > 0 ? totalRevenue / totalReservations : 0;

    // Calculer la croissance par rapport à la période précédente
    let previousStart = new Date(startDate);
    let previousEnd = new Date(endDate);
    const periodDuration = endDate.getTime() - startDate.getTime();
    previousStart.setTime(previousStart.getTime() - periodDuration);
    previousEnd.setTime(previousEnd.getTime() - periodDuration);

    const previousReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: previousStart,
          lte: previousEnd
        },
        status: {
          not: 'cancelled'
        },
        paymentStatus: 'paid'
      }
    });

    const previousRevenue = previousReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const growth = previousRevenue > 0 
      ? ((realizedRevenue - previousRevenue) / previousRevenue * 100)
      : realizedRevenue > 0 ? 100 : 0;

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: period
      },
      realized: {
        revenue: realizedRevenue,
        count: realizedCount,
        pending: pendingPayment
      },
      planned: {
        revenue: plannedRevenue,
        count: plannedCount
      },
      total: {
        revenue: totalRevenue,
        reservations: totalReservations,
        averageTicket: averageTicket
      },
      growth: growth,
      comparison: {
        previousRevenue: previousRevenue,
        difference: realizedRevenue - previousRevenue
      }
    });

  } catch (error) {
    console.error('Erreur dans /api/admin/revenue-stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}