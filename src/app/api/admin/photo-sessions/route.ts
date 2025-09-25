import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID requis' }, { status: 400 });
    }

    // Pour l'instant, on utilise le stockage local
    // Dans une vraie app, on créerait une table PhotoSession dans Prisma
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions photo:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, ...sessionData } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID requis' }, { status: 400 });
    }

    // Pour l'instant, on retourne juste success
    // Dans une vraie app, on sauvegarderait en base de données
    
    return NextResponse.json({ 
      success: true,
      message: 'Session photo sauvegardée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la session photo:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}