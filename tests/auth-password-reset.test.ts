import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  auditLog: {
    create: vi.fn(),
  },
  passwordResetToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

const hashPasswordMock = vi.hoisted(() => vi.fn());
const isPasswordResetEmailConfiguredMock = vi.hoisted(() => vi.fn());
const sendPasswordResetEmailMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../lib/password", () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock("../lib/auth/password-reset-email", () => ({
  isPasswordResetEmailConfigured: isPasswordResetEmailConfiguredMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

import {
  PASSWORD_RESET_INVALID_EMAIL_ERROR,
  PASSWORD_RESET_INVALID_REQUEST_ERROR,
  PASSWORD_RESET_INVALID_TOKEN_ERROR,
  PASSWORD_RESET_PASSWORD_TOO_SHORT_ERROR,
  completePasswordReset,
  requestPasswordReset,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "../lib/auth/password-reset";
import {
  PASSWORD_RESET_REQUEST_CLIENT_RATE_LIMIT,
  PASSWORD_RESET_REQUEST_EMAIL_RATE_LIMIT,
  PASSWORD_RESET_REQUEST_GLOBAL_RATE_LIMIT,
  PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
  checkPasswordResetEmailRateLimit,
  checkPasswordResetRequestRateLimit,
} from "../lib/auth/password-reset-rate-limit";
import {
  clearRateLimitBuckets,
  getRateLimitBucketCount,
} from "../lib/rate-limit";

function request(ipAddress = "203.0.113.44") {
  return {
    headers: new Headers({
      "user-agent": "DocuMind test browser",
      "x-forwarded-for": ipAddress,
    }),
    url: "https://documind.example/forgot-password",
  } as Pick<Request, "headers" | "url">;
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

describe("password reset validation", () => {
  it("normalizes forgot-password email input", () => {
    expect(
      validateForgotPasswordInput({
        email: " Owner@Example.com ",
      }),
    ).toEqual({
      data: {
        email: "owner@example.com",
      },
      ok: true,
    });
  });

  it("rejects malformed forgot-password input", () => {
    expect(validateForgotPasswordInput({ email: "not-an-email" })).toEqual({
      error: PASSWORD_RESET_INVALID_EMAIL_ERROR,
      ok: false,
    });
  });

  it("validates reset tokens and password length", () => {
    expect(
      validateResetPasswordInput({
        password: "new-secure-password-123",
        token: "a".repeat(43),
      }),
    ).toEqual({
      data: {
        password: "new-secure-password-123",
        token: "a".repeat(43),
      },
      ok: true,
    });

    expect(
      validateResetPasswordInput({
        password: "new-secure-password-123",
        token: "bad token with spaces",
      }),
    ).toEqual({
      error: PASSWORD_RESET_INVALID_REQUEST_ERROR,
      ok: false,
    });

    expect(
      validateResetPasswordInput({
        password: "short",
        token: "a".repeat(43),
      }),
    ).toEqual({
      error: PASSWORD_RESET_PASSWORD_TOO_SHORT_ERROR,
      ok: false,
    });
  });
});

describe("password reset persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock),
    );
    hashPasswordMock.mockResolvedValue("scrypt:new-salt:new-hash");
    isPasswordResetEmailConfiguredMock.mockReturnValue(true);
    sendPasswordResetEmailMock.mockResolvedValue({ sent: true });
  });

  it("creates hashed one-time tokens and sends reset email for password users", async () => {
    const now = new Date("2026-06-30T00:00:00.000Z");
    prismaMock.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      id: "user-1",
      name: "Owner",
      passwordHash: "scrypt:old-salt:old-hash",
    });

    const result = await requestPasswordReset({
      email: "owner@example.com",
      env: {
        AUTH_URL: "https://documind.example",
        NODE_ENV: "test",
        PASSWORD_RESET_DEBUG_LINKS: "true",
        PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
        RESEND_API_KEY: "re_test",
      },
      locale: "ja",
      now: () => now,
      request: request(),
    });

    expect(result.resetUrl).toMatch(
      /^https:\/\/documind\.example\/reset-password\?token=/,
    );

    const resetUrl = new URL(result.resetUrl ?? "");
    const token = resetUrl.searchParams.get("token") ?? "";

    expect(token).toMatch(/^[A-Za-z0-9_-]{32,256}$/);
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        expiresAt: new Date("2026-06-30T00:30:00.000Z"),
        tokenHash: tokenHash(token),
        userId: "user-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "user-1",
        action: "password_reset_requested",
        ipAddress: "203.0.113.44",
        metadata: {
          emailConfigured: true,
        },
        resourceId: "user-1",
        resourceType: "User",
        userAgent: "DocuMind test browser",
      },
    });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: "ja",
        resetUrl: result.resetUrl,
        to: "owner@example.com",
        userName: "Owner",
      }),
    );
  });

  it("does not issue reset tokens for missing or OAuth-only users", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      id: "user-1",
      name: "Owner",
      passwordHash: null,
    });

    await expect(
      requestPasswordReset({
        email: "owner@example.com",
        request: request(),
      }),
    ).resolves.toEqual({
      ok: true,
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("does not return reset URLs outside explicit non-production debug mode", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
      id: "user-1",
      name: "Owner",
      passwordHash: "scrypt:old-salt:old-hash",
    });

    await expect(
      requestPasswordReset({
        email: "owner@example.com",
        env: {
          AUTH_URL: "https://documind.example",
          NODE_ENV: "production",
          PASSWORD_RESET_DEBUG_LINKS: "true",
        },
        request: request(),
      }),
    ).resolves.toEqual({
      ok: true,
    });
  });

  it("updates the password and consumes reset tokens transactionally", async () => {
    const now = new Date("2026-06-30T01:00:00.000Z");
    const token = "a".repeat(43);
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      expiresAt: new Date("2026-06-30T01:10:00.000Z"),
      id: "token-1",
      usedAt: null,
      userId: "user-1",
    });
    prismaMock.passwordResetToken.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 2 });

    await expect(
      completePasswordReset({
        now: () => now,
        password: "new-secure-password-123",
        request: request(),
        token,
      }),
    ).resolves.toEqual({
      ok: true,
    });

    expect(prismaMock.passwordResetToken.findUnique).toHaveBeenCalledWith({
      select: {
        expiresAt: true,
        id: true,
        usedAt: true,
        userId: true,
      },
      where: {
        tokenHash: tokenHash(token),
      },
    });
    expect(hashPasswordMock).toHaveBeenCalledWith("new-secure-password-123");
    expect(prismaMock.passwordResetToken.updateMany).toHaveBeenNthCalledWith(1, {
      data: {
        usedAt: now,
      },
      where: {
        expiresAt: {
          gt: now,
        },
        id: "token-1",
        usedAt: null,
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: {
        passwordHash: "scrypt:new-salt:new-hash",
      },
      where: {
        id: "user-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "user-1",
        action: "password_reset_completed",
        ipAddress: "203.0.113.44",
        resourceId: "user-1",
        resourceType: "User",
        userAgent: "DocuMind test browser",
      },
    });
  });

  it("rejects expired tokens before hashing the new password", async () => {
    const now = new Date("2026-06-30T01:00:00.000Z");
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      expiresAt: new Date("2026-06-30T00:59:00.000Z"),
      id: "token-1",
      usedAt: null,
      userId: "user-1",
    });

    await expect(
      completePasswordReset({
        now: () => now,
        password: "new-secure-password-123",
        request: request(),
        token: "a".repeat(43),
      }),
    ).resolves.toEqual({
      error: PASSWORD_RESET_INVALID_TOKEN_ERROR,
      ok: false,
    });

    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects tokens consumed by another request before updating the password", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      expiresAt: new Date("2026-06-30T01:10:00.000Z"),
      id: "token-1",
      usedAt: null,
      userId: "user-1",
    });
    prismaMock.passwordResetToken.updateMany.mockResolvedValueOnce({
      count: 0,
    });

    await expect(
      completePasswordReset({
        now: () => new Date("2026-06-30T01:00:00.000Z"),
        password: "new-secure-password-123",
        request: request(),
        token: "a".repeat(43),
      }),
    ).resolves.toEqual({
      error: PASSWORD_RESET_INVALID_TOKEN_ERROR,
      ok: false,
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("new-secure-password-123");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "password_reset_completed",
        }),
      }),
    );
  });
});

