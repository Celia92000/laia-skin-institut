import { NextResponse } from 'next/server';
import { getAdminStatistics } from '@/lib/statistics';
import jwt from 'jsonwebtoken';

const defaultStats = {
  totalReservations: 0,
  pendingReservations: 0,
  confirmedReservations: 0,
  completedReservations: 0,
  todayReservations: 0,
  totalRevenue: 0,
  paidRevenue: 0,
  pendingPayments: 0,
  monthlyRevenue: 0,
  monthlyReservations: 0,
  todayRevenue: 0,
  servicesRevenue: 0,
  productRevenue: 0,
  formationRevenue: 0,
  paidServicesRevenue: 0,
  paidProductRevenue: 0,
  paidFormationRevenue: 0,
  totalOrders: 0,
  totalProductOrders: 0,
  totalFormationOrders: 0
};

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ ...defaultStats, error: 'Non autorisé' }, { status: 200 });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      // Vérifier que c'est un admin ou employé
      if (!['admin', 'ADMIN', 'EMPLOYEE', 'COMPTABLE'].includes(decoded.role)) {
        return NextResponse.json({ ...defaultStats, error: 'Accès refusé' }, { status: 200 });
      }
    } catch (error) {
      return NextResponse.json({ ...defaultStats, error: 'Token invalide' }, { status: 200 });
    }

    // Récupérer les statistiques avec timeout
    const statsPromise = getAdminStatistics();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );

    const stats = await Promise.race([statsPromise, timeoutPromise]) as any;

    return NextResponse.json(stats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la récupération des stats:', errorMessage);

    // Toujours retourner 200 avec des valeurs par défaut
    return NextResponse.json({
      ...defaultStats,
      error: 'Erreur lors de la récupération des statistiques'
    }, { status: 200 });
  }
}