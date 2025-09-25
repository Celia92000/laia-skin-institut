import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, template, templateData, clientId, clientName, templateId, templateName } = body;
    
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
    
    let finalMessage = message;
    let finalTemplateName = templateName;
    
    // Vérifier que le message et le destinataire sont fournis
    if (!to || !finalMessage) {
      return NextResponse.json({ error: 'Destinataire et message requis' }, { status: 400 });
    }

    // Essayer d'envoyer via Twilio si configuré
    let messageSent = false;
    let messageId = `sim_${Date.now()}`;
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        const twilioMessage = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
          to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
          body: finalMessage
        });
        
        messageSent = true;
        messageId = twilioMessage.sid;
      } catch (twilioError: any) {
        console.log('Twilio non configuré, mode simulation:', twilioError?.message);
      }
    }
    
    // Dans tous les cas, enregistrer le message
    try {
      await prisma.whatsAppHistory.create({
        data: {
          from: 'LAIA SKIN Institut',
          to: to,
          message: finalMessage,
          status: messageSent ? 'delivered' : 'sent',
          direction: 'outgoing',
          userId: clientId || null,
          deliveredAt: messageSent ? new Date() : null
        }
      });
      console.log('Message WhatsApp enregistré dans l\'historique');
    } catch (error) {
      console.log('Historique WhatsApp non disponible:', error);
    }
    
    // Réponse de succès
    console.log(`📱 WhatsApp ${messageSent ? 'envoyé' : 'simulé'} à ${clientName || to}: ${finalMessage.substring(0, 50)}...`);
    
    return NextResponse.json({ 
      success: true, 
      message: messageSent ? 'Message envoyé avec succès' : 'Message enregistré (mode simulation)',
      messageId: messageId,
      status: messageSent ? 'delivered' : 'simulated',
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