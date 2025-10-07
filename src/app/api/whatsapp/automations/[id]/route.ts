import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
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
    const { enabled } = body;

    // Mettre à jour l'automatisation
    const updatedAutomation = await prisma.whatsAppAutomation.update({
      where: { id },
      data: {
        enabled: enabled
      }
    });

    console.log(`✅ Automatisation ${updatedAutomation.name} ${enabled ? 'activée' : 'désactivée'}`);

    return NextResponse.json({
      success: true,
      automation: updatedAutomation,
      message: `Automatisation ${enabled ? 'activée' : 'désactivée'} avec succès`
    });

  } catch (error) {
    console.error('Erreur mise à jour automatisation:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

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

    const automation = await prisma.whatsAppAutomation.findUnique({
      where: { id }
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automatisation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Erreur récupération automatisation:', error);
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

    await prisma.whatsAppAutomation.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Automatisation supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur suppression automatisation:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}