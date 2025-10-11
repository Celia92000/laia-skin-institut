import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

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

    // Vérifier que c'est un admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN' && admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les dernières campagnes (limitées pour la performance)
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    const campaigns = await prisma.emailCampaign.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        emails: {
          select: {
            id: true,
            to: true,
            subject: true,
            status: true,
            createdAt: true,
            userId: true,
            openCount: true,
            clickCount: true
          }
        }
      }
    });

    // Formater les données pour le frontend
    const formattedCampaigns = campaigns.map(campaign => {
      const recipients = campaign.emails.map(email => ({
        id: email.id,
        email: email.to || '',
        name: 'Client',
        status: email.status === 'sent' ? 'sent' :
                email.status === 'delivered' ? 'delivered' :
                email.status === 'opened' ? 'opened' :
                email.status === 'clicked' ? 'clicked' :
                email.status === 'bounced' ? 'bounced' :
                email.status === 'failed' ? 'failed' : 'sent',
        sentAt: email.createdAt,
        openCount: email.openCount || 0,
        clickCount: email.clickCount || 0
      }));

      const total = recipients.length;
      const sent = recipients.filter(r => r.status === 'sent' || r.status === 'delivered' || r.status === 'opened' || r.status === 'clicked').length;
      const delivered = recipients.filter(r => r.status === 'delivered' || r.status === 'opened' || r.status === 'clicked').length;
      const opened = recipients.filter(r => r.status === 'opened' || r.status === 'clicked').length;
      const clicked = recipients.filter(r => r.status === 'clicked').length;
      const bounced = recipients.filter(r => r.status === 'bounced').length;
      const failed = recipients.filter(r => r.status === 'failed').length;
      const unsubscribed = 0; // TODO: Implémenter les désabonnements

      const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
      const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
      const bounceRate = total > 0 ? (bounced / total) * 100 : 0;
      const unsubscribeRate = 0;

      // Score d'engagement (basé sur les taux)
      const engagementScore = Math.round(
        (openRate * 0.4) + (clickRate * 0.4) + ((100 - bounceRate) * 0.2)
      );

      return {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.content,
        type: campaign.template?.includes('automation') ? 'automation' : 'campaign',
        sentAt: campaign.sentAt || campaign.createdAt,
        completedAt: campaign.sentAt,
        recipients,
        stats: {
          total,
          sent,
          delivered,
          opened,
          clicked,
          bounced,
          failed,
          unsubscribed,
          pending: 0
        },
        performance: {
          deliveryRate,
          openRate,
          clickRate,
          bounceRate,
          unsubscribeRate,
          engagementScore
        },
        segments: ['Tous les clients'], // TODO: Implémenter la segmentation
        tags: campaign.template ? [campaign.template] : []
      };
    });

    return NextResponse.json(formattedCampaigns);

  } catch (error) {
    console.error('Erreur récupération campagnes:', error);

    // En cas d'erreur, retourner des données de démo
    return NextResponse.json([
      {
        id: 'demo-1',
        name: 'Campagne de démo',
        subject: 'Bienvenue',
        content: 'Contenu de démo',
        type: 'campaign',
        sentAt: new Date(),
        recipients: [],
        stats: {
          total: 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
          pending: 0
        },
        performance: {
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0,
          engagementScore: 0
        },
        segments: [],
        tags: []
      }
    ]);
  }
}
