import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.IS_SENTRY_ENABLED === 'true' ? process.env.SENTRY_DSN : '';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
});
