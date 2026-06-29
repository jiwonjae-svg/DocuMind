import { beforeEach, describe, expect, it } from "vitest";
import {
  buildLoginAttemptRateLimitKeys,
  checkLoginAttemptRateLimit,
  LOGIN_GLOBAL_ATTEMPT_RATE_LIMIT,
  LOGIN_ATTEMPT_RATE_LIMIT,
  LOGIN_ATTEMPT_RATE_LIMIT_ERROR,
  LOGIN_ATTEMPT_RATE_LIMIT_WINDOW_MS,
  readLoginClientIdentifier,
} from "../lib/auth/login-rate-limit";
import {
  clearRateLimitBuckets,
  getRateLimitBucketCount,
} from "../lib/rate-limit";

function request(ipAddress: string) {
  const headers = new Headers({
    "x-forwarded-for": ipAddress,
  });

  return { headers } as Pick<Request, "headers">;
}

describe("credential login rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("limits repeated attempts from one client", () => {
    const now = () => 1000;
    const loginRequest = request("203.0.113.10");

    for (let index = 0; index < LOGIN_ATTEMPT_RATE_LIMIT; index += 1) {
      expect(
        checkLoginAttemptRateLimit({
          email: `demo-${index}@documind.local`,
          now,
          request: loginRequest,
        }).allowed,
      ).toBe(true);
    }

    const rateLimit = checkLoginAttemptRateLimit({
      email: "another@documind.local",
      now,
      request: loginRequest,
    });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(
      LOGIN_ATTEMPT_RATE_LIMIT_WINDOW_MS / 1000,
    );
    expect(LOGIN_ATTEMPT_RATE_LIMIT_ERROR).toBe(
      "Too many sign-in attempts. Try again shortly.",
    );
  });

  it("limits repeated attempts against one email across clients", () => {
    const now = () => 1000;

    for (let index = 0; index < LOGIN_ATTEMPT_RATE_LIMIT; index += 1) {
      expect(
        checkLoginAttemptRateLimit({
          email: "demo@documind.local",
          now,
          request: request(`203.0.113.${index}`),
        }).allowed,
      ).toBe(true);
    }

    expect(
      checkLoginAttemptRateLimit({
        email: "demo@documind.local",
        now,
        request: request("203.0.113.200"),
      }).allowed,
    ).toBe(false);
  });

  it("limits aggregate attempts across many clients and emails", () => {
    const now = () => 1000;

    for (let index = 0; index < LOGIN_GLOBAL_ATTEMPT_RATE_LIMIT; index += 1) {
      expect(
        checkLoginAttemptRateLimit({
          email: `spray-${index}@documind.local`,
          now,
          request: request(`203.0.113.${index}`),
        }).allowed,
      ).toBe(true);
    }

    const rateLimit = checkLoginAttemptRateLimit({
      email: "spray-final@documind.local",
      now,
      request: request("198.51.100.200"),
    });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(
      LOGIN_ATTEMPT_RATE_LIMIT_WINDOW_MS / 1000,
    );
  });

  it("does not create new client or email buckets after the aggregate limit is reached", () => {
    const now = () => 1000;

    for (let index = 0; index < LOGIN_GLOBAL_ATTEMPT_RATE_LIMIT; index += 1) {
      checkLoginAttemptRateLimit({
        email: `spray-${index}@documind.local`,
        now,
        request: request(`203.0.113.${index}`),
      });
    }

    const bucketCountBeforeDeniedAttempt = getRateLimitBucketCount();
    const rateLimit = checkLoginAttemptRateLimit({
      email: "spray-after-limit@documind.local",
      now,
      request: request("198.51.100.250"),
    });

    expect(rateLimit.allowed).toBe(false);
    expect(getRateLimitBucketCount()).toBe(bucketCountBeforeDeniedAttempt);
  });

  it("normalizes client identifiers before building keys", () => {
    const headers = new Headers({
      "x-forwarded-for": " 203.0.113.10 ",
    });
    const loginRequest = { headers } as Pick<Request, "headers">;

    expect(readLoginClientIdentifier(headers)).toBe("203.0.113.10");
    expect(
      buildLoginAttemptRateLimitKeys({
        email: "Demo@DocuMind.Local",
        request: loginRequest,
      }),
    ).toEqual([
      "auth-login:client:203.0.113.10",
      "auth-login:email:demo@documind.local",
    ]);
  });

  it("does not trust malformed forwarded IP values for client rate limit keys", () => {
    const headers = new Headers({
      "x-forwarded-for": " 203.0.113.10;<script> ",
    });

    expect(readLoginClientIdentifier(headers)).toBe("unknown");
  });

  it("does not trust multi-hop forwarded IP values for client rate limit keys", () => {
    const headers = new Headers({
      "x-forwarded-for": " 203.0.113.10, 10.0.0.2 ",
    });

    expect(readLoginClientIdentifier(headers)).toBe("unknown");
  });

  it("uses a valid real IP fallback when forwarded IP metadata is malformed", () => {
    const headers = new Headers({
      "x-forwarded-for": " attacker-controlled ",
      "x-real-ip": " 198.51.100.42 ",
    });

    expect(readLoginClientIdentifier(headers)).toBe("198.51.100.42");
  });
});
