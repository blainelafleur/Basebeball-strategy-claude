import * as Sentry from '@sentry/nextjs';
import { config } from '@/lib/config';

if (config.sentry.dsn && config.isProduction) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.isProduction ? 'production' : 'development',
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    
    // Error Filtering
    beforeSend(event) {
      // Filter out development errors
      if (!config.isProduction) {
        return null;
      }
      
      // Filter out known non-critical errors
      const ignoredErrors = [
        'ResizeObserver loop limit exceeded',
        'Non-Error exception captured',
        'Network request failed',
      ];
      
      if (event.exception?.values?.[0]?.value) {
        const errorMessage = event.exception.values[0].value;
        if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
          return null;
        }
      }
      
      return event;
    },
    
    // Additional configuration
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Session Replay
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  });
}