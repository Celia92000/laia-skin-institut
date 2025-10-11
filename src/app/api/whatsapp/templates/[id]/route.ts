import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const template = await prisma.whatsAppTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            campaigns: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      ...template,
      campaignsCount: template._count.campaigns
    });
  } catch (error) {
    console.error('Erreur récupération template:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
        templateId: id,
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
      where: { id }
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