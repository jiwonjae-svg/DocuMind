import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, clearRateLimitBuckets } from "../lib/rate-limit";

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
});