describe("password reset rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("limits reset requests from one client", () => {
    const now = () => 1000;
    const resetRequest = request("203.0.113.50");

    for (
      let index = 0;
      index < PASSWORD_RESET_REQUEST_CLIENT_RATE_LIMIT;
      index += 1
    ) {
      expect(
        checkPasswordResetRequestRateLimit({ now, request: resetRequest })
          .allowed,
      ).toBe(true);
    }

    const rateLimit = checkPasswordResetRequestRateLimit({
      now,
      request: resetRequest,
    });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(
      PASSWORD_RESET_RATE_LIMIT_WINDOW_MS / 1000,
    );
  });

  it("limits repeated reset requests for one email", () => {
    const now = () => 1000;

    for (
      let index = 0;
      index < PASSWORD_RESET_REQUEST_EMAIL_RATE_LIMIT;
      index += 1
    ) {
      expect(
        checkPasswordResetEmailRateLimit({
          email: "owner@example.com",
          now,
        }).allowed,
      ).toBe(true);
    }

    expect(
      checkPasswordResetEmailRateLimit({
        email: "owner@example.com",
        now,
      }).allowed,
    ).toBe(false);
  });

  it("does not create new client buckets after aggregate reset limit is reached", () => {
    const now = () => 1000;

    for (
      let index = 0;
      index < PASSWORD_RESET_REQUEST_GLOBAL_RATE_LIMIT;
      index += 1
    ) {
      checkPasswordResetRequestRateLimit({
        now,
        request: request(`203.0.113.${index}`),
      });
    }

    const bucketCountBeforeDeniedAttempt = getRateLimitBucketCount();

    expect(
      checkPasswordResetRequestRateLimit({
        now,
        request: request("198.51.100.250"),
      }).allowed,
    ).toBe(false);
    expect(getRateLimitBucketCount()).toBe(bucketCountBeforeDeniedAttempt);
  });
});
