// Simple in-memory rate limiter for demo
// TODO: Replace with Upstash Redis for production

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address or session ID)
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up old entries periodically
  if (store.size > 10000) {
    const cutoff = now - WINDOW_MS;
    for (const [key, value] of store.entries()) {
      if (value.resetAt < cutoff) {
        store.delete(key);
      }
    }
  }

  // No entry or expired entry
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    store.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment counter
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
