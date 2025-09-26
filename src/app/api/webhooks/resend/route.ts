import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import crypto from 'crypto';

// Vérifier la signature du webhook Resend
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  
  try {
    // Récupérer le body brut pour vérifier la signature
    const body = await request.text();
    const signature = request.headers.get('svix-signature') || 
                     request.headers.get('webhook-signature') || '';
    
    // Secret du webhook (à configurer dans Resend)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';
    
    // Vérifier la signature si configurée
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parser le JSON
    const data = JSON.parse(body);
    console.log('Webhook Resend reçu:', data);
    
    // Traiter selon le type d'événement
    switch (data.type) {
      case 'email.sent':
        // Email envoyé avec succès
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { 
              to: data.data.to?.[0] || '',
              createdAt: {
                gte: new Date(Date.now() - 60000) // Dans la dernière minute
              }
            },
            data: {
              status: 'sent',
              resendId: data.data.email_id
            }
          });
        }
        break;
        
      case 'email.delivered':
        // Email délivré
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { resendId: data.data.email_id },
            data: { status: 'delivered' }
          });
        }
        break;
        
      case 'email.opened':
        // Email ouvert
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { resendId: data.data.email_id },
            data: { 
              openedAt: new Date(data.data.opened_at || Date.now())
            }
          });
        }
        break;
        
      case 'email.clicked':
        // Lien cliqué
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { resendId: data.data.email_id },
            data: { 
              clickedAt: new Date(data.data.clicked_at || Date.now())
            }
          });
        }
        break;
        
      case 'email.bounced':
      case 'email.bounce':
        // Email rejeté
        if (data.data.email_id) {
          await prisma.emailHistory.updateMany({
            where: { resendId: data.data.email_id },
            data: { 
              status: 'failed',
              errorMessage: data.data.bounce_type || 'Email bounced'
            }
          });
        }
        break;
        
      case 'email.received':
      case 'inbound':
        // Email reçu (réponse du client)
        console.log('Email entrant reçu:', data.data);
        
        const inboundEmail = data.data;
        if (inboundEmail) {
          // Enregistrer l'email entrant
          await prisma.emailHistory.create({
            data: {
              from: inboundEmail.from || inboundEmail.from_email || '',
              to: inboundEmail.to?.[0] || inboundEmail.to_email || 'contact@laiaskininstitut.fr',
              subject: inboundEmail.subject || 'Sans objet',
              content: inboundEmail.html || inboundEmail.text || inboundEmail.body || '',
              direction: 'incoming',
              status: 'received',
              resendId: inboundEmail.email_id || inboundEmail.id,
              createdAt: inboundEmail.created_at ? new Date(inboundEmail.created_at) : new Date()
            }
          });
          
          console.log('Email entrant enregistré');
        }
        break;
        
      default:
        console.log('Type d\'événement non géré:', data.type);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Erreur webhook Resend:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

// Pour recevoir les emails entrants, il faut aussi supporter GET (pour la vérification)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook Resend configuré'
  });
}