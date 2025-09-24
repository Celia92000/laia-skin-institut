import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    // Récupérer toutes les automatisations
    const automations = await prisma.emailAutomation.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Si aucune automatisation n'existe, créer les automatisations par défaut
    if (automations.length === 0) {
      const defaultAutomations = [
        {
          name: '✅ Confirmation de réservation',
          trigger: 'booking_confirmation',
          template: 'template_myu4emv',
          enabled: true,
          timing: JSON.stringify({ immediate: true })
        },
        {
          name: '🌟 Demande d\'avis après soin',
          trigger: 'review_request',
          template: 'template_36zodeb',
          enabled: true,
          timing: JSON.stringify({ hoursAfter: 24 })
        },
        {
          name: '📅 Rappel J-1',
          trigger: 'appointment_reminder',
          template: 'template_myu4emv',
          enabled: true,
          timing: JSON.stringify({ daysBefore: 1, time: '14:00' })
        },
        {
          name: '⏰ Rappel 48h avant',
          trigger: 'appointment_reminder_48h',
          template: 'template_myu4emv',
          enabled: true,
          timing: JSON.stringify({ hoursBefore: 48, time: '10:00' })
        },
        {
          name: '🎂 Email d\'anniversaire',
          trigger: 'birthday',
          template: 'template_36zodeb',
          enabled: true,
          timing: JSON.stringify({ time: '09:00' }),
          conditions: JSON.stringify({ requiresBirthdate: true })
        }
      ];

      for (const automation of defaultAutomations) {
        await prisma.emailAutomation.create({ data: automation });
      }

      const createdAutomations = await prisma.emailAutomation.findMany({
        orderBy: { createdAt: 'asc' }
      });

      return NextResponse.json(createdAutomations);
    }

    return NextResponse.json(automations);
  } catch (error) {
    console.error('Erreur récupération automatisations:', error);
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

    // Mettre à jour l'automatisation
    const automation = await prisma.emailAutomation.update({
      where: { id },
      data: {
        name: data.name,
        trigger: data.trigger,
        template: data.template,
        enabled: data.enabled,
        timing: data.timing ? JSON.stringify(data.timing) : undefined,
        conditions: data.conditions ? JSON.stringify(data.conditions) : undefined
      }
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Erreur mise à jour automatisation:', error);
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

    // Créer l'automatisation
    const automation = await prisma.emailAutomation.create({
      data: {
        name: data.name,
        trigger: data.trigger,
        template: data.template,
        enabled: data.enabled ?? true,
        timing: data.timing ? JSON.stringify(data.timing) : null,
        conditions: data.conditions ? JSON.stringify(data.conditions) : null
      }
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Erreur création automatisation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}