import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les campagnes
    const campaigns = await prisma.emailCampaign.findMany({
      include: {
        _count: {
          select: {
            emails: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Erreur récupération campagnes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const data = await request.json();

    // Créer la campagne
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        template: data.template,
        recipients: JSON.stringify(data.recipients),
        recipientCount: data.recipients.length,
        status: data.status || 'draft',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null
      }
    });

    // Si la campagne doit être envoyée immédiatement
    if (data.status === 'sent' && data.sendNow) {
      // Envoyer les emails et créer l'historique
      const recipients = JSON.parse(campaign.recipients);
      
      for (const recipient of recipients) {
        try {
          // Envoyer via EmailJS
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: 'default_service',
              template_id: data.template || 'template_36zodeb',
              user_id: 'QK6MriGN3B0UqkIoS',
              template_params: {
                to_email: recipient.email,
                client_name: recipient.name,
                subject: data.subject,
                message: data.content,
                from_name: 'LAIA SKIN Institut',
                reply_to: 'contact@laia.skininstitut.fr',
                service_name: data.subject,
                review_link: 'https://laiaskin.fr',
                loyalty_progress: '',
                next_reward: data.content
              }
            })
          });

          // Créer l'historique
          await prisma.emailHistory.create({
            data: {
              from: 'contact@laia.skininstitut.fr',
              to: recipient.email,
              subject: data.subject,
              content: data.content,
              template: data.template,
              status: response.ok ? 'sent' : 'failed',
              campaignId: campaign.id,
              userId: recipient.id
            }
          });
        } catch (error) {
          console.error(`Erreur envoi à ${recipient.email}:`, error);
        }
      }

      // Mettre à jour le statut de la campagne
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { 
          status: 'sent',
          sentAt: new Date()
        }
      });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur création campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { id, ...data } = await request.json();

    // Mettre à jour la campagne
    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        template: data.template,
        recipients: data.recipients ? JSON.stringify(data.recipients) : undefined,
        recipientCount: data.recipients?.length,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur mise à jour campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Supprimer la campagne
    await prisma.emailCampaign.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression campagne:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}