import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer toutes les automatisations
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const automations = await prisma.whatsAppAutomation.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Parser les données JSON
    const formattedAutomations = automations.map(auto => ({
      ...auto,
      timing: auto.timing ? JSON.parse(auto.timing) : null,
      conditions: auto.conditions ? JSON.parse(auto.conditions) : null
    }));

    return NextResponse.json(formattedAutomations);
  } catch (error) {
    console.error('Erreur récupération automatisations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle automatisation
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, trigger, templateId, timing, conditions, enabled } = body;

    const automation = await prisma.whatsAppAutomation.create({
      data: {
        name,
        trigger,
        templateId,
        timing: timing ? JSON.stringify(timing) : null,
        conditions: conditions ? JSON.stringify(conditions) : null,
        enabled: enabled ?? true
      }
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Erreur création automatisation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une automatisation
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { id, enabled, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Si on change juste l'état enabled
    if (Object.keys(body).length === 2 && enabled !== undefined) {
      const automation = await prisma.whatsAppAutomation.update({
        where: { id },
        data: { enabled }
      });
      return NextResponse.json(automation);
    }

    // Mise à jour complète
    const automation = await prisma.whatsAppAutomation.update({
      where: { id },
      data: {
        ...updateData,
        timing: updateData.timing ? JSON.stringify(updateData.timing) : undefined,
        conditions: updateData.conditions ? JSON.stringify(updateData.conditions) : undefined
      }
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Erreur mise à jour automatisation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une automatisation
export async function DELETE(request: Request) {
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

    await prisma.whatsAppAutomation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression automatisation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}