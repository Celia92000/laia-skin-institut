import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN' && admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { days = 7 } = body; // Par défaut, synchroniser les 7 derniers jours

    // Synchroniser les messages WhatsApp
    await WhatsAppService.syncMessages(days);

    // Compter les messages synchronisés (avec gestion d'erreur si table n'existe pas)
    let messageCount = 0;
    try {
      messageCount = await prisma.whatsAppHistory.count({
        where: {
          platform: 'whatsapp',
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      });
    } catch (e) {
      console.log('Table whatsAppHistory non disponible');
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation WhatsApp terminée`,
      messageCount,
      syncedDays: days
    });

  } catch (error: any) {
    console.error('Erreur synchronisation WhatsApp:', error);
    
    if (error.message?.includes('non configuré')) {
      return NextResponse.json({ 
        error: 'Configuration manquante',
        message: 'WhatsApp n\'est pas configuré. Ajoutez TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN dans les variables d\'environnement.'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
}

// GET pour vérifier le statut
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Statistiques des messages WhatsApp (avec gestion d'erreur si table n'existe pas)
    let stats: any[] = [];
    let total = 0;
    let lastSync: Date | null = null;

    try {
      stats = await prisma.whatsAppHistory.findMany({
        select: {
          direction: true,
          status: true
        }
      });

      total = await prisma.whatsAppHistory.count();

      const lastSyncRecord = await prisma.whatsAppHistory.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });
      lastSync = lastSyncRecord?.createdAt || null;
    } catch (e) {
      console.log('Table whatsAppHistory non disponible');
    }

    const configured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    return NextResponse.json({
      configured,
      stats,
      total,
      lastSync
    });

  } catch (error) {
    console.error('Erreur status WhatsApp:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}