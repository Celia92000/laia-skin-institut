import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    // Vérifier le token dans la base de données
    const magicLink = await prisma.magicLink.findUnique({
      where: { token }
    });

    if (!magicLink) {
      return NextResponse.json(
        { error: 'Lien invalide ou expiré' },
        { status: 401 }
      );
    }

    // Vérifier si le lien a déjà été utilisé
    if (magicLink.used) {
      return NextResponse.json(
        { error: 'Ce lien a déjà été utilisé' },
        { status: 401 }
      );
    }

    // Vérifier si le lien a expiré
    if (new Date() > magicLink.expiresAt) {
      return NextResponse.json(
        { error: 'Ce lien a expiré. Demandez un nouveau lien de connexion.' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: magicLink.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Marquer le lien comme utilisé
    await prisma.magicLink.update({
      where: { token },
      data: { used: true }
    });

    // Générer un JWT pour l'utilisateur
    const authToken = generateToken(user.id, user.role);

    return NextResponse.json({
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        totalSpent: user.totalSpent
      },
      message: 'Connexion réussie !'
    });

  } catch (error) {
    console.error('Erreur verification magic link:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du lien' },
      { status: 500 }
    );
  }
}
