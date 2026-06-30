import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOGIN_CALLBACK_URL,
  MAX_AUTH_REDIRECT_URL_LENGTH,
  normalizeAuthRedirectUrl,
  normalizeLoginCallbackUrl,
} from "../lib/auth/callback-url";

const baseUrl = "https://documind.example";

describe("login callback URL normalization", () => {
  it("allows app-relative callback URLs", () => {
    expect(normalizeLoginCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(normalizeLoginCallbackUrl("/dashboard/documents")).toBe(
      "/dashboard/documents",
    );
    expect(normalizeLoginCallbackUrl(" /dashboard/search?query=policy ")).toBe(
      "/dashboard/search?query=policy",
    );
    expect(normalizeLoginCallbackUrl("/dashboard/ask#answer")).toBe(
      "/dashboard/ask#answer",
    );
    expect(normalizeLoginCallbackUrl("/join-team?token=invite_123")).toBe(
      "/join-team?token=invite_123",
    );
  });

  it("rejects external callback URLs", () => {
    expect(normalizeLoginCallbackUrl("https://evil.example/dashboard")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("//evil.example/dashboard")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
  });

  it("rejects non-path and malformed callback URLs", () => {
    expect(normalizeLoginCallbackUrl("javascript:alert(1)")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("/login")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("/api/search")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("\\\\evil.example\\dashboard")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("/dashboard/%5C%5Cevil")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("/dashboard/%2F%2Fevil")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("/dashboard\nSet-Cookie: bad=1")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(normalizeLoginCallbackUrl("/dashboard/\u202eadmin")).toBe(
      DEFAULT_LOGIN_CALLBACK_URL,
    );
    expect(
      normalizeLoginCallbackUrl(
        `/dashboard/${"x".repeat(MAX_AUTH_REDIRECT_URL_LENGTH)}`,
      ),
    ).toBe(DEFAULT_LOGIN_CALLBACK_URL);
    expect(normalizeLoginCallbackUrl("")).toBe(DEFAULT_LOGIN_CALLBACK_URL);
    expect(normalizeLoginCallbackUrl(null)).toBe(DEFAULT_LOGIN_CALLBACK_URL);
  });

  it("allows only expected same-origin Auth.js redirect targets", () => {
    expect(normalizeAuthRedirectUrl({ baseUrl, url: "/" })).toBe(
      `${baseUrl}/`,
    );
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: "/dashboard/documents?uploaded=1#latest",
      }),
    ).toBe(`${baseUrl}/dashboard/documents?uploaded=1#latest`);
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: `${baseUrl}/login?error=OAuthCallback`,
      }),
    ).toBe(`${baseUrl}/login?error=OAuthCallback`);
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: `${baseUrl}/signup?callbackUrl=%2Fdashboard`,
      }),
    ).toBe(`${baseUrl}/signup?callbackUrl=%2Fdashboard`);
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: `${baseUrl}/join-team?token=invite_123`,
      }),
    ).toBe(`${baseUrl}/join-team?token=invite_123`);
  });

  it("rejects external or unexpected Auth.js redirect targets", () => {
    const fallbackUrl = `${baseUrl}${DEFAULT_LOGIN_CALLBACK_URL}`;

    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: "https://evil.example/dashboard",
      }),
    ).toBe(fallbackUrl);
    expect(normalizeAuthRedirectUrl({ baseUrl, url: "/api/auth/session" }))
      .toBe(fallbackUrl);
    expect(normalizeAuthRedirectUrl({ baseUrl, url: "/documents" })).toBe(
      fallbackUrl,
    );
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: "/dashboard/%2F%2Fevil.example",
      }),
    ).toBe(fallbackUrl);
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: "/dashboard\\evil",
      }),
    ).toBe(fallbackUrl);
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: "/dashboard/\u202eadmin",
      }),
    ).toBe(fallbackUrl);
    expect(
      normalizeAuthRedirectUrl({
        baseUrl,
        url: `/dashboard/${"x".repeat(MAX_AUTH_REDIRECT_URL_LENGTH)}`,
      }),
    ).toBe(fallbackUrl);
  });
});
