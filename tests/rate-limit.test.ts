import { beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clearRateLimitBuckets,
  getRateLimitBucketCount,
  pruneExpiredRateLimitBuckets,
} from "../lib/rate-limit";

describe("rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("allows requests until the limit is reached", () => {
    const now = () => 1000;

    expect(
      checkRateLimit("user-1", { limit: 2, now, windowMs: 60_000 }).allowed,
    ).toBe(true);
    expect(
      checkRateLimit("user-1", { limit: 2, now, windowMs: 60_000 }).allowed,
    ).toBe(true);
    expect(
      checkRateLimit("user-1", { limit: 2, now, windowMs: 60_000 }).allowed,
    ).toBe(false);
  });

  it("resets after the window expires", () => {
    let currentTime = 1000;
    const now = () => currentTime;

    checkRateLimit("user-1", { limit: 1, now, windowMs: 60_000 });
    expect(
      checkRateLimit("user-1", { limit: 1, now, windowMs: 60_000 }).allowed,
    ).toBe(false);

    currentTime = 61_000;

    expect(
      checkRateLimit("user-1", { limit: 1, now, windowMs: 60_000 }).allowed,
    ).toBe(true);
  });

  it("prunes expired buckets when checking a new key", () => {
    checkRateLimit("expired-user", {
      limit: 1,
      now: () => 1000,
      windowMs: 60_000,
    });
    expect(getRateLimitBucketCount()).toBe(1);

    checkRateLimit("active-user", {
      limit: 1,
      now: () => 61_000,
      windowMs: 60_000,
    });

    expect(getRateLimitBucketCount()).toBe(1);
  });

  it("keeps active buckets during pruning", () => {
    checkRateLimit("active-user", {
      limit: 1,
      now: () => 1000,
      windowMs: 60_000,
    });

    pruneExpiredRateLimitBuckets(60_999);

    expect(getRateLimitBucketCount()).toBe(1);
  });
});
