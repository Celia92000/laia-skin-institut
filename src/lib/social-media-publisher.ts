// Service de publication automatique sur les réseaux sociaux

interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

export class SocialMediaPublisher {

  // Instagram - via Meta Graph API
  static async publishToInstagram(post: {
    content: string;
    imageUrl?: string;
    hashtags?: string;
  }): Promise<PublishResult> {
    try {
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

      if (!accessToken || !instagramAccountId) {
        return {
          success: false,
          platform: 'Instagram',
          error: 'Configuration Instagram manquante (INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID)'
        };
      }

      const caption = `${post.content}\n\n${post.hashtags || ''}`.trim();

      // Créer un conteneur média
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: post.imageUrl || process.env.DEFAULT_IMAGE_URL,
            caption,
            access_token: accessToken
          })
        }
      );

      const mediaData = await mediaResponse.json();

      if (!mediaData.id) {
        throw new Error(mediaData.error?.message || 'Erreur création média');
      }

      // Publier le conteneur
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: mediaData.id,
            access_token: accessToken
          })
        }
      );

      const publishData = await publishResponse.json();

      if (!publishData.id) {
        throw new Error(publishData.error?.message || 'Erreur publication');
      }

      return {
        success: true,
        platform: 'Instagram',
        postId: publishData.id
      };

    } catch (error: any) {
      console.error('Erreur publication Instagram:', error);
      return {
        success: false,
        platform: 'Instagram',
        error: error.message
      };
    }
  }

  // Facebook - via Graph API
  static async publishToFacebook(post: {
    content: string;
    imageUrl?: string;
    link?: string;
  }): Promise<PublishResult> {
    try {
      const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      const pageId = process.env.FACEBOOK_PAGE_ID;

      if (!accessToken || !pageId) {
        return {
          success: false,
          platform: 'Facebook',
          error: 'Configuration Facebook manquante (FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID)'
        };
      }

      const body: any = {
        message: post.content,
        access_token: accessToken
      };

      if (post.imageUrl) {
        body.url = post.imageUrl;
      }

      if (post.link) {
        body.link = post.link;
      }

      const endpoint = post.imageUrl
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return {
        success: true,
        platform: 'Facebook',
        postId: data.id || data.post_id
      };

    } catch (error: any) {
      console.error('Erreur publication Facebook:', error);
      return {
        success: false,
        platform: 'Facebook',
        error: error.message
      };
    }
  }

  // LinkedIn - via LinkedIn API
  static async publishToLinkedIn(post: {
    content: string;
    imageUrl?: string;
  }): Promise<PublishResult> {
    try {
      const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const personId = process.env.LINKEDIN_PERSON_ID;

      if (!accessToken || !personId) {
        return {
          success: false,
          platform: 'LinkedIn',
          error: 'Configuration LinkedIn manquante (LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_ID)'
        };
      }

      const body: any = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content
            },
            shareMediaCategory: post.imageUrl ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      if (post.imageUrl) {
        body.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          originalUrl: post.imageUrl
        }];
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.status >= 400) {
        throw new Error(data.message || 'Erreur publication LinkedIn');
      }

      return {
        success: true,
        platform: 'LinkedIn',
        postId: data.id
      };

    } catch (error: any) {
      console.error('Erreur publication LinkedIn:', error);
      return {
        success: false,
        platform: 'LinkedIn',
        error: error.message
      };
    }
  }

  // Snapchat - via Snap Kit API
  static async publishToSnapchat(post: {
    content: string;
    imageUrl?: string;
    videoUrl?: string;
  }): Promise<PublishResult> {
    try {
      const accessToken = process.env.SNAPCHAT_ACCESS_TOKEN;

      if (!accessToken) {
        return {
          success: false,
          platform: 'Snapchat',
          error: 'Configuration Snapchat manquante (SNAPCHAT_ACCESS_TOKEN)'
        };
      }

      if (!post.imageUrl && !post.videoUrl) {
        return {
          success: false,
          platform: 'Snapchat',
          error: 'Image ou vidéo requise pour Snapchat'
        };
      }

      // Snapchat utilise le Creative Kit pour publier
      const mediaType = post.videoUrl ? 'VIDEO' : 'PHOTO';
      const mediaUrl = post.videoUrl || post.imageUrl;

      const response = await fetch('https://adsapi.snapchat.com/v1/creatives', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creative: {
            name: post.content.substring(0, 50),
            type: 'SNAP_AD',
            brand_name: 'Laia Skin Institut',
            headline: post.content.substring(0, 34), // Max 34 caractères
            shareable: true,
            call_to_action: 'VIEW_MORE',
            top_snap_media_id: mediaUrl,
            top_snap_crop_position: 'MIDDLE'
          }
        })
      });

      const data = await response.json();

      if (data.request_status !== 'SUCCESS') {
        throw new Error(data.debug_message || 'Erreur publication Snapchat');
      }

      return {
        success: true,
        platform: 'Snapchat',
        postId: data.creative?.id
      };

    } catch (error: any) {
      console.error('Erreur publication Snapchat:', error);
      return {
        success: false,
        platform: 'Snapchat',
        error: error.message
      };
    }
  }

  // TikTok - via TikTok API
  static async publishToTikTok(post: {
    content: string;
    videoUrl?: string;
  }): Promise<PublishResult> {
    try {
      const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

      if (!accessToken) {
        return {
          success: false,
          platform: 'TikTok',
          error: 'Configuration TikTok manquante (TIKTOK_ACCESS_TOKEN)'
        };
      }

      if (!post.videoUrl) {
        return {
          success: false,
          platform: 'TikTok',
          error: 'URL de vidéo requise pour TikTok'
        };
      }

      // Étape 1: Initier la création de vidéo
      const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_info: {
            title: post.content.substring(0, 150), // Max 150 caractères
            privacy_level: 'SELF_ONLY', // ou 'PUBLIC_TO_EVERYONE'
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_url: post.videoUrl
          }
        })
      });

      const initData = await initResponse.json();

      if (initData.error) {
        throw new Error(initData.error.message || 'Erreur initialisation TikTok');
      }

      return {
        success: true,
        platform: 'TikTok',
        postId: initData.data?.publish_id
      };

    } catch (error: any) {
      console.error('Erreur publication TikTok:', error);
      return {
        success: false,
        platform: 'TikTok',
        error: error.message
      };
    }
  }

  // Twitter/X - via Twitter API v2
  static async publishToTwitter(post: {
    content: string;
  }): Promise<PublishResult> {
    try {
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;

      if (!bearerToken) {
        return {
          success: false,
          platform: 'Twitter',
          error: 'Configuration Twitter manquante (TWITTER_BEARER_TOKEN)'
        };
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          text: post.content
        })
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Erreur publication Twitter');
      }

      return {
        success: true,
        platform: 'Twitter',
        postId: data.data?.id
      };

    } catch (error: any) {
      console.error('Erreur publication Twitter:', error);
      return {
        success: false,
        platform: 'Twitter',
        error: error.message
      };
    }
  }

  // Méthode principale qui route vers la bonne plateforme
  static async publish(
    platform: string,
    post: {
      content: string;
      imageUrl?: string;
      hashtags?: string;
      link?: string;
    }
  ): Promise<PublishResult> {

    const normalizedPlatform = platform.toLowerCase();

    switch (normalizedPlatform) {
      case 'instagram':
        return this.publishToInstagram(post);

      case 'facebook':
        return this.publishToFacebook(post);

      case 'linkedin':
        return this.publishToLinkedIn(post);

      case 'snapchat':
      case 'snap':
        return this.publishToSnapchat({
          content: post.content,
          imageUrl: post.imageUrl,
          videoUrl: post.imageUrl?.match(/\.(mp4|mov|avi)$/i) ? post.imageUrl : undefined
        });

      case 'tiktok':
        return this.publishToTikTok({
          content: post.content,
          videoUrl: post.imageUrl // Pour TikTok, c'est une vidéo
        });

      case 'twitter':
      case 'x':
        return this.publishToTwitter(post);

      default:
        return {
          success: false,
          platform,
          error: `Plateforme non supportée: ${platform}`
        };
    }
  }

  // Vérifier si une plateforme est configurée
  static isPlatformConfigured(platform: string): boolean {
    const normalizedPlatform = platform.toLowerCase();

    switch (normalizedPlatform) {
      case 'instagram':
        return !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCOUNT_ID);

      case 'facebook':
        return !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID);

      case 'linkedin':
        return !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_ID);

      case 'snapchat':
      case 'snap':
        return !!process.env.SNAPCHAT_ACCESS_TOKEN;

      case 'tiktok':
        return !!process.env.TIKTOK_ACCESS_TOKEN;

      case 'twitter':
      case 'x':
        return !!process.env.TWITTER_BEARER_TOKEN;

      default:
        return false;
    }
  }

  // Obtenir toutes les plateformes configurées
  static getConfiguredPlatforms(): string[] {
    const platforms = ['Instagram', 'Facebook', 'Snapchat', 'TikTok', 'LinkedIn', 'Twitter'];
    return platforms.filter(p => this.isPlatformConfigured(p));
  }
}
