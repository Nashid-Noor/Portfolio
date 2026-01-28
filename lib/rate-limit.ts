// Rate limiter with Upstash Redis support for production
// Falls back to in-memory storage for development

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute

// Global variables for caching
let ratelimit: Ratelimit | undefined;
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Initialize Redis if env vars are present
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 m"),
    analytics: true,
  });
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address or session ID)
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  // Production: Use Upstash Redis
  if (ratelimit) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
      return {
        allowed: success,
        remaining,
        resetAt: reset,
      };
    } catch (error) {
      console.error("Rate limit error:", error);
      // Fallback to memory on error
    }
  }

  // Development / Fallback: In-memory
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  // Clean up old entries
  if (memoryStore.size > 10000) {
    const cutoff = now - WINDOW_MS;
    for (const [key, value] of memoryStore.entries()) {
      if (value.resetAt < cutoff) memoryStore.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    const newEntry = { count: 1, resetAt: now + WINDOW_MS };
    memoryStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: newEntry.resetAt,
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetAt / 1000).toString(),
  };
}
