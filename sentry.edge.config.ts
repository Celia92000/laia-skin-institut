import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taux d'échantillonnage des traces de performance
  tracesSampleRate: 1.0,

  // Désactiver en développement (seulement actif en production)
  enabled: process.env.NODE_ENV === "production",
});
