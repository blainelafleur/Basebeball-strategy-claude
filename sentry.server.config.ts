import * as Sentry from '@sentry/nextjs';
import { config } from '@/lib/config';

if (config.sentry.dsn && config.isProduction) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.isProduction ? 'production' : 'development',

    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions

    // Error Filtering for server-side
    beforeSend(event) {
      if (!config.isProduction) {
        return null;
      }

      // Filter out common server errors that aren't actionable
      const ignoredErrors = ['ECONNRESET', 'EPIPE', 'ENOTFOUND', 'Request timeout'];

      if (event.exception?.values?.[0]?.value) {
        const errorMessage = event.exception.values[0].value;
        if (ignoredErrors.some((ignored) => errorMessage.includes(ignored))) {
          return null;
        }
      }

      return event;
    },

    // Server-specific configuration
    debug: false,

    // Tag all events with server context
    initialScope: {
      tags: {
        component: 'server',
      },
    },
  });
}
