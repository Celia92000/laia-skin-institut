import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// Fonction pour publier sur les réseaux sociaux
async function publishToSocialMedia(data: any) {
  const platforms = data.platforms || [];

  for (const platform of platforms) {
    try {
      if (platform === 'instagram') {
        await publishToInstagram(data);
      } else if (platform === 'facebook') {
        await publishToFacebook(data);
      } else if (platform === 'tiktok') {
        await publishToTikTok(data);
      }
    } catch (error) {
      console.error(`❌ Erreur publication ${platform}:`, error);
    }
  }
}

// Publier sur Instagram
async function publishToInstagram(data: any) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const type = data.instagramType || 'post';

  if (!accessToken || !accountId) {
    throw new Error('Instagram credentials missing');
  }

  const caption = `${data.content}\n\n${data.hashtags || ''}`.trim();

  if (type === 'post') {
    // Publication classique (photo ou carousel)
    if (!data.mediaUrls || data.mediaUrls.length === 0) {
      throw new Error('Media required for Instagram post');
    }

    // Créer un media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: data.mediaUrls[0],
          caption,
          access_token: accessToken
        })
      }
    );

    const containerData = await containerResponse.json();
    if (!containerData.id) throw new Error('Failed to create media container');

    // Publier le media
    await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken
        })
      }
    );

  } else if (type === 'story') {
    // Story Instagram
    if (!data.mediaUrls || data.mediaUrls.length === 0) {
      throw new Error('Media required for Instagram story');
    }

    await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: data.mediaUrls[0],
          media_type: 'STORIES',
          access_token: accessToken
        })
      }
    );

  } else if (type === 'reel') {
    // Reel Instagram
    if (!data.mediaUrls || data.mediaUrls.length === 0) {
      throw new Error('Video required for Instagram reel');
    }

    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: data.mediaUrls[0],
          caption,
          media_type: 'REELS',
          access_token: accessToken
        })
      }
    );

    const containerData = await containerResponse.json();
    if (!containerData.id) throw new Error('Failed to create reel container');

    // Publier le reel
    await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken
        })
      }
    );
  }
}

// Publier sur Facebook
async function publishToFacebook(data: any) {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const type = data.facebookType || 'post';

  if (!accessToken || !pageId) {
    throw new Error('Facebook credentials missing');
  }

  const message = `${data.content}\n\n${data.hashtags || ''}`.trim();

  if (type === 'post') {
    // Publication classique
    const body: any = {
      message,
      access_token: accessToken
    };

    if (data.mediaUrls && data.mediaUrls.length > 0) {
      body.url = data.mediaUrls[0];
    }

    await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

  } else if (type === 'story') {
    // Story Facebook (non supporté par l'API pour l'instant)
    console.log('⚠️ Facebook Stories not supported via API yet');
  } else if (type === 'reel') {
    // Reel Facebook
    console.log('⚠️ Facebook Reels publication - feature limited');
  }
}

// Publier sur TikTok
async function publishToTikTok(data: any) {
  // TikTok API nécessite une authentification OAuth2 plus complexe
  // Pour l'instant, on log l'intention
  console.log('⚠️ TikTok publication - API integration required');
}

// GET - Récupérer toutes les publications
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      whereClause = {
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const posts = await prisma.socialMediaPost.findMany({
      where: whereClause,
      orderBy: { scheduledDate: 'asc' }
    }).catch((err) => {
      console.log('⚠️  Table socialMediaPost non disponible:', err.message);
      return [];
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des publications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle publication
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const data = await request.json();

    // Si status = 'published', publier immédiatement
    if (data.status === 'published') {
      // Publier sur les plateformes sélectionnées
      await publishToSocialMedia(data);
    }

    const post = await prisma.socialMediaPost.create({
      data: {
        title: data.title,
        content: data.content,
        platform: data.platforms ? data.platforms.join(',') : (data.platform || null),
        scheduledDate: new Date(data.scheduledDate),
        status: data.status || 'draft',
        notes: data.notes || null,
        links: data.links ? JSON.stringify(data.links) : null,
        hashtags: data.hashtags || null,
        mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
        instagramType: data.instagramType || null,
        facebookType: data.facebookType || null,
        tiktokType: data.tiktokType || null,
        category: data.category || null,
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la publication:', error);
    return NextResponse.json({
      error: 'Erreur lors de la création de la publication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour une publication
export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Préparer les données à mettre à jour
    const dataToUpdate: any = {
      title: updateData.title,
      content: updateData.content,
      platform: updateData.platform || null,
      scheduledDate: new Date(updateData.scheduledDate),
      status: updateData.status,
      notes: updateData.notes || null,
      hashtags: updateData.hashtags || null,
    };

    if (updateData.links) {
      dataToUpdate.links = JSON.stringify(updateData.links);
    }

    if (updateData.mediaUrls) {
      dataToUpdate.mediaUrls = JSON.stringify(updateData.mediaUrls);
    }

    if (updateData.status === 'published' && !updateData.publishedAt) {
      dataToUpdate.publishedAt = new Date();
    }

    const post = await prisma.socialMediaPost.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la publication:', error);
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Supprimer une publication
export async function DELETE(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.socialMediaPost.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Publication supprimée' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la publication:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
