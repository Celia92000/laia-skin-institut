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

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// GET - Récupérer tous les profils de fidélité
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
    // Récupérer tous les profils de fidélité avec les utilisateurs
    const loyaltyProfiles = await prisma.loyaltyProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            birthDate: true,
            reservations: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      }
    });

    // Récupérer aussi les utilisateurs sans profil de fidélité
    const usersWithoutProfile = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'client' },
          { role: 'CLIENT' }
        ],
        loyaltyProfile: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        reservations: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Créer des profils par défaut pour les utilisateurs sans profil
    const defaultProfiles = usersWithoutProfile.map(user => ({
      id: `temp-${user.id}`,
      userId: user.id,
      individualServicesCount: 0,
      packagesCount: 0,
      totalSpent: 0,
      availableDiscounts: [],
      lastVisit: null,
      user: user
    }));

    // Combiner les vrais profils et les profils par défaut
    const allProfiles = [...loyaltyProfiles, ...defaultProfiles];

    // Traiter les réductions disponibles (parse JSON)
    const processedProfiles = allProfiles.map(profile => ({
      ...profile,
      availableDiscounts: typeof profile.availableDiscounts === 'string' 
        ? JSON.parse(profile.availableDiscounts) 
        : profile.availableDiscounts
    }));

    return NextResponse.json(processedProfiles);
  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Appliquer une réduction manuelle
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
    const body = await request.json();
    const { userId, discountAmount, reason } = body;

    // Récupérer ou créer le profil de fidélité
    let loyaltyProfile = await prisma.loyaltyProfile.findUnique({
      where: { userId }
    });

    if (!loyaltyProfile) {
      loyaltyProfile = await prisma.loyaltyProfile.create({
        data: {
          userId,
          individualServicesCount: 0,
          packagesCount: 0,
          totalSpent: 0,
          availableDiscounts: '[]'
        }
      });
    }

    // Créer une entrée dans l'historique
    await prisma.loyaltyHistory.create({
      data: {
        userId,
        action: 'DISCOUNT_APPLIED',
        points: 0,
        description: `Réduction manuelle de ${discountAmount}€ : ${reason}`
      }
    });

    // Si c'est une réduction de fidélité, décrémenter les compteurs
    if (reason.includes('5 soins')) {
      await prisma.loyaltyProfile.update({
        where: { userId },
        data: {
          individualServicesCount: Math.max(0, loyaltyProfile.individualServicesCount - 5)
        }
      });
    } else if (reason.includes('3 forfaits')) {
      await prisma.loyaltyProfile.update({
        where: { userId },
        data: {
          packagesCount: Math.max(0, loyaltyProfile.packagesCount - 3)
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'application de la réduction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'application' },
      { status: 500 }
    );
  }
}