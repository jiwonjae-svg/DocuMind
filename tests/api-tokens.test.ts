import { describe, expect, it, vi } from "vitest";
import {
  API_TOKEN_INVALID_BEARER_ERROR,
  API_TOKEN_PREFIX,
  authenticateApiBearerToken,
  createApiTokenSecret,
  hashApiTokenSecret,
  normalizeApiTokenName,
  normalizeApiTokenSecret,
  readBearerToken,
} from "../lib/auth/api-tokens";

function buildHeaders(authorization?: string) {
  return new Headers(authorization ? { authorization } : {});
}

describe("API bearer token helpers", () => {
  it("normalizes bounded display names", () => {
    expect(normalizeApiTokenName("  Desktop\u202e\r\nClient  ")).toBe(
      "Desktop Client",
    );
    expect(normalizeApiTokenName("")).toBeNull();
    expect(normalizeApiTokenName("x".repeat(81))).toBeNull();
    expect(normalizeApiTokenName(null)).toBeNull();
  });

  it("creates normalized secrets and stable hashes", () => {
    const token = createApiTokenSecret();

    expect(token.startsWith(API_TOKEN_PREFIX)).toBe(true);
    expect(normalizeApiTokenSecret(` ${token} `)).toBe(token);
    expect(normalizeApiTokenSecret("dm_pat_invalid whitespace")).toBeNull();
    expect(hashApiTokenSecret(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashApiTokenSecret(token)).toBe(hashApiTokenSecret(token));
    expect(hashApiTokenSecret(token)).not.toBe(token);
  });

  it("reads a single valid bearer token", () => {
    const token = createApiTokenSecret();

    expect(readBearerToken(buildHeaders())).toBeNull();
    expect(readBearerToken(buildHeaders(`Bearer ${token}`))).toBe(token);
    expect(readBearerToken(buildHeaders(`Basic ${token}`))).toBe(
      API_TOKEN_INVALID_BEARER_ERROR,
    );
    expect(readBearerToken(buildHeaders("Bearer short"))).toBe(
      API_TOKEN_INVALID_BEARER_ERROR,
    );
    expect(readBearerToken(buildHeaders(`Bearer ${token} extra`))).toBe(
      API_TOKEN_INVALID_BEARER_ERROR,
    );
  });

  it("authenticates active tokens and updates last-used time", async () => {
    const now = new Date("2026-06-30T08:00:00.000Z");
    const token = createApiTokenSecret();
    const db = {
      userApiToken: {
        findUnique: vi.fn().mockResolvedValue({
          expiresAt: null,
          id: "api-token-1",
          revokedAt: null,
          userId: "user-1",
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    await expect(
      authenticateApiBearerToken({
        db: db as never,
        headers: buildHeaders(`Bearer ${token}`),
        now,
      }),
    ).resolves.toEqual({
      ok: true,
      tokenId: "api-token-1",
      userId: "user-1",
    });
    expect(db.userApiToken.findUnique).toHaveBeenCalledWith({
      select: {
        expiresAt: true,
        id: true,
        revokedAt: true,
        userId: true,
      },
      where: {
        tokenHash: hashApiTokenSecret(token),
      },
    });
    expect(db.userApiToken.update).toHaveBeenCalledWith({
      data: {
        lastUsedAt: now,
      },
      where: {
        id: "api-token-1",
      },
    });
  });

  it("rejects missing, malformed, revoked, and expired tokens", async () => {
    const now = new Date("2026-06-30T08:00:00.000Z");
    const db = {
      userApiToken: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    await expect(
      authenticateApiBearerToken({
        db: db as never,
        headers: buildHeaders(),
        now,
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "missing",
    });
    expect(db.userApiToken.findUnique).not.toHaveBeenCalled();

    await expect(
      authenticateApiBearerToken({
        db: db as never,
        headers: buildHeaders("Bearer short"),
        now,
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(db.userApiToken.findUnique).not.toHaveBeenCalled();

    db.userApiToken.findUnique.mockResolvedValueOnce({
      expiresAt: null,
      id: "api-token-1",
      revokedAt: new Date("2026-06-29T08:00:00.000Z"),
      userId: "user-1",
    });
    await expect(
      authenticateApiBearerToken({
        db: db as never,
        headers: buildHeaders(`Bearer ${createApiTokenSecret()}`),
        now,
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });

    db.userApiToken.findUnique.mockResolvedValueOnce({
      expiresAt: new Date("2026-06-30T07:59:59.000Z"),
      id: "api-token-2",
      revokedAt: null,
      userId: "user-1",
    });
    await expect(
      authenticateApiBearerToken({
        db: db as never,
        headers: buildHeaders(`Bearer ${createApiTokenSecret()}`),
        now,
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(db.userApiToken.update).not.toHaveBeenCalled();
  });
});
