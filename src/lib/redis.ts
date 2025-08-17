// Conditional Redis service to prevent build errors if not configured
let redisClient: unknown = null;
let redisInitialized = false;

const initializeRedis = async () => {
  if (redisInitialized) return redisClient;
  
  if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    console.log('Redis not configured - caching and rate limiting disabled');
    redisInitialized = true;
    return null;
  }

  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Use Upstash Redis
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } else if (process.env.REDIS_URL) {
      // Use regular Redis (Railway)
      const Redis = await import('ioredis');
      redisClient = new Redis.default(process.env.REDIS_URL);
    }
    
    redisInitialized = true;
    console.log('Redis service initialized');
    return redisClient;
  } catch (error) {
    console.warn('Failed to initialize Redis:', error);
    redisInitialized = true;
    return null;
  }
};

// Cache utilities
export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  private async getRedisClient() {
    return await initializeRedis();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await this.getRedisClient();
    if (!redis) return null;

    try {
      const value = await redis.get(key);
      return value as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    const redis = await this.getRedisClient();
    if (!redis) return false;

    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    const redis = await this.getRedisClient();
    if (!redis) return false;

    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const redis = await this.getRedisClient();
    if (!redis) return false;

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Leaderboard operations
  async addToLeaderboard(leaderboard: string, userId: string, score: number): Promise<boolean> {
    const redis = await this.getRedisClient();
    if (!redis) return false;

    try {
      await redis.zadd(leaderboard, { score, member: userId });
      return true;
    } catch (error) {
      console.error('Redis ZADD error:', error);
      return false;
    }
  }

  async getLeaderboard(
    leaderboard: string,
    start = 0,
    end = 9
  ): Promise<Array<{ member: string; score: number }> | null> {
    const redis = await this.getRedisClient();
    if (!redis) return null;

    try {
      const results = await redis.zrange(leaderboard, start, end, {
        withScores: true,
        rev: true, // This makes it equivalent to zrevrange
      });

      // Parse results into readable format
      const leaderboardData: Array<{ member: string; score: number }> = [];
      for (let i = 0; i < results.length; i += 2) {
        leaderboardData.push({
          member: results[i] as string,
          score: results[i + 1] as number,
        });
      }

      return leaderboardData;
    } catch (error) {
      console.error('Redis ZRANGE error:', error);
      return null;
    }
  }

  // Rate limiting
  async incrementRateLimit(
    key: string,
    windowSeconds: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const redis = await this.getRedisClient();
    if (!redis) return { allowed: true, remaining: maxRequests };

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, maxRequests - current);
      const allowed = current <= maxRequests;

      return { allowed, remaining };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }
}

export const cache = CacheService.getInstance();
