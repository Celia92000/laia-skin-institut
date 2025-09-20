import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exclude = searchParams.get('exclude');
    const limit = searchParams.get('limit');

    const where: any = { active: true };
    
    if (exclude) {
      where.slug = { not: exclude };
    }

    const services = await prisma.service.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}