import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOGIN_CALLBACK_URL,
  normalizeLoginCallbackUrl,
} from "../lib/auth/callback-url";

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
    expect(normalizeLoginCallbackUrl("")).toBe(DEFAULT_LOGIN_CALLBACK_URL);
    expect(normalizeLoginCallbackUrl(null)).toBe(DEFAULT_LOGIN_CALLBACK_URL);
  });
});
