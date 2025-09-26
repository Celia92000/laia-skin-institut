import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { WhatsAppService } from '@/lib/whatsapp-service';

export async function GET(request: NextRequest) {
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

    // Récupérer le numéro de téléphone depuis les paramètres
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }

    // Récupérer la conversation WhatsApp
    const messages = await WhatsAppService.getConversation(phoneNumber);

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Erreur récupération conversation WhatsApp:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}