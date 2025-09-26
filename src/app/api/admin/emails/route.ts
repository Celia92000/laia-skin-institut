import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    const emails = await prisma.emailHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 100,
      select: {
        id: true,
        to: true,
        from: true,
        subject: true,
        body: true,
        type: true,
        status: true,
        resendId: true,
        error: true,
        userId: true,
        reservationId: true,
        metadata: true,
        createdAt: true
      }
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Erreur récupération emails:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}