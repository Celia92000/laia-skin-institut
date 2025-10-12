import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Récupérer tous les messages WhatsApp avec les infos utilisateur
    const messages = await prisma.whatsAppHistory.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 50
    });

    // Analyser les doublons potentiels
    const analysis = messages.map(msg => ({
      id: msg.id,
      from: msg.from,
      to: msg.to,
      direction: msg.direction,
      userId: msg.userId,
      userName: msg.user?.name,
      userPhone: msg.user?.phone,
      message: msg.message.substring(0, 50) + '...',
      sentAt: msg.sentAt
    }));

    // Grouper par numéro normalisé pour identifier les doublons
    const normalizePhone = (phone: string) => {
      return phone.replace(/^whatsapp:/i, '').replace(/[\s\-\.\(\)]/g, '').trim();
    };

    const grouped: any = {};
    messages.forEach(msg => {
      const clientPhone = msg.direction === 'outgoing' ? msg.to : msg.from;
      const normalized = normalizePhone(clientPhone);

      if (!grouped[normalized]) {
        grouped[normalized] = [];
      }

      grouped[normalized].push({
        id: msg.id,
        from: msg.from,
        to: msg.to,
        direction: msg.direction,
        userId: msg.userId,
        userName: msg.user?.name,
        sentAt: msg.sentAt
      });
    });

    // Identifier les doublons (même numéro mais différentes infos)
    const duplicates = Object.entries(grouped)
      .filter(([_, msgs]: [string, any]) => msgs.length > 1)
      .map(([phone, msgs]: [string, any]) => ({
        normalizedPhone: phone,
        count: msgs.length,
        messages: msgs
      }));

    return NextResponse.json({
      total: messages.length,
      analysis,
      grouped,
      duplicates
    });
  } catch (error) {
    console.error('Erreur debug WhatsApp:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
