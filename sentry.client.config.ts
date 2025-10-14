import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taux d'échantillonnage des traces de performance (100% = tout tracker)
  tracesSampleRate: 1.0,

  // Désactiver en développement (seulement actif en production)
  enabled: process.env.NODE_ENV === "production",

  // Configuration pour ignorer certaines erreurs
  beforeSend(event, hint) {
    // Ignorer les erreurs de navigation annulées (Next.js)
    if (event.exception?.values?.[0]?.value?.includes('NEXT_REDIRECT')) {
      return null;
    }

    // Ignorer les erreurs de navigation
    if (event.exception?.values?.[0]?.value?.includes('Navigation')) {
      return null;
    }

    return event;
  },

  // Capturer 100% des sessions pour le replay
  replaysSessionSampleRate: 0.1, // 10% des sessions normales
  replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
});
