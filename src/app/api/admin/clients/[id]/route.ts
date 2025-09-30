import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les détails du client
    const client = await prisma.user.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            service: true
          },
          orderBy: {
            date: 'desc'
          }
        },
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Calculer les statistiques
    const totalSpent = client.reservations.reduce((sum, res) => {
      return sum + (res.service?.price || 0);
    }, 0);

    const lastVisit = client.reservations[0]?.date;

    // Formater la réponse
    const clientDetail = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      birthDate: client.birthDate,
      lastVisit,
      totalVisits: client._count.reservations,
      totalSpent,
      loyaltyPoints: client.loyaltyPoints,
      tags: client.tags ? JSON.parse(client.tags) : [],
      notes: client.notes,
      vip: client.vip || false,
      createdAt: client.createdAt,
      reservations: client.reservations
    };

    return NextResponse.json(clientDetail);

  } catch (error) {
    console.error('Erreur récupération client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Mise à jour des informations client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrismaClient();
  
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN' && admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { notes, tags, vip, ...updateData } = body;

    // Mettre à jour le client
    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        notes,
        tags: tags ? JSON.stringify(tags) : undefined,
        vip
      }
    });

    return NextResponse.json({
      success: true,
      client: updatedClient
    });

  } catch (error) {
    console.error('Erreur mise à jour client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}