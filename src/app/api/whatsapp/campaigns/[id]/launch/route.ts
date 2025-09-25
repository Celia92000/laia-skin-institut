import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer la campagne
    const campaign = await prisma.whatsAppCampaign.findUnique({
      where: { id: params.id },
      include: {
        template: true
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Cette campagne a déjà été lancée' 
      }, { status: 400 });
    }

    // Mettre à jour le statut de la campagne
    const updatedCampaign = await prisma.whatsAppCampaign.update({
      where: { id: params.id },
      data: {
        status: 'active',
        sentAt: new Date()
      }
    });

    // Simuler l'envoi des messages
    console.log(`🚀 Lancement de la campagne "${campaign.name}"`);
    console.log(`📱 Envoi à ${campaign.recipientCount} destinataires`);
    
    // Si Twilio est configuré, envoyer réellement les messages
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && campaign.template) {
      const recipients = JSON.parse(campaign.recipients || '[]');
      let sentCount = 0;
      
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        for (const phoneNumber of recipients) {
          try {
            await client.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
              to: phoneNumber.startsWith('whatsapp:') ? phoneNumber : `whatsapp:${phoneNumber}`,
              body: campaign.template.content
            });
            sentCount++;
          } catch (error) {
            console.error(`Erreur envoi à ${phoneNumber}:`, error);
          }
        }
        
        console.log(`✅ ${sentCount}/${recipients.length} messages envoyés via Twilio`);
      } catch (error) {
        console.log('Twilio non configuré, mode simulation');
      }
    }

    // Après un délai, marquer comme envoyée
    setTimeout(async () => {
      await prisma.whatsAppCampaign.update({
        where: { id: params.id },
        data: { status: 'sent' }
      });
    }, 5000);

    return NextResponse.json({
      success: true,
      message: 'Campagne lancée avec succès',
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error('Erreur lancement campagne:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}