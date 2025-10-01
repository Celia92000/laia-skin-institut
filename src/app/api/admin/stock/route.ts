import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API pour gérer les stocks (admin)
export async function GET(request: NextRequest) {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        serviceLinks: {
          include: {
            service: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stockData = {
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      quantity: body.quantity || 0,
      initialQuantity: body.initialQuantity || body.quantity || null,
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

    const stock = await prisma.stock.create({
      data: stockData
    });

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du stock:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
