import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withRetry } from '@/lib/prisma-with-retry';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const adminUser = await withRetry(() =>
        prisma.user.findUnique({
          where: { id: decoded.userId }
        })
      );

      if (!adminUser || adminUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }
    } catch (e) {
      console.error('Erreur vérification admin:', e);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { note } = await request.json();
    const params = await context.params;
    const userId = params.id;

    // Mettre à jour ou créer le profil de fidélité avec la note
    const loyaltyProfile = await withRetry(() => 
      prisma.loyaltyProfile.update({
        where: { userId },
        data: { 
          notes: note,
          updatedAt: new Date()
        }
      })
    );

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
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const adminUser = await withRetry(() =>
        prisma.user.findUnique({
          where: { id: decoded.userId }
        })
      );

      if (!adminUser || adminUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }
    } catch (e) {
      console.error('Erreur vérification admin:', e);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const params = await context.params;
    const userId = params.id;

    const loyaltyProfile = await withRetry(() =>
      prisma.loyaltyProfile.findUnique({
        where: { userId },
        select: { notes: true }
      })
    );

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