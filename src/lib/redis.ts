import { Redis } from '@upstash/redis';
import { config } from './config';

// Initialize Redis client for production caching and sessions
export const redis = config.upstash.redisUrl && config.upstash.redisToken
  ? new Redis({
      url: config.upstash.redisUrl,
      token: config.upstash.redisToken,
    })
  : null;

// Cache utilities
export class CacheService {
  private static instance: CacheService;
  private redis: Redis | null;

  private constructor() {
    this.redis = redis;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        await this.redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Leaderboard operations
  async addToLeaderboard(leaderboard: string, userId: string, score: number): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      await this.redis.zadd(leaderboard, { score, member: userId });
      return true;
    } catch (error) {
      console.error('Redis ZADD error:', error);
      return false;
    }
  }

  async getLeaderboard(leaderboard: string, start = 0, end = 9): Promise<Array<{ member: string; score: number }> | null> {
    if (!this.redis) return null;
    
    try {
      const results = await this.redis.zrevrange(leaderboard, start, end, { withScores: true });
      
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
      console.error('Redis ZREVRANGE error:', error);
      return null;
    }
  }

  // Rate limiting
  async incrementRateLimit(key: string, windowSeconds: number, maxRequests: number): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.redis) return { allowed: true, remaining: maxRequests };
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
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