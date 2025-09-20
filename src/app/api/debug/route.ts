import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: any = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      DIRECT_URL: process.env.DIRECT_URL ? 'SET (hidden)' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    database: {
      url_start: process.env.DATABASE_URL?.substring(0, 50),
      url_includes_password: process.env.DATABASE_URL?.includes('%23') ? 'YES (encoded)' : 'NO',
      url_includes_host: process.env.DATABASE_URL?.includes('supabase.co') ? 'YES' : 'NO',
      url_includes_localhost: process.env.DATABASE_URL?.includes('localhost') ? 'YES - WRONG!' : 'NO',
      full_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
    },
    prisma: {
      client_exists: false,
      error: null,
      service_count: null
    }
  };

  try {
    const { prisma } = await import('@/lib/prisma');
    diagnostics.prisma.client_exists = true;
    
    const count = await prisma.service.count();
    diagnostics.prisma.service_count = count;
  } catch (error: any) {
    diagnostics.prisma.error = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // Premiers 3 lignes de la stack
    };
  }

  return NextResponse.json(diagnostics);
}