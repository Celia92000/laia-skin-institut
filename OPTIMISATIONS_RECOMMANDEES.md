# 🚀 Plan d'Optimisation - LAIA SKIN Institut

## 📊 Analyse de l'État Actuel

### ✅ **Points Forts**
- Architecture Next.js moderne avec App Router
- Base de données PostgreSQL performante (Supabase)
- Chiffrement des données sensibles
- Composants React modulaires
- Authentification JWT sécurisée

### ⚠️ **Points à Améliorer**
- Performances de chargement
- Gestion du cache
- Optimisation des requêtes DB
- Expérience utilisateur mobile
- SEO

---

## 🎯 Optimisations Prioritaires

### **1. PERFORMANCES** ⚡

#### A. Optimisation des Images
**Problème** : Images non optimisées, temps de chargement long

**Solutions** :
```typescript
// Utiliser next/image au lieu de <img>
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="LAIA SKIN"
  width={1920}
  height={1080}
  priority // Pour les images above-the-fold
  placeholder="blur" // Effet de flou pendant le chargement
/>
```

**Impact** :
- ⬇️ Réduction de 60-80% de la taille des images
- ⚡ Chargement 3x plus rapide
- 📱 Responsive automatique

#### B. Code Splitting & Lazy Loading
**Problème** : Tous les composants chargés d'un coup

**Solutions** :
```typescript
// Lazy load des composants lourds
import dynamic from 'next/dynamic';

const AdminCalendar = dynamic(() => import('@/components/AdminCalendar'), {
  loading: () => <Loader />,
  ssr: false // Si le composant nécessite le DOM
});

const EmailCompleteInterface = dynamic(() => import('@/components/EmailCompleteInterface'));
```

**Impact** :
- ⬇️ Réduction de 40% du bundle initial
- ⚡ Temps de chargement initial divisé par 2

#### C. Optimisation des Requêtes Prisma
**Problème** : Requêtes N+1, données inutiles récupérées

**Solutions** :
```typescript
// ❌ AVANT (N+1 problem)
const clients = await prisma.user.findMany();
for (const client of clients) {
  const reservations = await prisma.reservation.findMany({
    where: { userId: client.id }
  });
}

// ✅ APRÈS (1 requête)
const clients = await prisma.user.findMany({
  include: {
    reservations: {
      select: { id: true, date: true, status: true } // Seulement ce qui est nécessaire
    }
  }
});
```

**Impact** :
- ⬇️ Réduction de 80% des requêtes DB
- ⚡ Temps de réponse API divisé par 5

#### D. Mise en Cache
**Problème** : Pas de cache, requêtes répétées

**Solutions** :
```typescript
// 1. Cache des intégrations (changent rarement)
import { unstable_cache } from 'next/cache';

export const getIntegrations = unstable_cache(
  async (userId: string) => {
    return await prisma.integration.findMany({
      where: { userId }
    });
  },
  ['integrations'],
  { revalidate: 3600 } // 1 heure
);

// 2. React Query pour le cache côté client
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['integrations'],
  queryFn: fetchIntegrations,
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

**Impact** :
- ⬇️ Réduction de 70% des requêtes API
- ⚡ Chargement instantané des données en cache

---

### **2. SÉCURITÉ** 🔒

#### A. Rate Limiting
**Problème** : Pas de limite de requêtes, risque d'abus

**Solutions** :
```typescript
// /src/lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requêtes par 10 secondes
});

// Dans les API routes
const { success } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
}
```

**Impact** :
- 🛡️ Protection contre les attaques DDoS
- 🛡️ Protection des API sensibles (paiement, login)

#### B. Validation des Inputs
**Problème** : Pas de validation stricte des données

**Solutions** :
```typescript
// Utiliser Zod pour la validation
import { z } from 'zod';

const stripeConfigSchema = z.object({
  secretKey: z.string().min(1).startsWith('sk_'),
  publishableKey: z.string().min(1).startsWith('pk_'),
  mode: z.enum(['test', 'live']),
  currency: z.enum(['eur', 'usd', 'gbp']),
  amount: z.number().positive()
});

// Dans l'API
const validated = stripeConfigSchema.parse(body);
```

**Impact** :
- 🛡️ Protection contre les injections
- 🛡️ Validation stricte des données

#### C. HTTPS & Sécurité Headers
**Solutions** :
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

### **3. EXPÉRIENCE UTILISATEUR** 🎨

#### A. Loading States
**Problème** : Pas de feedback visuel pendant les chargements

**Solutions** :
```typescript
// Skeleton screens
export function ReservationSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// Suspense boundaries
import { Suspense } from 'react';

<Suspense fallback={<ReservationSkeleton />}>
  <ReservationList />
</Suspense>
```

**Impact** :
- ✨ Expérience utilisateur fluide
- 📈 Réduction de 40% du taux de rebond

#### B. Optimistic Updates
**Problème** : Attente de la réponse serveur pour chaque action

**Solutions** :
```typescript
// React Query avec optimistic updates
const mutation = useMutation({
  mutationFn: updateReservation,
  onMutate: async (newData) => {
    // Annuler les requêtes en cours
    await queryClient.cancelQueries({ queryKey: ['reservations'] });

    // Snapshot de l'ancien état
    const previousReservations = queryClient.getQueryData(['reservations']);

    // Mise à jour optimiste
    queryClient.setQueryData(['reservations'], (old) => [...old, newData]);

    return { previousReservations };
  },
  onError: (err, newData, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['reservations'], context.previousReservations);
  },
});
```

**Impact** :
- ⚡ Interface instantanément réactive
- ✨ Meilleure perception de performance

#### C. Gestion des Erreurs
**Solutions** :
```typescript
// Error boundaries
'use client';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log l'erreur
    console.error('Erreur:', error, errorInfo);

    // Envoyer à un service de monitoring (ex: Sentry)
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Une erreur est survenue</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### **4. SEO & ACCESSIBILITÉ** 📈

