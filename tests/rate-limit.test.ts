import { beforeEach, describe, expect, it } from "vitest";
import {
  AI_ANSWER_RATE_LIMIT,
  AI_ANSWER_RATE_LIMIT_ERROR,
  AI_SEARCH_RATE_LIMIT,
  AI_SEARCH_RATE_LIMIT_ERROR,
  buildAiAnswerRateLimitResponseInit,
  buildAiSearchRateLimitResponseInit,
  checkAiAnswerRateLimit,
  checkAiSearchRateLimit,
} from "../lib/api/ai-rate-limit";
import {
  DOCUMENT_DELETE_RATE_LIMIT,
  DOCUMENT_DELETE_RATE_LIMIT_ERROR,
  checkDocumentDeleteRateLimit,
} from "../lib/api/document-delete-rate-limit";
import {
  DOCUMENT_UPLOAD_RATE_LIMIT,
  DOCUMENT_UPLOAD_RATE_LIMIT_ERROR,
  checkDocumentUploadRateLimit,
} from "../lib/api/upload-rate-limit";
import {
  checkRateLimit,
  clearRateLimitBuckets,
  getRateLimitBucketCount,
  MAX_RATE_LIMIT_BUCKETS,
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

  it("denies new buckets when the active bucket cap is reached", () => {
    const now = () => 1000;

    expect(
      checkRateLimit("user-1", {
        limit: 1,
        maxBuckets: 2,
        now,
        windowMs: 60_000,
      }).allowed,
    ).toBe(true);
    expect(
      checkRateLimit("user-2", {
        limit: 1,
        maxBuckets: 2,
        now,
        windowMs: 60_000,
      }).allowed,
    ).toBe(true);

    const rateLimit = checkRateLimit("user-3", {
      limit: 1,
      maxBuckets: 2,
      now,
      windowMs: 60_000,
    });

    expect(rateLimit).toEqual({
      allowed: false,
      limit: 1,
      remaining: 0,
      resetAt: 61_000,
      retryAfterSeconds: 60,
    });
    expect(getRateLimitBucketCount()).toBe(2);
    expect(MAX_RATE_LIMIT_BUCKETS).toBeGreaterThan(2);
  });

  it("continues to evaluate existing buckets when the active bucket cap is reached", () => {
    const now = () => 1000;

    checkRateLimit("user-1", {
      limit: 2,
      maxBuckets: 1,
      now,
      windowMs: 60_000,
    });

    const rateLimit = checkRateLimit("user-1", {
      limit: 2,
      maxBuckets: 1,
      now,
      windowMs: 60_000,
    });

    expect(rateLimit.allowed).toBe(true);
    expect(rateLimit.remaining).toBe(0);
    expect(getRateLimitBucketCount()).toBe(1);
  });

  it("shares the AI answer quota across answer-generating endpoints", () => {
    const now = () => 1000;

    for (let index = 0; index < AI_ANSWER_RATE_LIMIT; index += 1) {
      expect(checkAiAnswerRateLimit("user-1", { now }).allowed).toBe(true);
    }

    expect(checkAiAnswerRateLimit("user-1", { now }).allowed).toBe(false);
  });

  it("builds a retry response for limited AI answer requests", () => {
    const now = () => 1000;

    for (let index = 0; index < AI_ANSWER_RATE_LIMIT; index += 1) {
      checkAiAnswerRateLimit("user-1", { now });
    }

    const rateLimit = checkAiAnswerRateLimit("user-1", { now });
    const responseInit = buildAiAnswerRateLimitResponseInit(rateLimit);

    expect(AI_ANSWER_RATE_LIMIT_ERROR).toBe(
      "Too many answer requests. Try again shortly.",
    );
    expect(responseInit).toEqual({
      headers: {
        "Retry-After": "60",
      },
      status: 429,
    });
  });

  it("shares the AI search quota across search endpoints", () => {
    const now = () => 1000;

    for (let index = 0; index < AI_SEARCH_RATE_LIMIT; index += 1) {
      expect(checkAiSearchRateLimit("user-1", { now }).allowed).toBe(true);
    }

    const rateLimit = checkAiSearchRateLimit("user-1", { now });
    const responseInit = buildAiSearchRateLimitResponseInit(rateLimit);

    expect(rateLimit.allowed).toBe(false);
    expect(AI_SEARCH_RATE_LIMIT_ERROR).toBe(
      "Too many search requests. Try again shortly.",
    );
    expect(responseInit).toEqual({
      headers: {
        "Retry-After": "60",
      },
      status: 429,
    });
  });

  it("limits document uploads per signed-in user before expensive parsing", () => {
    const now = () => 1000;

    for (let index = 0; index < DOCUMENT_UPLOAD_RATE_LIMIT; index += 1) {
      expect(checkDocumentUploadRateLimit("user-1", { now }).allowed).toBe(
        true,
      );
    }

    const rateLimit = checkDocumentUploadRateLimit("user-1", { now });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(60);
    expect(DOCUMENT_UPLOAD_RATE_LIMIT_ERROR).toBe(
      "Too many document uploads. Try again shortly.",
    );
  });

  it("limits document deletes per signed-in user before delete lookup", () => {
    const now = () => 1000;

    for (let index = 0; index < DOCUMENT_DELETE_RATE_LIMIT; index += 1) {
      expect(checkDocumentDeleteRateLimit("user-1", { now }).allowed).toBe(
        true,
      );
    }

    const rateLimit = checkDocumentDeleteRateLimit("user-1", { now });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(60);
    expect(DOCUMENT_DELETE_RATE_LIMIT_ERROR).toBe(
      "Too many document delete requests. Try again shortly.",
    );
  });
});
