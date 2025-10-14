import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { decryptConfig } from '@/lib/encryption';
import { z } from 'zod';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';

// Schéma de validation
const checkoutSchema = z.object({
  amount: z.number().positive('Le montant doit être positif').min(0.5, 'Montant minimum 0.50€'),
  currency: z.enum(['eur', 'usd', 'gbp']).default('eur'),
  description: z.string().min(1, 'Description requise').max(200),
  reservationId: z.string().optional(),
  productId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    // 🔒 Rate limiting : 5 paiements max par minute (protection anti-fraude)
    const ip = getClientIp(request);
    const { success, limit, remaining } = await checkStrictRateLimit(`payment:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: `Trop de requêtes. Veuillez réessayer dans 1 minute. (${remaining}/${limit} restantes)` },
        { status: 429 }
      );
    }

    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Données invalides',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const {
      amount,
      currency,
      description,
      reservationId,
      productId,
      metadata = {}
    } = validationResult.data;

    // Récupérer la configuration Stripe
    const stripeIntegration = await prisma.integration.findFirst({
      where: {
        type: 'stripe',
        enabled: true
      }
    });

    if (!stripeIntegration || !stripeIntegration.config) {
      return NextResponse.json({
        error: 'Stripe n\'est pas configuré. Activez-le dans Paramètres > Intégrations.'
      }, { status: 400 });
    }

    // Déchiffrer la configuration
    let config: any;
    try {
      config = decryptConfig(stripeIntegration.config as string);
    } catch (error) {
      return NextResponse.json({
        error: 'Erreur de déchiffrement de la configuration Stripe'
      }, { status: 500 });
    }

    if (!config.secretKey) {
      return NextResponse.json({
        error: 'Clé secrète Stripe manquante'
      }, { status: 500 });
    }

    // Créer une session Stripe Checkout
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    const sessionData = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || 'Paiement LAIA SKIN Institut',
              description: reservationId ? `Réservation #${reservationId}` : undefined,
            },
            unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        userId: decoded.userId,
        reservationId: reservationId || '',
        productId: productId || '',
        ...metadata
      },
      customer_email: decoded.email || undefined,
    };

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(sessionData as any).toString()
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      console.error('Erreur Stripe:', error);
      return NextResponse.json({
        error: error.error?.message || 'Erreur lors de la création de la session de paiement'
      }, { status: 500 });
    }

    const session = await stripeResponse.json();

    // Mettre à jour le statut de l'intégration
    await prisma.integration.update({
      where: { id: stripeIntegration.id },
      data: {
        status: 'connected',
        lastSync: new Date()
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      publicKey: config.publishableKey
    });

  } catch (error: any) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
