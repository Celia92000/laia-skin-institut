import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(
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

    const body = await request.json();
    const { name, category, content, variables, active } = body;

    const updatedTemplate = await prisma.whatsAppTemplate.update({
      where: { id: params.id },
      data: {
        name,
        category,
        content,
        variables: variables || JSON.stringify([]),
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Erreur modification template:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function DELETE(
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

    // Vérifier si le template est utilisé dans des campagnes actives
    const campaigns = await prisma.whatsAppCampaign.findMany({
      where: {
        templateId: params.id,
        status: {
          in: ['active', 'scheduled']
        }
      }
    });

    if (campaigns.length > 0) {
      return NextResponse.json({ 
        error: 'Ce modèle est utilisé dans des campagnes actives et ne peut pas être supprimé' 
      }, { status: 400 });
    }

    // Supprimer le template
    await prisma.whatsAppTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Modèle supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression template:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}