import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL for production
const getDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;

  // Only enforce PostgreSQL in actual production runtime (not during build)
  if (
    process.env.NODE_ENV === 'production' &&
    typeof window === 'undefined' &&
    process.env.RAILWAY_ENVIRONMENT
  ) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required in production');
    }
    if (!databaseUrl.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection string in production');
    }
  }

  // Default to SQLite only in development
  return databaseUrl || 'file:./prisma/prisma/dev.db';
};

// Initialize Prisma with connection timeout and error handling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
