import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer toutes les campagnes
export async function GET(request: Request) {
  const prisma = await getPrismaClient();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const campaigns = await prisma.whatsAppCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Parser les données JSON
    const formattedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      recipients: campaign.recipients ? JSON.parse(campaign.recipients) : []
    }));

    return NextResponse.json(formattedCampaigns);
  } catch (error) {
    console.error('Erreur récupération campagnes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle campagne
export async function POST(request: Request) {
  const prisma = await getPrismaClient();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId, recipients, scheduledAt } = body;

    // Validation
    if (!name) {
      return NextResponse.json({ error: 'Le nom de la campagne est requis' }, { status: 400 });
    }

    const campaign = await prisma.whatsAppCampaign.create({
      data: {
        name,
        templateId: templateId || 'default',
        recipients: JSON.stringify(recipients || []),
        recipientCount: recipients?.length || 0,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur création campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une campagne (status, etc.)
export async function PUT(request: Request) {
  const prisma = await getPrismaClient();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    let campaign;

    // Actions spécifiques
    switch (action) {
      case 'start':
        campaign = await prisma.whatsAppCampaign.update({
          where: { id },
          data: {
            status: 'active',
            startedAt: new Date()
          }
        });
        // Ici on pourrait déclencher l'envoi des messages
        break;

      case 'pause':
        campaign = await prisma.whatsAppCampaign.update({
          where: { id },
          data: { status: 'paused' }
        });
        break;

      case 'resume':
        campaign = await prisma.whatsAppCampaign.update({
          where: { id },
          data: { status: 'active' }
        });
        break;

      case 'complete':
        campaign = await prisma.whatsAppCampaign.update({
          where: { id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });
        break;

      case 'cancel':
        campaign = await prisma.whatsAppCampaign.update({
          where: { id },
          data: { status: 'cancelled' }
        });
        break;

      default:
        // Mise à jour générale
        campaign = await prisma.whatsAppCampaign.update({
          where: { id },
          data: {
            ...updateData,
            recipients: updateData.recipients ? JSON.stringify(updateData.recipients) : undefined
          }
        });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur mise à jour campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une campagne
export async function DELETE(request: Request) {
  const prisma = await getPrismaClient();

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.whatsAppCampaign.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}