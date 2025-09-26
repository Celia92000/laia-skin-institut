import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
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

    // Récupérer tous les services
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
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

    const body = await request.json();
    
    // Supprimer l'id s'il existe (pour la création)
    delete body.id;

    // Créer le service
    const service = await prisma.service.create({
      data: body
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}