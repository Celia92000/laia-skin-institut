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

    // Récupérer l'historique des emails
    const emailHistory = await prisma.emailHistory.findMany({
      include: {
        campaign: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limiter aux 100 derniers emails
    });

    return NextResponse.json(emailHistory);
  } catch (error) {
    console.error('Erreur récupération historique emails:', error);
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

    const data = await request.json();

    // Créer l'entrée dans l'historique
    const emailEntry = await prisma.emailHistory.create({
      data: {
        from: data.from || 'contact@laia.skininstitut.fr',
        to: data.to,
        subject: data.subject,
        content: data.content,
        template: data.template,
        status: data.status || 'sent',
        direction: data.direction || 'outgoing',
        campaignId: data.campaignId,
        userId: data.userId,
        errorMessage: data.errorMessage
      }
    });

    return NextResponse.json(emailEntry);
  } catch (error) {
    console.error('Erreur création historique email:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}