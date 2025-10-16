import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';
const META_APP_ID = process.env.META_APP_ID || '785663654385417';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Créer un state token pour la sécurité OAuth
    const state = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '10m' });

    // Construire l'URL de redirection
    const redirectUri = `${request.nextUrl.origin}/api/auth/instagram/callback`;

    // URL d'autorisation Facebook/Instagram
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,instagram_manage_insights&response_type=code`;

    return NextResponse.json({ authUrl });

  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'URL d\'autorisation' },
      { status: 500 }
    );
  }
}
