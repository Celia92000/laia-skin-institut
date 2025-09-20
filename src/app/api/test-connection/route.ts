import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const directUrl = process.env.DATABASE_URL?.replace(
    'aws-1-eu-west-3.pooler.supabase.com:5432',
    'db.zsxweurvtsrdgehtadwa.supabase.co:5432'
  );
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: directUrl || process.env.DATABASE_URL
      }
    }
  });

  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      select: { name: true, slug: true }
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      count: services.length,
      services,
      connection: {
        original: process.env.DATABASE_URL?.includes('pooler') ? 'pooler' : 'direct',
        used: 'direct override'
      }
    });
  } catch (error: any) {
    await prisma.$disconnect();
    return NextResponse.json({ 
      success: false,
      error: error.message,
      connection: {
        original: process.env.DATABASE_URL?.includes('pooler') ? 'pooler' : 'direct',
        attempted: 'direct override'
      }
    }, { status: 500 });
  }
}