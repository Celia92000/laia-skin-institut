import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer les paramètres de carte cadeau
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les paramètres (il ne devrait y en avoir qu'un)
    let settings = await prisma.giftCardSettings.findFirst();

    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (!settings) {
      settings = await prisma.giftCardSettings.create({
        data: {
          emailSubject: "Vous avez reçu une carte cadeau Laia Skin Institut !",
          emailTitle: "🎁 Vous avez reçu une Carte Cadeau !",
          emailIntro: "Quelle belle attention ! Vous venez de recevoir une carte cadeau pour découvrir ou redécouvrir les soins d'exception de Laia Skin Institut.",
          emailInstructions: "Utilisez le code ci-dessous lors de votre réservation en ligne ou contactez-nous pour prendre rendez-vous.",
          emailFooter: "Cette carte cadeau est valable 1 an à partir de la date d'émission.",
          physicalCardTitle: "CARTE CADEAU",
          physicalCardSubtitle: "Laia Skin Institut",
          physicalCardValidity: "Valable 1 an",
          physicalCardInstructions: "Présentez cette carte lors de votre visite ou utilisez le code en ligne.",
          cardColorFrom: "#ec4899",
          cardColorTo: "#be185d",
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // Récupérer ou créer les paramètres
    let settings = await prisma.giftCardSettings.findFirst();

    if (settings) {
      // Mettre à jour
      settings = await prisma.giftCardSettings.update({
        where: { id: settings.id },
        data: {
          emailSubject: body.emailSubject,
          emailTitle: body.emailTitle,
          emailIntro: body.emailIntro,
          emailInstructions: body.emailInstructions,
          emailFooter: body.emailFooter,
          physicalCardTitle: body.physicalCardTitle,
          physicalCardSubtitle: body.physicalCardSubtitle,
          cardColorFrom: body.cardColorFrom,
          cardColorTo: body.cardColorTo,
        }
      });
    } else {
      // Créer
      settings = await prisma.giftCardSettings.create({
        data: {
          emailSubject: body.emailSubject || "Vous avez reçu une carte cadeau Laia Skin Institut !",
          emailTitle: body.emailTitle || "🎁 Vous avez reçu une Carte Cadeau !",
          emailIntro: body.emailIntro || "Quelle belle attention ! Vous venez de recevoir une carte cadeau pour découvrir ou redécouvrir les soins d'exception de Laia Skin Institut.",
          emailInstructions: body.emailInstructions || "Utilisez le code ci-dessous lors de votre réservation en ligne ou contactez-nous pour prendre rendez-vous.",
          emailFooter: body.emailFooter || "Cette carte cadeau est valable 1 an à partir de la date d'émission.",
          physicalCardTitle: body.physicalCardTitle || "CARTE CADEAU",
          physicalCardSubtitle: body.physicalCardSubtitle || "Laia Skin Institut",
          physicalCardValidity: "Valable 1 an",
          physicalCardInstructions: "Présentez cette carte lors de votre visite ou utilisez le code en ligne.",
          cardColorFrom: body.cardColorFrom || "#ec4899",
          cardColorTo: body.cardColorTo || "#be185d",
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
