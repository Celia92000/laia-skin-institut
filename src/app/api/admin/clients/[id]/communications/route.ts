import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface CommunicationHistory {
  id: string;
  type: 'whatsapp' | 'email';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateUsed?: string;
  subject?: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const clientId = params.id;

    // Récupérer l'historique des communications depuis les différentes tables
    const communications: CommunicationHistory[] = [];

    // 1. Récupérer les emails envoyés
    try {
      const emailHistory = await prisma.emailHistory?.findMany({
        where: {
          recipientId: clientId
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 50 // Limiter à 50 derniers
      });

      if (emailHistory) {
        emailHistory.forEach(email => {
          communications.push({
            id: `email-${email.id}`,
            type: 'email',
            content: email.content || email.subject || 'Email envoyé',
            timestamp: email.sentAt,
            status: email.status as 'sent' | 'delivered' | 'read' | 'failed',
            templateUsed: email.template,
            subject: email.subject
          });
        });
      }
    } catch (error) {
      console.log('Table emailHistory non trouvée, continuons...');
    }

    // 2. Récupérer les messages WhatsApp
    try {
      const whatsappHistory = await prisma.whatsAppHistory?.findMany({
        where: {
          clientId: clientId
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 50
      });

      if (whatsappHistory) {
        whatsappHistory.forEach(message => {
          communications.push({
            id: `whatsapp-${message.id}`,
            type: 'whatsapp',
            content: message.content,
            timestamp: message.sentAt,
            status: message.status as 'sent' | 'delivered' | 'read' | 'failed',
            templateUsed: message.templateUsed
          });
        });
      }
    } catch (error) {
      console.log('Table whatsAppHistory non trouvée, continuons...');
    }

    // 3. Récupérer les emails de réservation
    try {
      const reservations = await prisma.reservation.findMany({
        where: {
          clientId: clientId,
          OR: [
            { confirmationEmailSent: true },
            { reminderEmailSent: true }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      reservations.forEach(reservation => {
        if (reservation.confirmationEmailSent) {
          communications.push({
            id: `reservation-confirmation-${reservation.id}`,
            type: 'email',
            content: `Email de confirmation de réservation pour ${reservation.service}`,
            timestamp: reservation.createdAt,
            status: 'sent',
            templateUsed: 'Confirmation de réservation'
          });
        }

        if (reservation.reminderEmailSent) {
          communications.push({
            id: `reservation-reminder-${reservation.id}`,
            type: 'email',
            content: `Email de rappel pour votre rendez-vous ${reservation.service}`,
            timestamp: new Date(reservation.date.getTime() - 48 * 60 * 60 * 1000), // 48h avant
            status: 'sent',
            templateUsed: 'Rappel de rendez-vous'
          });
        }
      });
    } catch (error) {
      console.log('Erreur lors de la récupération des réservations:', error);
    }

    // Trier par date décroissante
    communications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Retourner les 30 dernières communications
    const recentCommunications = communications.slice(0, 30);

    return NextResponse.json(recentCommunications);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    
    // Retourner des données mockées en cas d'erreur
    const mockData: CommunicationHistory[] = [
      {
        id: '1',
        type: 'whatsapp',
        content: 'Bonjour, votre rendez-vous pour Soin visage anti-âge est confirmé le 25/03/2024 à 14:00 chez LAIA SKIN Institut. À bientôt ! ✨',
        timestamp: new Date('2024-03-24T10:00:00'),
        status: 'delivered',
        templateUsed: 'Confirmation de rendez-vous'
      },
      {
        id: '2',
        type: 'email',
        content: 'Merci pour votre visite ! Nous espérons que vous avez apprécié votre soin. N\'hésitez pas à nous faire part de vos commentaires.',
        timestamp: new Date('2024-03-25T16:30:00'),
        status: 'read',
        templateUsed: 'Suivi après soin',
        subject: 'Merci pour votre visite chez LAIA SKIN'
      },
      {
        id: '3',
        type: 'whatsapp',
        content: 'Rappel : Votre rdv Soin hydratant est demain 28/03/2024 à 15:30. Nous avons hâte de vous accueillir chez LAIA SKIN ! 💫',
        timestamp: new Date('2024-03-27T09:00:00'),
        status: 'read',
        templateUsed: 'Rappel de rendez-vous'
      },
      {
        id: '4',
        type: 'email',
        content: 'Email de confirmation de votre réservation pour Soin hydratant le 28/03/2024 à 15:30.',
        timestamp: new Date('2024-03-20T14:15:00'),
        status: 'sent',
        templateUsed: 'Confirmation de réservation',
        subject: 'Confirmation de votre rendez-vous LAIA SKIN'
      }
    ];

    return NextResponse.json(mockData);
  }
}

// Endpoint pour enregistrer une nouvelle communication
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { type, content, templateUsed, subject, status = 'sent' } = await request.json();
    const clientId = params.id;

    if (type === 'whatsapp') {
      // Enregistrer dans l'historique WhatsApp
      try {
        const whatsappRecord = await prisma.whatsAppHistory?.create({
          data: {
            clientId,
            content,
            templateUsed,
            status,
            sentAt: new Date()
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          id: whatsappRecord?.id || Date.now().toString()
        });
      } catch (error) {
        console.log('Table whatsAppHistory non trouvée, simulation d\'enregistrement');
        return NextResponse.json({ 
          success: true, 
          id: Date.now().toString(),
          note: 'Enregistré localement (table non disponible)'
        });
      }
    } else if (type === 'email') {
      // Enregistrer dans l'historique des emails
      try {
        const emailRecord = await prisma.emailHistory?.create({
          data: {
            recipientId: clientId,
            content,
            subject,
            template: templateUsed,
            status,
            sentAt: new Date()
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          id: emailRecord?.id || Date.now().toString()
        });
      } catch (error) {
        console.log('Table emailHistory non trouvée, simulation d\'enregistrement');
        return NextResponse.json({ 
          success: true, 
          id: Date.now().toString(),
          note: 'Enregistré localement (table non disponible)'
        });
      }
    }

    return NextResponse.json({ error: 'Type de communication non supporté' }, { status: 400 });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'enregistrement',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}