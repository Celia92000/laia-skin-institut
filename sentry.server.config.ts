import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taux d'échantillonnage des traces de performance
  tracesSampleRate: 1.0,

  // Désactiver en développement (seulement actif en production)
  enabled: process.env.NODE_ENV === "production",

  // Configuration pour ignorer certaines erreurs
  beforeSend(event) {
    // Ignorer les erreurs de navigation Next.js
    if (event.exception?.values?.[0]?.value?.includes('NEXT_REDIRECT')) {
      return null;
    }

    return event;
  },
});
