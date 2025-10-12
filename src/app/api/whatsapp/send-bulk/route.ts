import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Configuration Meta WhatsApp
const metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
const metaPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const metaApiVersion = 'v18.0';

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

    // Vérifier la configuration Meta WhatsApp
    if (!metaAccessToken || !metaPhoneNumberId) {
      return NextResponse.json({
        error: 'Configuration Meta WhatsApp manquante',
        details: 'WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID doivent être configurés dans .env'
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
        // Formater le numéro (enlever le + et whatsapp:)
        let formattedPhone = user.phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '33' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('33')) {
          formattedPhone = '33' + formattedPhone;
        }

        // Envoyer via Meta WhatsApp
        const messageData = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        };

        const response = await fetch(
          `https://graph.facebook.com/${metaApiVersion}/${metaPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${metaAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Meta API error: ${JSON.stringify(error)}`);
        }

        const metaResponse = await response.json();

        // Enregistrer dans l'historique
        await prisma.whatsAppHistory.create({
          data: {
            from: metaPhoneNumberId,
            to: formattedPhone,
            message,
            status: 'sent',
            direction: 'outgoing',
            userId: user.id
          }
        });

        results.push({
          clientId: user.id,
          clientName: user.name,
          status: 'sent',
          messageId: metaResponse.messages?.[0]?.id
        });
        successCount++;

        console.log(`✅ Message WhatsApp envoyé à ${user.name} (${formattedPhone})`);

        // Petit délai entre chaque envoi pour éviter le rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Erreur envoi à ${user.name}:`, error);
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
