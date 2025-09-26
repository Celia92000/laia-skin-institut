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

    const body = await request.json();
    const { to, message, mediaUrl } = body;

    if (!to || !message) {
      return NextResponse.json({ 
        error: 'Paramètres manquants',
        message: 'Le destinataire et le message sont requis' 
      }, { status: 400 });
    }

    // Envoyer le message WhatsApp
    const result = await WhatsAppService.sendMessage(to, message, mediaUrl);

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status
    });

  } catch (error: any) {
    console.error('Erreur envoi WhatsApp:', error);
    
    if (error.message?.includes('WhatsApp non configuré')) {
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