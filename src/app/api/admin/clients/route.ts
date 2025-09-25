import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
            status: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 1
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
      reservations: c._count.reservations,
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
        lastVisit: c.loyaltyProfile.lastVisit
      } : null
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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