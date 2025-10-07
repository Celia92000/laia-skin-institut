import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// DELETE - Supprimer un lien service-stock
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { linkId } = await params;

    await prisma.serviceStock.delete({
      where: { id: linkId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du lien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier la quantité consommée
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { linkId } = await params;
    const body = await request.json();

    const link = await prisma.serviceStock.update({
      where: { id: linkId },
      data: {
        quantityPerUse: body.quantityPerUse
      },
      include: {
        stock: {
          select: {
            name: true,
            unit: true
          }
        }
      }
    });

    return NextResponse.json({
      id: link.id,
      stockId: link.stockId,
      stockName: link.stock.name,
      quantityPerUse: link.quantityPerUse,
      unit: link.stock.unit
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du lien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
