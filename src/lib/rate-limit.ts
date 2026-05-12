/**
 * Rate Limiting Utility — AI Spend Audit
 *
 * Implements rate limiting using in-memory storage with decay.
 * For production, consider Upstash Redis or similar for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits (will reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request from the given key should be allowed.
 *
 * @param key Unique identifier (IP address, user ID, etc.)
 * @param limit Maximum number of requests allowed
 * @param windowSeconds Time window in seconds
 * @returns true if request should be allowed, false if rate limited
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowSeconds: number = 3600
): Promise<boolean> {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    // New entry or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return true;
  }

  if (entry.count < limit) {
    entry.count++;
    return true;
  }

  return false;
}

/**
 * Get remaining requests for a key
 */
export function getRateLimitStatus(
  key: string,
  limit: number = 5,
  windowSeconds: number = 3600
): { remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    return { remaining: limit, resetTime: now + windowSeconds * 1000 };
  }

  return {
    remaining: Math.max(0, limit - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a key (admin use)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
