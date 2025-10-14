import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { secretKey, mode } = body;

    if (!secretKey) {
      return NextResponse.json({ error: 'Clé secrète requise' }, { status: 400 });
    }

    // Vérifier que la clé correspond au mode
    const keyPrefix = mode === 'test' ? 'sk_test_' : 'sk_live_';
    if (!secretKey.startsWith(keyPrefix)) {
      return NextResponse.json({
        error: `La clé doit commencer par ${keyPrefix} pour le mode ${mode}`
      }, { status: 400 });
    }

    // Tester la connexion à Stripe en essayant de récupérer le compte
    const stripeResponse = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      }
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      return NextResponse.json({
        error: error.error?.message || 'Clé API invalide'
      }, { status: 400 });
    }

    const balance = await stripeResponse.json();

    // Récupérer aussi les infos du compte
    const accountResponse = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      }
    });

    let accountInfo = null;
    if (accountResponse.ok) {
      accountInfo = await accountResponse.json();
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie à Stripe',
      balance: {
        available: balance.available,
        pending: balance.pending,
        currency: balance.available[0]?.currency || 'eur'
      },
      account: accountInfo ? {
        id: accountInfo.id,
        email: accountInfo.email,
        country: accountInfo.country,
        businessName: accountInfo.business_profile?.name || accountInfo.settings?.dashboard?.display_name,
        chargesEnabled: accountInfo.charges_enabled,
        payoutsEnabled: accountInfo.payouts_enabled
      } : null
    });

  } catch (error: any) {
    console.error('Erreur test connexion Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors du test de connexion'
    }, { status: 500 });
  }
}
