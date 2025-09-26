import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loyaltyPoints: true,
        totalSpent: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });
    }

    // Générer un nouveau token
    const newToken = generateToken(user.id, user.role);

    // Créer la réponse avec le nouveau token
    const response = NextResponse.json({ 
      token: newToken,
      user 
    });

    // Ajouter le cookie HTTPOnly pour plus de sécurité
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 an
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Erreur de rafraîchissement:', error);
    return NextResponse.json({ error: 'Erreur de rafraîchissement' }, { status: 500 });
  }
}