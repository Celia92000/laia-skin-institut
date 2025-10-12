import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const now = new Date();

    // Trouver tous les posts planifiés dont l'heure est passée
    const postsToPublish = await prisma.socialMediaPost.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now
        }
      }
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun post à publier',
        count: 0
      });
    }

    // Mettre à jour les posts en statut "published"
    const updatePromises = postsToPublish.map(post =>
      prisma.socialMediaPost.update({
        where: { id: post.id },
        data: {
          status: 'published',
          publishedAt: now
        }
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ ${postsToPublish.length} posts publiés automatiquement`);

    return NextResponse.json({
      success: true,
      message: `${postsToPublish.length} posts publiés`,
      count: postsToPublish.length,
      posts: postsToPublish.map(p => ({
        id: p.id,
        title: p.title,
        platform: p.platform
      }))
    });

  } catch (error) {
    console.error('Erreur auto-publication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la publication automatique' },
      { status: 500 }
    );
  }
}

// GET endpoint pour vérifier les posts à publier sans les publier
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    const postsToPublish = await prisma.socialMediaPost.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now
        }
      },
      select: {
        id: true,
        title: true,
        platform: true,
        scheduledDate: true
      }
    });

    return NextResponse.json({
      count: postsToPublish.length,
      posts: postsToPublish
    });

  } catch (error) {
    console.error('Erreur vérification auto-publication:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
