import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const { id } = await params;
    const body = await request.json();

    const stockData = {
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      quantity: body.quantity || 0,
      initialQuantity: body.initialQuantity !== undefined ? body.initialQuantity : undefined,
      minQuantity: body.minQuantity || 5,
      unit: body.unit || null,
      cost: body.cost ? parseFloat(body.cost) : null,
      supplier: body.supplier || null,
      purchaseUrl: body.purchaseUrl || null,
      reference: body.reference || null,
      barcode: body.barcode || null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      lastRestocked: body.lastRestocked ? new Date(body.lastRestocked) : null,
      location: body.location || null,
      notes: body.notes || null,
      active: body.active !== undefined ? body.active : true
    };

    const stock = await prisma.stock.update({
      where: { id },
      data: stockData
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const { id } = await params;
    await prisma.stock.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Stock supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
