import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { SocialMediaPublisher } from '@/lib/social-media-publisher';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier la clé secrète du cron (sécurité)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'laia-cron-secret-2024';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les publications planifiées dont l'heure est passée
    const now = new Date();
    const scheduledPosts = await prisma.socialMediaPost.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now
        },
        platform: {
          not: null
        }
      },
      take: 10 // Maximum 10 publications par exécution
    }).catch(() => []);

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune publication à traiter',
        count: 0
      });
    }

    const results: any[] = [];

    // Publier chaque post
    for (const post of scheduledPosts) {
      try {
        // Préparer les données
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

        // Publier
        const result = await SocialMediaPublisher.publish(post.platform!, publishData);

        if (result.success) {
          // Mettre à jour le statut
          await prisma.socialMediaPost.update({
            where: { id: post.id },
            data: {
              status: 'published',
              publishedAt: new Date(),
              notes: `${post.notes || ''}\n\nPublié automatiquement le ${new Date().toLocaleString('fr-FR')} - ID: ${result.postId || 'N/A'}`
            }
          }).catch(() => null);

          results.push({
            id: post.id,
            platform: post.platform,
            success: true,
            postId: result.postId
          });
        } else {
          // Marquer comme échec
          await prisma.socialMediaPost.update({
            where: { id: post.id },
            data: {
              status: 'cancelled',
              notes: `${post.notes || ''}\n\nÉchec de publication automatique: ${result.error}`
            }
          }).catch(() => null);

          results.push({
            id: post.id,
            platform: post.platform,
            success: false,
            error: result.error
          });
        }

      } catch (error: any) {
        console.error(`Erreur publication post ${post.id}:`, error);
        results.push({
          id: post.id,
          platform: post.platform,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Publication terminée: ${successCount} réussies, ${failureCount} échecs`,
      total: results.length,
      successCount,
      failureCount,
      results
    });

  } catch (error: any) {
    console.error('Erreur cron publication:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 });
  }
}
