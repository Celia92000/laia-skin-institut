import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// Générer un code de vérification à 6 chiffres
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Stocker temporairement les codes (en production, utiliser Redis ou la BDD)
const verificationCodes = new Map<string, { code: string; expiry: Date }>();

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Pour des raisons de sécurité, on retourne toujours un succès
    // même si l'email n'existe pas (évite l'énumération d'utilisateurs)
    if (!user) {
      console.log(`Tentative de récupération pour email inexistant: ${email}`);
      return NextResponse.json({
        message: 'Si cet email existe, un code de vérification a été envoyé'
      });
    }

    // Générer un code de vérification
    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // Expire dans 15 minutes

    // Stocker le code
    verificationCodes.set(email, { code, expiry });

    console.log(`📧 Code de vérification pour ${email}: ${code}`);

    // En développement, retourner le code pour faciliter les tests
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: 'Code de vérification envoyé',
        code: code // Uniquement en dev pour les tests
      });
    }

    return NextResponse.json({
      message: 'Si cet email existe, un code de vérification a été envoyé'
    });

  } catch (error) {
    console.error('Erreur forgot password:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Export pour utilisation dans d'autres routes
export { verificationCodes };