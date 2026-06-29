import { beforeEach, describe, expect, it } from "vitest";
import {
  SIGNUP_PASSWORD_TOO_SHORT_ERROR,
  validateSignupInput,
} from "../lib/auth/signup";
import {
  SIGNUP_CLIENT_RATE_LIMIT,
  SIGNUP_EMAIL_RATE_LIMIT,
  SIGNUP_RATE_LIMIT_WINDOW_MS,
  checkSignupEmailRateLimit,
  checkSignupRateLimit,
} from "../lib/auth/signup-rate-limit";
import { clearRateLimitBuckets } from "../lib/rate-limit";

function request(ipAddress: string) {
  const headers = new Headers({
    "x-forwarded-for": ipAddress,
  });

  return { headers } as Pick<Request, "headers">;
}

describe("signup validation", () => {
  it("normalizes valid account input", () => {
    expect(
      validateSignupInput({
        email: " New.User@Example.com ",
        name: "  Mina   Tanaka  ",
        password: "  secure-password-123  ",
      }),
    ).toEqual({
      data: {
        email: "new.user@example.com",
        name: "Mina Tanaka",
        password: "secure-password-123",
      },
      ok: true,
    });
  });

  it("rejects short passwords", () => {
    expect(
      validateSignupInput({
        email: "user@example.com",
        name: "User",
        password: "short",
      }),
    ).toEqual({
      error: SIGNUP_PASSWORD_TOO_SHORT_ERROR,
      ok: false,
    });
  });
});

describe("signup rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("limits repeated account creation attempts from one client", () => {
    const now = () => 1000;
    const signupRequest = request("203.0.113.30");

    for (let index = 0; index < SIGNUP_CLIENT_RATE_LIMIT; index += 1) {
      expect(checkSignupRateLimit({ now, request: signupRequest }).allowed).toBe(
        true,
      );
    }

    const rateLimit = checkSignupRateLimit({ now, request: signupRequest });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(
      SIGNUP_RATE_LIMIT_WINDOW_MS / 1000,
    );
  });

  it("limits repeated account creation attempts for one email", () => {
    const now = () => 1000;

    for (let index = 0; index < SIGNUP_EMAIL_RATE_LIMIT; index += 1) {
      expect(
        checkSignupEmailRateLimit({
          email: "new.user@example.com",
          now,
        }).allowed,
      ).toBe(true);
    }

    expect(
      checkSignupEmailRateLimit({
        email: "new.user@example.com",
        now,
      }).allowed,
    ).toBe(false);
  });
});
