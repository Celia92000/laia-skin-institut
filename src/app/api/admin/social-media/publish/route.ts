import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { SocialMediaPublisher } from '@/lib/social-media-publisher';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'ID de publication manquant' }, { status: 400 });
    }

    // Récupérer la publication
    const post = await prisma.socialMediaPost.findUnique({
      where: { id: postId }
    }).catch(() => null);

    if (!post) {
      return NextResponse.json({ error: 'Publication non trouvée' }, { status: 404 });
    }

    if (!post.platform) {
      return NextResponse.json({
        error: 'Aucune plateforme sélectionnée pour cette publication'
      }, { status: 400 });
    }

    // Préparer les données pour la publication
    const publishData = {
      content: post.content,
      hashtags: post.hashtags || undefined,
      imageUrl: post.mediaUrls ?
        (typeof post.mediaUrls === 'string' ? JSON.parse(post.mediaUrls)[0] : post.mediaUrls[0])
        : undefined,
      link: post.links ?
        (typeof post.links === 'string' ? JSON.parse(post.links)[0] : post.links[0])
        : undefined
    };

    // Publier sur la plateforme
    const result = await SocialMediaPublisher.publish(post.platform, publishData);

    if (result.success) {
      // Mettre à jour le statut de la publication
      await prisma.socialMediaPost.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: new Date(),
          notes: `${post.notes || ''}\n\nPublié avec succès le ${new Date().toLocaleString('fr-FR')} - ID: ${result.postId || 'N/A'}`
        }
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: `Publication réussie sur ${result.platform}`,
        postId: result.postId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erreur lors de la publication'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erreur publication:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Vérifier les plateformes configurées
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

    const configuredPlatforms = SocialMediaPublisher.getConfiguredPlatforms();

    const platformsStatus = {
      Instagram: SocialMediaPublisher.isPlatformConfigured('Instagram'),
      Facebook: SocialMediaPublisher.isPlatformConfigured('Facebook'),
      LinkedIn: SocialMediaPublisher.isPlatformConfigured('LinkedIn'),
      Twitter: SocialMediaPublisher.isPlatformConfigured('Twitter')
    };

    return NextResponse.json({
      configured: configuredPlatforms,
      status: platformsStatus
    });

  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
