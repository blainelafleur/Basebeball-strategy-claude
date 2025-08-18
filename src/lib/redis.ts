// TEMPORARY: Redis service disabled for initial deployment
// TODO: Re-enable after core app is deployed and working

// Stub implementation - no Redis dependencies
export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    console.log('Redis cache disabled - returning null for key:', key);
    return null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    console.log('Redis cache disabled - would set key:', key);
    return false;
  }

  async del(key: string): Promise<boolean> {
    console.log('Redis cache disabled - would delete key:', key);
    return false;
  }

  async exists(key: string): Promise<boolean> {
    console.log('Redis cache disabled - would check exists for key:', key);
    return false;
  }

  // Leaderboard operations
  async addToLeaderboard(leaderboard: string, userId: string, score: number): Promise<boolean> {
    console.log(
      `Redis leaderboard disabled - would add ${userId} with score ${score} to ${leaderboard}`
    );
    return false;
  }

  async getLeaderboard(
    leaderboard: string,
    start = 0,
    end = 9
  ): Promise<Array<{ member: string; score: number }> | null> {
    console.log(`Redis leaderboard disabled - would get ${leaderboard} from ${start} to ${end}`);
    return null;
  }

  // Rate limiting
  async incrementRateLimit(
    key: string,
    windowSeconds: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    console.log(`Redis rate limiting disabled - would check rate limit for key: ${key}`);
    return { allowed: true, remaining: maxRequests };
  }
}

export const cache = CacheService.getInstance();
