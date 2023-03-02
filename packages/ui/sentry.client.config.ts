import * as Sentry from '@sentry/nextjs';

import { config } from '@ui/config/index';

const SENTRY_DSN = process.env.IS_SENTRY_ENABLED === 'true' ? process.env.SENTRY_DSN : undefined;
console.warn(config.supabasePublicKey);
console.warn(
  'client; ',
  process.env.SUPABASE_KEY,
  process.env.IS_SENTRY_ENABLED,
  process.env.SENTRY_DSN,
  SENTRY_DSN
);
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
