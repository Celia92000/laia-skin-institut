import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cache } from '@/lib/cache';

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

    // Vérifier le cache
    const cacheKey = 'admin:clients';
    const cachedClients = cache.get(cacheKey);
    if (cachedClients) {
      return NextResponse.json(cachedClients);
    }

    // Récupérer tous les clients avec leurs stats
    const clients = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'CLIENT' },
          { role: 'client' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        loyaltyPoints: true,
        totalSpent: true,
        createdAt: true,
        skinType: true,
        allergies: true,
        preferences: true,
        medicalNotes: true,
        loyaltyProfile: {
          select: {
            individualServicesCount: true,
            packagesCount: true,
            totalSpent: true,
            lastVisit: true
          }
        },
        _count: {
          select: {
            reservations: true
          }
        },
        reservations: {
          select: {
            date: true,
            status: true,
            services: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données
    const formattedClients = clients.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      loyaltyPoints: c.loyaltyPoints,
      totalSpent: c.totalSpent,
      reservations: c.reservations.map(r => ({
        date: r.date?.toISOString(),
        status: r.status,
        services: r.services
      })),
      reservationsCount: c._count.reservations,
      lastVisit: c.reservations[0]?.date?.toISOString(),
      createdAt: c.createdAt.toISOString(),
      skinType: c.skinType,
      allergies: c.allergies,
      preferences: c.preferences,
      medicalNotes: c.medicalNotes,
      loyaltyProfile: c.loyaltyProfile ? {
        individualServicesCount: c.loyaltyProfile.individualServicesCount,
        packagesCount: c.loyaltyProfile.packagesCount,
        totalSpent: c.loyaltyProfile.totalSpent,
        lastVisit: c.loyaltyProfile.lastVisit,
        points: c.loyaltyPoints || 0,
        tier: c.loyaltyProfile.totalSpent >= 1000 ? 'PLATINUM' :
              c.loyaltyProfile.totalSpent >= 500 ? 'GOLD' :
              c.loyaltyProfile.totalSpent >= 200 ? 'SILVER' : 'BRONZE'
      } : null
    }));

    // Mettre en cache pour 60 secondes
    cache.set(cacheKey, formattedClients, 60000);

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, clientId, loyaltyPoints, skinType, allergies, preferences, medicalNotes, adminNotes, ...otherData } = await request.json();

    // Utiliser id ou clientId selon ce qui est fourni
    const idToUse = id || clientId;
    
    if (!idToUse) {
      return NextResponse.json({ error: 'ID du client manquant' }, { status: 400 });
    }

    // Mettre à jour le client
    const updatedClient = await prisma.user.update({
      where: { id: idToUse },
      data: {
        loyaltyPoints,
        skinType,
        allergies,
        preferences,
        medicalNotes,
        adminNotes
      }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}