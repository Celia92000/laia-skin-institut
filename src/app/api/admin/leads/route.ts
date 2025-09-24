import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status && status !== 'all' 
      ? { status } 
      : {};

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Ajouter des statistiques
    const stats = {
      total: await prisma.lead.count(),
      new: await prisma.lead.count({ where: { status: 'new' } }),
      contacted: await prisma.lead.count({ where: { status: 'contacted' } }),
      qualified: await prisma.lead.count({ where: { status: 'qualified' } }),
      converted: await prisma.lead.count({ where: { status: 'converted' } }),
      lost: await prisma.lead.count({ where: { status: 'lost' } })
    };

    return NextResponse.json({ leads, stats });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Convertir un lead en client
export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await prisma.user.findUnique({
      where: { email: lead.email }
    });

    if (existingUser) {
      // Lier le lead au user existant
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'converted',
          userId: existingUser.id
        }
      });

      return NextResponse.json({ 
        message: 'Lead converti et lié au client existant',
        user: existingUser 
      });
    }

    // Créer un nouveau client
    const newUser = await prisma.user.create({
      data: {
        email: lead.email,
        name: lead.name,
        phone: lead.phone || undefined,
        password: '', // Le client devra réinitialiser son mot de passe
        role: 'client'
      }
    });

    // Mettre à jour le lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'converted',
        userId: newUser.id
      }
    });

    return NextResponse.json({ 
      message: 'Lead converti en nouveau client',
      user: newUser 
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}