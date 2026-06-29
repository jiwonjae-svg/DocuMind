import { describe, expect, it } from "vitest";
import {
  MAX_AUTH_DISPLAY_NAME_LENGTH,
  MAX_EMAIL_CREDENTIAL_LENGTH,
  MAX_PASSWORD_CREDENTIAL_LENGTH,
  normalizeAuthDisplayName,
  normalizeAuthImageUrl,
  normalizeEmailCredential,
  normalizePasswordCredential,
} from "../lib/auth/credentials";

describe("auth credential normalization", () => {
  it("normalizes email credentials before lookup", () => {
    expect(normalizeEmailCredential(" Demo@DocuMind.Local ")).toBe(
      "demo@documind.local",
    );
  });

  it("rejects malformed email credentials", () => {
    expect(normalizeEmailCredential("not-an-email")).toBeNull();
    expect(normalizeEmailCredential("demo@@documind.local")).toBeNull();
    expect(normalizeEmailCredential("demo @documind.local")).toBeNull();
    expect(normalizeEmailCredential(null)).toBeNull();
  });

  it("rejects oversized email credentials", () => {
    expect(
      normalizeEmailCredential(`${"a".repeat(MAX_EMAIL_CREDENTIAL_LENGTH)}@x`),
    ).toBeNull();
  });

  it("normalizes password credentials before verification", () => {
    expect(normalizePasswordCredential(" DocuMindDemo123! ")).toBe(
      "DocuMindDemo123!",
    );
  });

  it("rejects blank or oversized password credentials", () => {
    expect(normalizePasswordCredential("   ")).toBeNull();
    expect(
      normalizePasswordCredential(
        "x".repeat(MAX_PASSWORD_CREDENTIAL_LENGTH + 1),
      ),
    ).toBeNull();
    expect(normalizePasswordCredential(undefined)).toBeNull();
  });

  it("normalizes display names before signup, OAuth storage, or sessions", () => {
    expect(normalizeAuthDisplayName("  Mina\u202e\r\nTanaka\u0085  ")).toBe(
      "Mina Tanaka",
    );
    expect(normalizeAuthDisplayName("x".repeat(MAX_AUTH_DISPLAY_NAME_LENGTH + 1)))
      .toBeNull();
    expect(normalizeAuthDisplayName("   ")).toBeNull();
  });

  it("accepts only bounded HTTPS profile image URLs", () => {
    expect(normalizeAuthImageUrl(" https://example.com/avatar.png ")).toBe(
      "https://example.com/avatar.png",
    );
    expect(normalizeAuthImageUrl("http://example.com/avatar.png")).toBeNull();
    expect(normalizeAuthImageUrl("javascript:alert(1)")).toBeNull();
  });
});
