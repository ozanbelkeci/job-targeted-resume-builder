import { CREDIT_LIMITS } from '@/lib/constants';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const entry = store.get(userId);

  if (!entry || entry.resetAt < now) {
    store.set(userId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: CREDIT_LIMITS.RATE_LIMIT_PER_MINUTE - 1 };
  }

  if (entry.count >= CREDIT_LIMITS.RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: CREDIT_LIMITS.RATE_LIMIT_PER_MINUTE - entry.count };
}
