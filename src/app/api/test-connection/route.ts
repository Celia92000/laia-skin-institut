import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = await getPrismaClient();

    const services = await prisma.service.findMany({
      where: { active: true },
      select: { name: true, slug: true }
    });

    return NextResponse.json({
      success: true,
      count: services.length,
      services,
      connection: {
        type: 'getPrismaClient with connection pooling',
        database: process.env.DATABASE_URL?.includes('pooler') ? 'pooler' : 'direct'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}