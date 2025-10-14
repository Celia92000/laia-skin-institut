// 🔒 Rate Limiting - Protection anti-spam
// Limite le nombre de requêtes par IP pour éviter les abus

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Créer l'instance Redis (si les clés sont configurées)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Configuration du rate limiting
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requêtes par 10 secondes
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

/**
 * Vérifie si une IP peut faire une requête
 * @param identifier - L'identifiant (IP, user ID, etc.)
 * @param limit - Nombre de requêtes autorisées (optionnel, défaut: 10)
 * @param window - Fenêtre de temps en secondes (optionnel, défaut: 10s)
 * @returns { success: boolean, limit: number, remaining: number, reset: Date }
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  window: string = '10 s'
) {
  // Si Upstash n'est pas configuré, autoriser par défaut (mode développement)
  if (!ratelimit) {
    console.warn('⚠️ Rate limiting désactivé - Upstash non configuré');
    return {
      success: true,
      limit: limit,
      remaining: limit,
      reset: new Date(Date.now() + 10000),
      pending: Promise.resolve(),
    };
  }

  // Vérifier la limite
  const result = await ratelimit.limit(identifier);

  return result;
}

/**
 * Rate limiter spécifique pour les endpoints sensibles (login, paiement)
 * Plus strict : 5 requêtes par minute
 */
export async function checkStrictRateLimit(identifier: string) {
  if (!redis) {
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: new Date(Date.now() + 60000),
      pending: Promise.resolve(),
    };
  }

  const strictLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requêtes par minute
    analytics: true,
    prefix: '@upstash/ratelimit/strict',
  });

  return await strictLimiter.limit(identifier);
}

/**
 * Récupère l'IP du client depuis la requête
 */
export function getClientIp(request: Request): string {
  // Essayer d'obtenir l'IP depuis les headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback : IP par défaut
  return 'unknown';
}

/**
 * Vérifie si Upstash est configuré
 */
export function isRateLimitEnabled(): boolean {
  return ratelimit !== null;
}
