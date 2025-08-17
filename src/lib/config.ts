// Production configuration
export const config = {
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // App
  appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  port: process.env.PORT || 3000,
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  
  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  
  // Payments
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  
  // AI Services
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  
  // File Storage
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'baseball-strategy-assets',
  },
  
  // Email
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@baseballstrategy.com',
  },
  
  // Monitoring
  sentry: {
    dsn: process.env.SENTRY_DSN,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  
  // Analytics
  posthog: {
    key: process.env.POSTHOG_KEY,
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },
  
  // Rate Limiting
  upstash: {
    redisUrl: process.env.UPSTASH_REDIS_REST_URL,
    redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING !== 'false',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    enableFileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'OPENAI_API_KEY',
] as const;

if (config.isProduction) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}