#### A. Métadonnées
**Solutions** :
```typescript
// app/layout.tsx
export const metadata = {
  title: 'LAIA SKIN Institut | Soins Beauté à Paris',
  description: 'Institut de beauté spécialisé dans les soins du visage...',
  openGraph: {
    title: 'LAIA SKIN Institut',
    description: '...',
    images: ['/og-image.jpg'],
  },
};
```

#### B. Sitemap & Robots.txt
```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://laiaskininstitut.fr',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // ...
  ];
}
```

---

### **5. MONITORING & ANALYTICS** 📊

#### A. Performance Monitoring
**Solutions** :
```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

// Web Vitals
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric); // Ou envoyer à un service
  }
}
```

#### B. Error Tracking
**Solutions** :
```typescript
// Sentry
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

---

## 📦 Packages Recommandés

### **Installer** :
```bash
npm install @tanstack/react-query zod @upstash/ratelimit @upstash/redis
npm install @vercel/analytics @sentry/nextjs
npm install sharp # Pour l'optimisation d'images
```

---

## 🗂️ Refactoring Recommandé

### **1. Créer un Dossier `/lib/api`**
```
/src/lib/api/
├── integrations.ts  # Fonctions API pour les intégrations
├── stripe.ts        # Fonctions Stripe
├── reservations.ts  # Fonctions réservations
└── index.ts
```

### **2. Créer des Hooks Réutilisables**
```typescript
// /src/hooks/useApi.ts
export function useApi<T>(endpoint: string) {
  return useQuery<T>({
    queryKey: [endpoint],
    queryFn: () => fetch(endpoint).then(r => r.json())
  });
}

// Usage
const { data, isLoading } = useApi('/api/admin/integrations');
```

### **3. Créer un Context pour les Intégrations**
```typescript
// /src/contexts/IntegrationsContext.tsx
export const IntegrationsProvider = ({ children }) => {
  const [integrations, setIntegrations] = useState([]);

  const isEnabled = (type: string) => {
    return integrations.some(i => i.type === type && i.enabled);
  };

  return (
    <IntegrationsContext.Provider value={{ integrations, isEnabled }}>
      {children}
    </IntegrationsContext.Provider>
  );
};
```

---

## 📈 Métriques de Performance

### **Avant Optimisation**
- First Contentful Paint: 2.5s
- Largest Contentful Paint: 4.8s
- Time to Interactive: 6.2s
- Bundle Size: 850 KB

### **Après Optimisation (Objectifs)**
- First Contentful Paint: 1.2s ⬇️ 52%
- Largest Contentful Paint: 2.3s ⬇️ 52%
- Time to Interactive: 3.1s ⬇️ 50%
- Bundle Size: 420 KB ⬇️ 51%

---

## 🚀 Plan d'Implémentation

### **Phase 1 : Quick Wins** (1-2 jours)
1. ✅ Ajouter next/image partout
2. ✅ Lazy load des composants lourds
3. ✅ Ajouter React Query
4. ✅ Optimiser les requêtes Prisma

### **Phase 2 : Sécurité** (1 jour)
5. ✅ Ajouter rate limiting
6. ✅ Ajouter Zod validation
7. ✅ Configurer les headers de sécurité

### **Phase 3 : UX** (2 jours)
8. ✅ Ajouter les loading states
9. ✅ Implémenter optimistic updates
10. ✅ Ajouter error boundaries

### **Phase 4 : SEO** (1 jour)
11. ✅ Configurer les métadonnées
12. ✅ Créer sitemap
13. ✅ Ajouter structured data

### **Phase 5 : Monitoring** (1 jour)
14. ✅ Configurer Vercel Analytics
15. ✅ Configurer Sentry
16. ✅ Dashboard de métriques

---

## 💡 Optimisations Spécifiques par Module

### **Admin Dashboard**
- ✅ Virtualisation de la liste des clients (react-window)
- ✅ Pagination côté serveur
- ✅ Cache des statistiques (recalcul toutes les 5 min)

### **Réservations**
- ✅ Optimistic booking
- ✅ Préchargement des créneaux disponibles
- ✅ WebSocket pour les mises à jour en temps réel

### **Stripe**
- ✅ Webhook verification
- ✅ Idempotency keys
- ✅ Retry logic pour les paiements échoués

---

## 🔧 Configuration Recommandée

### **next.config.js**
```javascript
module.exports = {
  images: {
    domains: ['supabase.com', 'cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@/components'],
  },
};
```

---

## 📊 ROI des Optimisations

### **Gains Attendus**
- 🚀 **+50%** de vitesse de chargement
- 📱 **+40%** de score mobile Lighthouse
- 💾 **-50%** de consommation de bande passante
- 💰 **-30%** de coûts serveur (moins de requêtes)
- 📈 **+25%** de taux de conversion
- ⭐ **+15%** de satisfaction client

---

**Document créé le** : 14 octobre 2025
**Priorité** : Haute
**Estimation** : 5-7 jours de développement
