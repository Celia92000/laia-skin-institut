import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// POST - Synchroniser et créer les profils de fidélité manquants
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    // Récupérer tous les clients sans profil de fidélité
    const clientsWithoutProfile = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'client' },
          { role: 'CLIENT' }
        ],
        loyaltyProfile: null
      },
      include: {
        reservations: {
          where: {
            status: {
              not: 'cancelled'
            }
          }
        }
      }
    });

    console.log(`Trouvé ${clientsWithoutProfile.length} clients sans profil de fidélité`);

    // Créer un profil de fidélité pour chaque client
    const createdProfiles = [];
    for (const client of clientsWithoutProfile) {
      try {
        // Calculer les statistiques du client
        const individualServicesCount = client.reservations.filter(r => 
          !r.packages || Object.keys(r.packages).length === 0
        ).length;

        const packagesCount = client.reservations.filter(r => 
          r.packages && Object.keys(r.packages).length > 0
        ).length;

        const totalSpent = client.reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

        const lastReservation = client.reservations
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        // Créer le profil de fidélité
        const profile = await prisma.loyaltyProfile.create({
          data: {
            userId: client.id,
            individualServicesCount,
            packagesCount,
            totalSpent,
            availableDiscounts: JSON.stringify([]),
            lastVisit: lastReservation ? lastReservation.date : null
          }
        });

        createdProfiles.push(profile);
        console.log(`Profil créé pour ${client.name}`);
      } catch (error) {
        console.error(`Erreur lors de la création du profil pour ${client.name}:`, error);
      }
    }

    // Mettre à jour les points de fidélité dans la table User
    const allUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'client' },
          { role: 'CLIENT' }
        ]
      },
      include: {
        reservations: {
          where: {
            status: {
              not: 'cancelled'
            }
          }
        }
      }
    });

    for (const user of allUsers) {
      const points = Math.floor(user.reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0) / 10);
      const totalSpent = user.reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: points,
          totalSpent: totalSpent
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${createdProfiles.length} profils de fidélité créés`,
      totalClients: clientsWithoutProfile.length + createdProfiles.length
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation des profils' },
      { status: 500 }
    );
  }
}

// GET - Obtenir le statut de synchronisation
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const totalClients = await prisma.user.count({
      where: {
        OR: [
          { role: 'client' },
          { role: 'CLIENT' }
        ]
      }
    });

    const profilesCount = await prisma.loyaltyProfile.count();

    return NextResponse.json({
      totalClients,
      profilesCount,
      missingSyncCount: totalClients - profilesCount,
      synced: totalClients === profilesCount
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}