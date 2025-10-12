import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+33757909144';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { clientIds, message, campaignName } = body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json({ error: 'Liste de clients vide' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message manquant' }, { status: 400 });
    }

    // Vérifier les credentials Twilio
    if (!accountSid || !authToken) {
      return NextResponse.json({
        error: 'Configuration Twilio manquante',
        details: 'TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN doivent être configurés dans .env'
      }, { status: 500 });
    }

    // Récupérer les clients
    const clients = await prisma.user.findMany({
      where: {
        id: { in: clientIds }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    });

    const client = twilio(accountSid, authToken);
    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    // Envoyer à chaque client
    for (const user of clients) {
      if (!user.phone) {
        results.push({
          clientId: user.id,
          clientName: user.name,
          status: 'failed',
          error: 'Pas de numéro de téléphone'
        });
        failCount++;
        continue;
      }

      try {
        // Formater le numéro
        let formattedPhone = user.phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '33' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('33')) {
          formattedPhone = '33' + formattedPhone;
        }
        const whatsappTo = `whatsapp:+${formattedPhone}`;

        // Envoyer via Twilio
        const twilioMessage = await client.messages.create({
          from: whatsappNumber,
          to: whatsappTo,
          body: message
        });

        // Enregistrer dans l'historique
        await prisma.whatsAppHistory.create({
          data: {
            from: whatsappNumber,
            to: whatsappTo,
            message,
            status: 'sent',
            direction: 'outgoing',
            userId: user.id,
            sentAt: new Date(),
            twilioSid: twilioMessage.sid
          }
        });

        results.push({
          clientId: user.id,
          clientName: user.name,
          status: 'sent',
          twilioSid: twilioMessage.sid
        });
        successCount++;

        // Petit délai entre chaque envoi pour éviter le rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erreur envoi à ${user.name}:`, error);
        results.push({
          clientId: user.id,
          clientName: user.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Envoi terminé : ${successCount} succès, ${failCount} échecs`,
      total: clients.length,
      successCount,
      failCount,
      results
    });
  } catch (error) {
    console.error('Erreur envoi groupé WhatsApp:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
