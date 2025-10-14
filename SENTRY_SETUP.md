# 🔍 Configuration Sentry (Monitoring d'Erreurs - Gratuit)

## C'est quoi Sentry ?

Un service **gratuit** qui détecte et te signale toutes les erreurs qui surviennent sur ton site en production.

**Plan gratuit** : 5 000 erreurs par mois (largement suffisant !)

---

## 📝 Étapes de configuration (5 minutes)

### 1. Créer un compte Sentry

1. Va sur https://sentry.io
2. Clique sur **"Get Started"** (gratuit)
3. Connecte-toi avec GitHub ou Google

### 2. Créer un projet

1. Dans le dashboard, clique sur **"Create Project"**
2. Choisis :
   - **Platform** : **Next.js**
   - **Project name** : `laia-skin-institut`
   - **Team** : Default
3. Clique sur **"Create Project"**

### 3. Récupérer le DSN

Après la création, Sentry te donnera un **DSN** (Data Source Name) qui ressemble à :

```
https://abc123def456@o123456.ingest.sentry.io/789012
```

**Copie ce DSN**, tu en auras besoin !

### 4. Ajouter le DSN dans `.env.local`

Ouvre ton fichier `.env.local` et ajoute :

```env
# Sentry Error Tracking (gratuit jusqu'à 5000 erreurs/mois)
NEXT_PUBLIC_SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/789012"
```

**⚠️ Important** : Remplace par ton vrai DSN copié depuis Sentry !

### 5. Configurer Sentry dans le projet

#### a) Créer `sentry.client.config.ts`

```bash
# Dans le terminal
touch sentry.client.config.ts
```

Contenu du fichier :

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taux d'échantillonnage des traces de performance (100% = tout tracker)
  tracesSampleRate: 1.0,

  // Désactiver en développement
  enabled: process.env.NODE_ENV === "production",

  // Configuration des erreurs
  beforeSend(event, hint) {
    // Ignorer les erreurs de navigation annulées (Next.js)
    if (event.exception?.values?.[0]?.value?.includes('NEXT_REDIRECT')) {
      return null;
    }
    return event;
  },
});
```

#### b) Créer `sentry.server.config.ts`

```bash
# Dans le terminal
touch sentry.server.config.ts
```

Contenu du fichier :

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});
```

#### c) Créer `sentry.edge.config.ts`

```bash
# Dans le terminal
touch sentry.edge.config.ts
```

Contenu du fichier :

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});
```

### 6. Redémarrer le serveur

```bash
# Arrête le serveur (Ctrl+C)
# Puis relance :
npm run dev
```

---

## ✅ Vérification

Si tout fonctionne, Sentry va :
- ✅ Tracker toutes les erreurs en production
- ✅ T'envoyer un email quand une erreur survient
- ✅ Te montrer la stack trace complète
- ✅ Te dire quel navigateur, quel OS, quelle page

---

## 🎯 Ce que Sentry va tracker

### Erreurs automatiques :
- Erreurs JavaScript non gérées
- Promesses rejetées
- Erreurs de réseau
- Erreurs d'API
- Erreurs de composants React

### Exemple d'erreur trackée :

```
❌ TypeError: Cannot read property 'name' of undefined
   at ReservationCard (app/admin/page.tsx:145:23)
   Browser: Chrome 120.0
   OS: Windows 11
   User: admin@laiaskin.com
   Page: /admin
   Date: 14 oct 2025 15:32
```

---

## 🚀 Utilisation avancée (optionnel)

### Tracker manuellement une erreur :

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Code qui peut échouer
  await deleteReservation(id);
} catch (error) {
  // Envoyer l'erreur à Sentry avec contexte
  Sentry.captureException(error, {
    tags: {
      section: "reservations",
      action: "delete"
    },
    extra: {
      reservationId: id,
      userId: currentUser.id
    }
  });

  // Afficher le message d'erreur à l'utilisateur
  toast.error("Impossible de supprimer la réservation");
}
```

### Suivre un utilisateur :

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name
});
```

---

## 💰 Coûts

- **Gratuit** : 5 000 erreurs/mois
- Si tu dépasses : **29$ pour 50 000 erreurs/mois** (mais très improbable)

Pour un site comme le tien, **tu resteras largement dans le plan gratuit** !

---

## ⚠️ Si tu ne configures pas Sentry

Pas de panique ! Le site fonctionne quand même :
- Sentry sera **désactivé** en développement (normal)
- **Le site continue de fonctionner normalement**

Mais c'est **fortement recommandé** de l'activer pour détecter les bugs en production.

---

## 📊 Dashboard Sentry

Une fois configuré, tu pourras voir :
- **Issues** : Liste des erreurs groupées par type
- **Performance** : Temps de chargement des pages
- **Releases** : Tracking des déploiements
- **Alerts** : Notifications par email/Slack

**URL** : https://sentry.io/organizations/ton-org/issues/

---

## 🔧 Troubleshooting

### Sentry ne capture pas d'erreurs ?

1. Vérifie que `NEXT_PUBLIC_SENTRY_DSN` est bien dans `.env.local`
2. Vérifie que tu es en **production** (`process.env.NODE_ENV === "production"`)
3. Force une erreur pour tester :

```typescript
// Dans n'importe quel composant client
'use client';

export default function TestError() {
  return (
    <button onClick={() => {
      throw new Error("Test Sentry");
    }}>
      Déclencher une erreur de test
    </button>
  );
}
```

---

**Créé le** : 14 octobre 2025
**Pour** : LAIA SKIN Institut
