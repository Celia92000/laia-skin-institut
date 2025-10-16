import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Obtenir une connexion Prisma garantie
    const prisma = await getPrismaClient();
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        return NextResponse.json({ error: 'Token invalide - userId manquant' }, { status: 401 });
      }
      
      try {
        const adminUser = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Non autorisé - accès admin requis' }, { status: 403 });
        }
      } catch (dbError) {
        console.error('Erreur connexion DB:', dbError);
        return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 503 });
      }
    } catch (tokenError: any) {
      console.error('Erreur décodage token:', tokenError);
      if (tokenError.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      } else if (tokenError.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    const { note } = await request.json();
    const params = await context.params;
    const userId = id;

    // Mettre à jour ou créer le profil de fidélité avec la note
    const loyaltyProfile = await prisma.loyaltyProfile.upsert({
        where: { userId },
        create: {
          userId,
          points: 0,
          individualServicesCount: 0,
          packagesCount: 0,
          totalSpent: 0,
          tier: 'bronze',
          notes: note,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        update: { 
          notes: note,
          updatedAt: new Date()
        }
      });

    return NextResponse.json({ 
      success: true,
      profile: loyaltyProfile
    });

  } catch (error) {
    console.error('Erreur sauvegarde note:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la sauvegarde de la note' 
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Obtenir une connexion Prisma garantie
    const prisma = await getPrismaClient();
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        return NextResponse.json({ error: 'Token invalide - userId manquant' }, { status: 401 });
      }
      
      try {
        const adminUser = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Non autorisé - accès admin requis' }, { status: 403 });
        }
      } catch (dbError) {
        console.error('Erreur connexion DB:', dbError);
        return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 503 });
      }
    } catch (tokenError: any) {
      console.error('Erreur décodage token:', tokenError);
      if (tokenError.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      } else if (tokenError.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    const params = await context.params;
    const userId = id;

    const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId },
        select: { notes: true }
      });

    return NextResponse.json({ 
      note: loyaltyProfile?.notes || ''
    });

  } catch (error) {
    console.error('Erreur récupération note:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération de la note' 
    }, { status: 500 });
  }
}