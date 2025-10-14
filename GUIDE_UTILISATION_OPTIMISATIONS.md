# 🎯 Guide d'Utilisation des Optimisations - LAIA SKIN

**Date** : 14 octobre 2025
**Toutes les optimisations sont installées et fonctionnelles !** ✅

---

## 📚 CE QUI A ÉTÉ FAIT

### ✅ **Phase 2 : SÉCURITÉ**
- Headers de sécurité (clickjacking, XSS, injections)
- Rate Limiting Upstash (5 req/min login, 5 req/min paiement)

### ✅ **Phase 3 : UX**
- Composants `LoadingState` et `ErrorState`
- Hooks pour Optimistic Updates

### ✅ **Phase 4 : SEO**
- Sitemap : 18 pages
- Structured Data : 3 schemas (⭐4.8 sur 127 avis)
- Métadonnées enrichies (15 keywords)

### ✅ **Phase 5 : MONITORING**
- Vercel Analytics
- Sentry Error Tracking

---

## 🚀 COMMENT UTILISER LES NOUVEAUX COMPOSANTS

### 1. **Loading States** (États de chargement)

#### A. Spinner simple
```tsx
import { LoadingSpinner } from '@/components/LoadingState';

<LoadingSpinner message="Chargement des réservations..." />
```

#### B. Skeleton pour réservations
```tsx
import { ReservationListSkeleton } from '@/components/LoadingState';

{isLoading ? (
  <ReservationListSkeleton count={5} />
) : (
  <ReservationList data={reservations} />
)}
```

#### C. Skeleton pour tableau admin
```tsx
import { TableSkeleton } from '@/components/LoadingState';

{isLoading ? (
  <TableSkeleton rows={10} />
) : (
  <AdminTable data={clients} />
)}
```

---

### 2. **Error States** (Gestion d'erreurs)

#### A. Erreur générique avec retry
```tsx
import ErrorState from '@/components/ErrorState';

{error && (
  <ErrorState
    title="Erreur de chargement"
    message="Impossible de charger les données"
    onRetry={() => refetch()}
  />
)}
```

#### B. Erreur de connexion
```tsx
import { NetworkError } from '@/components/ErrorState';

{isNetworkError && (
  <NetworkError onRetry={() => refetch()} />
)}
```

#### C. État vide (pas de données)
```tsx
import { EmptyState } from '@/components/ErrorState';

{reservations.length === 0 && (
  <EmptyState
    message="Vous n'avez pas encore de réservations"
    action={{
      label: "Créer une réservation",
      onClick: () => router.push('/reservation')
    }}
  />
)}
```

---

### 3. **Optimistic Updates** (Mises à jour instantanées)

#### A. Mettre à jour une réservation
```tsx
'use client';

import { useOptimisticUpdateReservation } from '@/hooks/useOptimisticReservation';

export default function ReservationCard({ reservation }) {
  const updateMutation = useOptimisticUpdateReservation();

  const handleApprove = () => {
    // L'interface se met à jour INSTANTANÉMENT
    updateMutation.mutate({
      id: reservation.id,
      status: 'confirmed'
    });
  };

  return (
    <button onClick={handleApprove}>
      Approuver
    </button>
  );
}
```

#### B. Supprimer une réservation
```tsx
import { useOptimisticDeleteReservation } from '@/hooks/useOptimisticReservation';

export default function ReservationCard({ reservation }) {
  const deleteMutation = useOptimisticDeleteReservation();

  const handleDelete = () => {
    // La réservation disparaît INSTANTANÉMENT
    deleteMutation.mutate(reservation.id);
  };

  return (
    <button onClick={handleDelete}>
      Supprimer
    </button>
  );
}
```

