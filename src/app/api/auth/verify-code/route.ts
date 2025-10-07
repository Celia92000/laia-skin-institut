import { NextResponse } from 'next/server';
import { verificationCodes } from '@/lib/verification-codes';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

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
        { error: 'Code expiré. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    // Code valide, on le garde pour la réinitialisation
    return NextResponse.json({
      message: 'Code vérifié avec succès',
      valid: true
    });

  } catch (error) {
    console.error('Erreur vérification code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}