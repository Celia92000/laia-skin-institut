import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer tous les liens stock pour un service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const links = await prisma.serviceStock.findMany({
      where: { serviceId: id },
      include: {
        stock: {
          select: {
            id: true,
            name: true,
            quantity: true,
            minQuantity: true,
            unit: true
          }
        }
      }
    });

    const formattedLinks = links.map(link => ({
      id: link.id,
      stockId: link.stockId,
      stockName: link.stock.name,
      quantityPerUse: link.quantityPerUse,
      unit: link.stock.unit,
      stockQuantity: link.stock.quantity
    }));

    return NextResponse.json(formattedLinks);
  } catch (error) {
    console.error('Erreur lors de la récupération des liens:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un lien entre service et stock
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    const link = await prisma.serviceStock.create({
      data: {
        serviceId: id,
        stockId: body.stockId,
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
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du lien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
