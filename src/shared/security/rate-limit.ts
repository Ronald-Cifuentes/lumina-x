import { sql } from 'drizzle-orm';
import type { Database } from '@/db/client';
import { rateLimits } from '@/db/schema';

export type RateLimitRule = { key: string; limit: number; windowMs: number };

export type RateLimitDecision = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window counter stored in SQLite. A single UPSERT increments the
 * counter or starts a new window atomically, so concurrent requests cannot
 * both read a stale count.
 */
export const consumeRateLimit = async (
  db: Database,
  { key, limit, windowMs }: RateLimitRule,
  now = Date.now(),
): Promise<RateLimitDecision> => {
  const expiredBefore = now - windowMs;
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.windowStartedAt} <= ${expiredBefore} THEN 1 ELSE ${rateLimits.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${rateLimits.windowStartedAt} <= ${expiredBefore} THEN ${now} ELSE ${rateLimits.windowStartedAt} END`,
      },
    })
    .returning({ count: rateLimits.count, windowStartedAt: rateLimits.windowStartedAt });

  const used = row?.count ?? limit + 1;
  const windowStartedAt = row?.windowStartedAt ?? now;
  const allowed = used <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - used),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((windowStartedAt + windowMs - now) / 1000)),
  };
};

/** Every rule must allow the request; all counters are consumed. */
export const consumeRateLimits = async (
  db: Database,
  rules: RateLimitRule[],
  now = Date.now(),
): Promise<RateLimitDecision> => {
  const decisions = await Promise.all(rules.map((rule) => consumeRateLimit(db, rule, now)));
  const blocked = decisions.filter((decision) => !decision.allowed);
  if (blocked.length === 0) {
    return { allowed: true, remaining: Math.min(...decisions.map((d) => d.remaining)), retryAfterSeconds: 0 };
  }
  return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(...blocked.map((d) => d.retryAfterSeconds)) };
};
