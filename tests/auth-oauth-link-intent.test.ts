import { describe, expect, it } from "vitest";
import {
  OAUTH_LINK_INTENT_TTL_SECONDS,
  createOAuthLinkIntentCookieValue,
  readOAuthLinkIntentCookieValue,
} from "../lib/auth/oauth-link-intent";

const env = {
  AUTH_SECRET: "test-auth-secret-with-enough-entropy",
};

describe("OAuth link intent cookies", () => {
  it("creates and reads a signed short-lived OAuth link intent", () => {
    const now = new Date("2026-06-30T00:00:00.000Z");
    const value = createOAuthLinkIntentCookieValue({
      env,
      now: () => now,
      provider: "google",
      userId: "user-1",
    });

    expect(value).toBeTruthy();
    expect(
      readOAuthLinkIntentCookieValue({
        env,
        now: () => new Date(now.getTime() + 1000),
        value: value ?? undefined,
      }),
    ).toEqual({
      expiresAt: now.getTime() + OAUTH_LINK_INTENT_TTL_SECONDS * 1000,
      provider: "google",
      userId: "user-1",
    });
  });

  it("rejects tampered, expired, or unsigned OAuth link intents", () => {
    const now = new Date("2026-06-30T00:00:00.000Z");
    const value = createOAuthLinkIntentCookieValue({
      env,
      now: () => now,
      provider: "github",
      userId: "user-1",
    });

    expect(
      readOAuthLinkIntentCookieValue({
        env,
        value: `${value ?? ""}tampered`,
      }),
    ).toBeNull();
    expect(
      readOAuthLinkIntentCookieValue({
        env,
        now: () =>
          new Date(now.getTime() + (OAUTH_LINK_INTENT_TTL_SECONDS + 1) * 1000),
        value: value ?? undefined,
      }),
    ).toBeNull();
    expect(
      createOAuthLinkIntentCookieValue({
        env: {},
        provider: "github",
        userId: "user-1",
      }),
    ).toBeNull();
  });
});
