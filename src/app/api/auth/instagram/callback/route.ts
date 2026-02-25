import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';
const META_APP_ID = process.env.META_APP_ID || '785663654385417';
const META_APP_SECRET = process.env.META_APP_SECRET || 'a81a181a749c678a27849256b425e5ad';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Gérer les erreurs de la part de Meta
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/admin?error=oauth_failed&message=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin?error=no_code', request.url)
      );
    }

    // Décoder le state pour récupérer l'userId
    let userId: string;
    try {
      const decoded = jwt.verify(state || '', JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.redirect(
        new URL('/admin?error=invalid_state', request.url)
      );
    }

    // Échanger le code contre un token d'accès de courte durée
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      `${request.nextUrl.origin}/api/auth/instagram/callback`
    )}&client_secret=${META_APP_SECRET}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData);
      return NextResponse.redirect(
        new URL('/admin?error=token_failed', request.url)
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Convertir en token longue durée (60 jours)
    const longLivedTokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;

    const longLivedResponse = await fetch(longLivedTokenUrl);
    const longLivedData = await longLivedResponse.json();

    const accessToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000; // 60 jours par défaut

    // Calculer la date d'expiration
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Récupérer les informations de la page Facebook
    const meAccountsUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`;
    const meAccountsResponse = await fetch(meAccountsUrl);
    const meAccountsData = await meAccountsResponse.json();

    if (!meAccountsData.data || meAccountsData.data.length === 0) {
      return NextResponse.redirect(
        new URL('/admin?error=no_pages', request.url)
      );
    }

    // Prendre la première page (ou celle avec Instagram lié)
    const page = meAccountsData.data[0];
    const pageId = page.id;
    const pageName = page.name;

    // Récupérer l'Instagram Business Account ID
    const igAccountUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`;
    const igAccountResponse = await fetch(igAccountUrl);
    const igAccountData = await igAccountResponse.json();

    const instagramAccountId = igAccountData.instagram_business_account?.id;

    if (!instagramAccountId) {
      return NextResponse.redirect(
        new URL('/admin?error=no_instagram_account&message=Aucun compte Instagram Business lié à cette page Facebook', request.url)
      );
    }

    // Récupérer le username Instagram
    const igUsernameUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=username&access_token=${accessToken}`;
    const igUsernameResponse = await fetch(igUsernameUrl);
    const igUsernameData = await igUsernameResponse.json();
    const instagramUsername = igUsernameData.username || pageName;

    // Vérifier si un compte existe déjà pour cet utilisateur et cette plateforme
    const existingAccount = await prisma.socialMediaConfig.findFirst({
      where: {
        userId: userId,
        platform: 'instagram'
      }
    });

    if (existingAccount) {
      // Mettre à jour le compte existant
      await prisma.socialMediaConfig.update({
        where: { id: existingAccount.id },
        data: {
          accountName: instagramUsername,
          accountId: instagramAccountId,
          pageId: pageId,
          accessToken: accessToken,
          refreshToken: null,
          expiresAt: expiresAt,
          enabled: true
        }
      });
    } else {
      // Créer un nouveau compte
      await prisma.socialMediaConfig.create({
        data: {
          userId: userId,
          platform: 'instagram',
          accountName: instagramUsername,
          accountId: instagramAccountId,
          pageId: pageId,
          accessToken: accessToken,
          refreshToken: null,
          expiresAt: expiresAt,
          enabled: true,
          isDefault: true
        }
      });
    }

    // Rediriger vers l'admin avec succès
    return NextResponse.redirect(
      new URL('/admin?success=instagram_connected&tab=social-media&subtab=sync', request.url)
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/admin?error=unexpected&message=${error instanceof Error ? error.message : 'Unknown error'}`, request.url)
    );
  }
}
