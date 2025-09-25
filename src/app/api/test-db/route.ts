import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test de connexion simple
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Définie' : 'Non définie'
    });
  } catch (error: any) {
    console.error('Erreur de connexion DB:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'Définie' : 'Non définie',
      details: error.toString()
    }, { status: 500 });
  }
}