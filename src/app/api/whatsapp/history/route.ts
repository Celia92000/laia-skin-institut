import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer userId depuis les paramètres de l'URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Construire la requête
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    // Charger les messages WhatsApp de la base de données
    const messages = await prisma.whatsAppHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les infos des users si userId existe
    const userIds = messages.map(m => m.userId).filter(Boolean) as string[];
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, phone: true }
    }) : [];

    const usersMap = new Map(users.map(u => [u.id, u]));

    // Formater les messages avec les infos complètes du client
    const formattedMessages = messages.map(msg => {
      // Le numéro du client dépend de la direction du message
      const clientPhone = msg.direction === 'outgoing' ? msg.to : msg.from;
      const user = msg.userId ? usersMap.get(msg.userId) : null;

      return {
        id: msg.id,
        from: msg.from,
        to: msg.to,
        message: msg.message,
        status: msg.status,
        direction: msg.direction,
        sentAt: msg.createdAt.toISOString(),
        deliveredAt: msg.deliveredAt?.toISOString(),
        readAt: msg.readAt?.toISOString(),
        userId: msg.userId,
        clientName: user?.name || clientPhone,
        clientEmail: user?.email || '',
        clientPhone: clientPhone
      };
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Erreur récupération historique WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
