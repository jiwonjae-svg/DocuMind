type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  now?: () => number;
  windowMs: number;
};

const buckets = new Map<string, RateLimitState>();

export function checkRateLimit(
  key: string,
  { limit, now = Date.now, windowMs }: RateLimitOptions,
) {
  const currentTime = now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= currentTime) {
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
