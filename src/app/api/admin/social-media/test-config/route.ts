import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { SocialMediaPublisher } from '@/lib/social-media-publisher';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const platforms = {
      Instagram: {
        configured: SocialMediaPublisher.isPlatformConfigured('Instagram'),
        token: process.env.INSTAGRAM_ACCESS_TOKEN ? '✓ Présent' : '✗ Manquant',
        accountId: process.env.INSTAGRAM_ACCOUNT_ID ? '✓ Présent' : '✗ Manquant'
      },
      Facebook: {
        configured: SocialMediaPublisher.isPlatformConfigured('Facebook'),
        token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? '✓ Présent' : '✗ Manquant',
        pageId: process.env.FACEBOOK_PAGE_ID ? '✓ Présent' : '✗ Manquant'
      },
      Snapchat: {
        configured: SocialMediaPublisher.isPlatformConfigured('Snapchat'),
        token: process.env.SNAPCHAT_ACCESS_TOKEN ? '✓ Présent' : '✗ Manquant'
      },
      TikTok: {
        configured: SocialMediaPublisher.isPlatformConfigured('TikTok'),
        token: process.env.TIKTOK_ACCESS_TOKEN ? '✓ Présent' : '✗ Manquant'
      },
      LinkedIn: {
        configured: SocialMediaPublisher.isPlatformConfigured('LinkedIn'),
        token: process.env.LINKEDIN_ACCESS_TOKEN ? '✓ Présent' : '✗ Manquant',
        personId: process.env.LINKEDIN_PERSON_ID ? '✓ Présent' : '✗ Manquant'
      },
      Twitter: {
        configured: SocialMediaPublisher.isPlatformConfigured('Twitter'),
        token: process.env.TWITTER_BEARER_TOKEN ? '✓ Présent' : '✗ Manquant'
      }
    };

    const configuredPlatforms = SocialMediaPublisher.getConfiguredPlatforms();

    return NextResponse.json({
      success: true,
      configuredCount: configuredPlatforms.length,
      configuredPlatforms,
      details: platforms,
      message: configuredPlatforms.length > 0
        ? `${configuredPlatforms.length} plateforme(s) configurée(s) : ${configuredPlatforms.join(', ')}`
        : 'Aucune plateforme configurée. Ajoutez vos tokens dans le fichier .env'
    });

  } catch (error: any) {
    console.error('Erreur test config:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
