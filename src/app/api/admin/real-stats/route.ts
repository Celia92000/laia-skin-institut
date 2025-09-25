import { NextResponse } from 'next/server';
import { getAdminStatistics } from '@/lib/statistics';
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

    // Récupérer les statistiques
    const stats = await getAdminStatistics();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des statistiques',
      // Retourner des valeurs par défaut
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
      todayRevenue: 0
    }, { status: 200 }); // On retourne 200 avec des valeurs par défaut pour éviter les erreurs côté client
  }
}