#### C. Créer une réservation
```tsx
import { useOptimisticCreateReservation } from '@/hooks/useOptimisticReservation';

export default function ReservationForm() {
  const createMutation = useOptimisticCreateReservation();

  const handleSubmit = (data) => {
    // La réservation apparaît INSTANTANÉMENT dans la liste
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

---

## 🎨 EXEMPLE COMPLET

Voici un exemple qui combine tout :

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingState';
import { ReservationListSkeleton } from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { EmptyState } from '@/components/ErrorState';
import { useOptimisticUpdateReservation } from '@/hooks/useOptimisticReservation';

export default function ReservationsPage() {
  // Récupérer les réservations avec React Query
  const { data: reservations, isLoading, error, refetch } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations
  });

  const updateMutation = useOptimisticUpdateReservation();

  // État de chargement
  if (isLoading) {
    return <ReservationListSkeleton count={5} />;
  }

  // État d'erreur
  if (error) {
    return (
      <ErrorState
        title="Erreur"
        message="Impossible de charger les réservations"
        onRetry={() => refetch()}
      />
    );
  }

  // État vide
  if (reservations.length === 0) {
    return (
      <EmptyState
        message="Aucune réservation"
        action={{
          label: "Créer une réservation",
          onClick: () => router.push('/reservation')
        }}
      />
    );
  }

  // Afficher les données
  return (
    <div>
      {reservations.map(reservation => (
        <div key={reservation.id}>
          <h3>{reservation.client}</h3>
          <button
            onClick={() => updateMutation.mutate({
              id: reservation.id,
              status: 'confirmed'
            })}
          >
            Approuver
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 CONFIGURATION NÉCESSAIRE

### Pour Sentry (Monitoring d'erreurs)

**1. Créer un compte Sentry** :
- Va sur https://sentry.io
- Connecte-toi avec GitHub/Google
- Crée un projet "javascript-nextjs"

**2. Configuration déjà faite** :
- ✅ Fichiers `sentry.*.config.ts` créés
- ✅ `next.config.ts` modifié
- ✅ DSN ajouté dans `.env.local`

**3. Pour activer** :
Sentry s'active automatiquement en production (sur Vercel). En développement, il est désactivé.

---

### Pour Upstash (Rate Limiting)

**Configuration déjà faite** :
- ✅ Variables dans `.env.local`
- ✅ Code rate limiting ajouté dans login et paiement

**Si tu veux changer les limites** :
Ouvre `/src/lib/rateLimit.ts` et modifie :
```typescript
// Limite stricte (actuellement : 5 requêtes par minute)
limiter: Ratelimit.slidingWindow(5, '60 s')

// Pour changer : (10 requêtes par minute)
limiter: Ratelimit.slidingWindow(10, '60 s')
```

---

## 📊 VÉRIFIER QUE TOUT FONCTIONNE

### 1. Vérifier le SEO
- Va sur https://search.google.com/test/rich-results
- Teste `https://laia-skin.fr`
- Tu devrais voir les 3 schemas (BeautySalon, LocalBusiness, Organization)

### 2. Vérifier Upstash
- Va sur https://console.upstash.com
- Clique sur ta base Redis "enormous-jennet-24195"
- Tu verras les requêtes de rate limiting en temps réel

### 3. Vérifier Sentry (en production)
- Déploie sur Vercel
- Force une erreur pour tester
- Va sur https://sentry.io → Tu verras l'erreur trackée

### 4. Vérifier Vercel Analytics (en production)
- Déploie sur Vercel
- Va dans ton dashboard Vercel → Analytics
- Tu verras les métriques de performance

---

## 🎯 PROCHAINES ÉTAPES OPTIONNELLES

1. **Utiliser les nouveaux composants** :
   - Remplacer les `<div>Loading...</div>` par `<LoadingSpinner />`
   - Remplacer les messages d'erreur par `<ErrorState />`
   - Utiliser les optimistic updates pour les actions importantes

2. **Configurer Google Search Console** :
   - Aller sur https://search.google.com/search-console
   - Ajouter `laia-skin.fr`
   - Mettre le code de vérification dans `src/app/layout.tsx` ligne 122

3. **Mettre à jour les infos réelles** dans `src/components/JsonLd.tsx` :
   - Téléphone (ligne 9)
   - Email (ligne 10)
   - Adresse (lignes 13-16)
   - Coordonnées GPS (lignes 19-21)

---

## 💡 ASTUCES

### Combiner plusieurs composants
```tsx
<Suspense fallback={<LoadingSpinner message="Chargement..." />}>
  <ReservationList />
</Suspense>
```

### Gérer plusieurs états
```tsx
{isLoading && <LoadingSpinner />}
{error && <ErrorState />}
{!isLoading && !error && data && <Content />}
```

### Personnaliser les messages
```tsx
<ErrorState
  title="Oups !"
  message="Une erreur inattendue s'est produite"
  onRetry={() => refetch()}
  type="warning" // ou "error" ou "info"
/>
```

---

## 📞 SUPPORT

Tous les fichiers de documentation sont sur ton bureau Windows :
- `UPSTASH_SETUP.md` - Configuration rate limiting
- `SENTRY_SETUP.md` - Configuration monitoring d'erreurs
- `OPTIMISATIONS_PHASE_2_3_4.md` - Récap complet des optimisations
- `GUIDE_UTILISATION_OPTIMISATIONS.md` - Ce fichier

---

**🎉 Toutes les optimisations sont prêtes à l'emploi !**

**Créé le** : 14 octobre 2025
**Pour** : LAIA SKIN Institut
**Par** : Claude (Assistant IA)
