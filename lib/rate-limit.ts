type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  maxBuckets?: number;
  now?: () => number;
  windowMs: number;
};

export const MAX_RATE_LIMIT_BUCKETS = 10_000;

const buckets = new Map<string, RateLimitState>();

export function pruneExpiredRateLimitBuckets(now = Date.now()) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  {
    limit,
    maxBuckets = MAX_RATE_LIMIT_BUCKETS,
    now = Date.now,
    windowMs,
  }: RateLimitOptions,
) {
  const currentTime = now();
  pruneExpiredRateLimitBuckets(currentTime);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= currentTime) {
    if (buckets.size >= maxBuckets) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: currentTime + windowMs,
        retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
      };
    }

    const resetAt = currentTime + windowMs;
    buckets.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - currentTime) / 1000),
      ),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    limit,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

export function clearRateLimitBuckets() {
  buckets.clear();
}

export function getRateLimitBucketCount() {
  return buckets.size;
}
