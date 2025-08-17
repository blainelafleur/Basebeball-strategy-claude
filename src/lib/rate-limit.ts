import { NextRequest, NextResponse } from 'next/server';
import { cache } from './redis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.getClientIdentifier(req),
      ...config,
    };
  }

  private getClientIdentifier(req: NextRequest): string {
    // Try to get IP from various headers (for deployment behind proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    let ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
    
    // Clean up the IP
    ip = ip.trim();
    
    // For local development
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = 'localhost';
    }
    
    return ip;
  }

  async checkRateLimit(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    headers: Record<string, string>;
  }> {
    const key = this.config.keyGenerator!(req);
    const rateLimitKey = `rate_limit:${key}`;
    const windowSeconds = Math.floor(this.config.windowMs / 1000);
    
    const result = await cache.incrementRateLimit(
      rateLimitKey,
      windowSeconds,
      this.config.maxRequests
    );
    
    const resetTime = Date.now() + this.config.windowMs;
    
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime,
      headers: {
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      },
    };
  }

  async middleware(req: NextRequest): Promise<NextResponse | null> {
    const result = await this.checkRateLimit(req);
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(this.config.windowMs / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            ...result.headers,
            'Retry-After': Math.ceil(this.config.windowMs / 1000).toString(),
          },
        }
      );
    }
    
    // Rate limit passed, continue with headers
    return NextResponse.next({
      headers: result.headers,
    });
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const gameRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 game actions per minute
});

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 uploads per minute
});

// Utility function to apply rate limiting to API routes
export function withRateLimit(rateLimiter: RateLimiter) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const rateLimitResult = await rateLimiter.middleware(req);
    
    if (rateLimitResult && rateLimitResult.status === 429) {
      return rateLimitResult;
    }
    
    const response = await handler(req);
    
    // Add rate limit headers to successful responses
    if (rateLimitResult) {
      const headers = new Headers(response.headers);
      Object.entries(rateLimitResult.headers || {}).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    
    return response;
  };
}