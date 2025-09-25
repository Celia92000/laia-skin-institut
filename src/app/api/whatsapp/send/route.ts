import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { to, message, template, templateData, clientId, clientName, templateId, templateName } = await request.json();
    
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier le token JWT
    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decodedToken.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    
    let finalMessage = message;
    let finalTemplateName = templateName;
    
    // Si un template est spécifié, l'utiliser
    if (template && templateData) {
      const { whatsappTemplates } = await import('@/lib/whatsapp');
      
      switch(template) {
        case 'confirmation':
          finalMessage = whatsappTemplates.reservationConfirmation(templateData);
          finalTemplateName = 'Confirmation de réservation';
          break;
        case 'reminder':
          finalMessage = whatsappTemplates.appointmentReminder(templateData);
          finalTemplateName = 'Rappel de rendez-vous';
          break;
        case 'birthday':
          finalMessage = whatsappTemplates.birthdayMessage(templateData);
          finalTemplateName = 'Message d\'anniversaire';
          break;
        case 'followup':
          finalMessage = whatsappTemplates.afterCareFollowUp(templateData);
          finalTemplateName = 'Suivi après soin';
          break;
        case 'loyalty':
          finalMessage = whatsappTemplates.loyaltyUpdate(templateData);
          finalTemplateName = 'Programme fidélité';
          break;
        default:
          finalMessage = message;
      }
    }
    
    // Envoyer le message
    const result = await sendWhatsAppMessage({
      to,
      message: finalMessage
    });
    
    if (result) {
      // Enregistrer dans l'historique des communications si clientId est fourni
      if (clientId) {
        try {
          // Tentative d'enregistrement dans la base de données
          await prisma.whatsAppHistory?.create({
            data: {
              userId: clientId,
              from: 'system',
              to: clientId,
              message: finalMessage,
              status: 'sent',
              createdAt: new Date()
            }
          });
          console.log('Message WhatsApp enregistré dans l\'historique');
        } catch (error) {
          console.log('Impossible d\'enregistrer dans whatsAppHistory (table non disponible):', error);
          
          // Alternative : enregistrer dans une table générique de communications
          try {
            await prisma.communicationHistory?.create({
              data: {
                userId: clientId,
                type: 'whatsapp',
                content: finalMessage,
                status: 'sent',
                direction: 'outbound',
                createdAt: new Date(),
                metadata: JSON.stringify({
                  phone: to,
                  clientName: clientName,
                  templateId: templateId
                })
              }
            });
            console.log('Message WhatsApp enregistré dans communicationHistory');
          } catch (error2) {
            console.log('Impossible d\'enregistrer dans communicationHistory:', error2);
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Message envoyé avec succès',
        messageId: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        error: 'Échec de l\'envoi du message' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur envoi WhatsApp:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}