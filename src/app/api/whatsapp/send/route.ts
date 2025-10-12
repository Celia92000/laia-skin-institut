import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { WhatsAppService } from '@/lib/whatsapp-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, clientId, clientName } = body;

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

    // Vérifier que le message et le destinataire sont fournis
    if (!to || !message) {
      return NextResponse.json({ error: 'Destinataire et message requis' }, { status: 400 });
    }

    // Formater le numéro de téléphone (ajouter +33 si nécessaire)
    let formattedPhone = to.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '33' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('33')) {
      formattedPhone = '33' + formattedPhone;
    }
    formattedPhone = '+' + formattedPhone;

    // Envoyer via le WhatsAppService (Meta ou Twilio selon WHATSAPP_PROVIDER)
    const result = await WhatsAppService.sendMessage(formattedPhone, message);

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      messageId: result?.messages?.[0]?.id || result?.sid || `msg_${Date.now()}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur envoi WhatsApp:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}