import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verificationCodes } from '@/lib/verification-codes';

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, code et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier le code
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      );
    }

    if (new Date() > storedData.expiry) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 400 }
      );
    }

    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    // Valider le nouveau mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Supprimer le code après utilisation
    verificationCodes.delete(email);

    console.log(`✅ Mot de passe réinitialisé pour: ${email}`);

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}