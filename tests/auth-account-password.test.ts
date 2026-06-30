import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  auditLog: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
}));

const hashPasswordMock = vi.hoisted(() => vi.fn());
const verifyPasswordMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../lib/password", () => ({
  hashPassword: hashPasswordMock,
  verifyPassword: verifyPasswordMock,
}));

import {
  PASSWORD_CHANGE_CONFIRMATION_MISMATCH_ERROR,
  PASSWORD_CHANGE_CURRENT_PASSWORD_INCORRECT_ERROR,
  PASSWORD_CHANGE_FAILED_ERROR,
  PASSWORD_CHANGE_INVALID_INPUT_ERROR,
  PASSWORD_CHANGE_PASSWORD_ACCOUNT_REQUIRED_ERROR,
  PASSWORD_CHANGE_PASSWORD_TOO_SHORT_ERROR,
  PASSWORD_CHANGE_SAME_PASSWORD_ERROR,
  changePasswordForUser,
  validatePasswordChangeInput,
} from "../lib/auth/account-password";
import {
  PASSWORD_CHANGE_RATE_LIMIT,
  PASSWORD_CHANGE_RATE_LIMIT_WINDOW_MS,
  checkPasswordChangeRateLimit,
} from "../lib/auth/account-password-rate-limit";
import { clearRateLimitBuckets } from "../lib/rate-limit";

function request(ipAddress = "203.0.113.44") {
  return {
    headers: new Headers({
      "user-agent": "DocuMind account browser",
      "x-forwarded-for": ipAddress,
    }),
  } as Pick<Request, "headers">;
}

describe("account password validation", () => {
  it("normalizes valid password change input", () => {
    expect(
      validatePasswordChangeInput({
        confirmPassword: " new-secure-password-123 ",
        currentPassword: " current-password-123 ",
        newPassword: " new-secure-password-123 ",
      }),
    ).toEqual({
      data: {
        confirmPassword: "new-secure-password-123",
        currentPassword: "current-password-123",
        newPassword: "new-secure-password-123",
      },
      ok: true,
    });
  });

  it("rejects malformed, short, and mismatched password changes", () => {
    expect(validatePasswordChangeInput(null)).toEqual({
      error: PASSWORD_CHANGE_INVALID_INPUT_ERROR,
      ok: false,
    });

    expect(
      validatePasswordChangeInput({
        confirmPassword: "short",
        currentPassword: "current-password-123",
        newPassword: "short",
      }),
    ).toEqual({
      error: PASSWORD_CHANGE_PASSWORD_TOO_SHORT_ERROR,
      ok: false,
    });

    expect(
      validatePasswordChangeInput({
        confirmPassword: "new-secure-password-456",
        currentPassword: "current-password-123",
        newPassword: "new-secure-password-123",
      }),
    ).toEqual({
      error: PASSWORD_CHANGE_CONFIRMATION_MISMATCH_ERROR,
      ok: false,
    });
  });
});

describe("account password persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock),
    );
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      passwordHash: "scrypt:old-salt:old-hash",
    });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    hashPasswordMock.mockResolvedValue("scrypt:new-salt:new-hash");
    verifyPasswordMock.mockImplementation(async (password) =>
      password === "current-password-123",
    );
  });

  it("verifies the current password, hashes the new password, and audits success", async () => {
    await expect(
      changePasswordForUser({
        currentPassword: "current-password-123",
        newPassword: "new-secure-password-123",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      ok: true,
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        passwordHash: true,
      },
      where: {
        id: "user-1",
      },
    });
    expect(verifyPasswordMock).toHaveBeenNthCalledWith(
      1,
      "current-password-123",
      "scrypt:old-salt:old-hash",
    );
    expect(verifyPasswordMock).toHaveBeenNthCalledWith(
      2,
      "new-secure-password-123",
      "scrypt:old-salt:old-hash",
    );
    expect(hashPasswordMock).toHaveBeenCalledWith("new-secure-password-123");
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      data: {
        passwordHash: "scrypt:new-salt:new-hash",
      },
      where: {
        id: "user-1",
        passwordHash: "scrypt:old-salt:old-hash",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "password_changed",
        actorId: "user-1",
        ipAddress: "203.0.113.44",
        metadata: {
          method: "password",
        },
        resourceId: "user-1",
        resourceType: "User",
        userAgent: "DocuMind account browser",
      },
    });
  });

  it("rejects OAuth-only users before password verification", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      passwordHash: null,
    });

    await expect(
      changePasswordForUser({
        currentPassword: "current-password-123",
        newPassword: "new-secure-password-123",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      error: PASSWORD_CHANGE_PASSWORD_ACCOUNT_REQUIRED_ERROR,
      ok: false,
    });

    expect(verifyPasswordMock).not.toHaveBeenCalled();
    expect(hashPasswordMock).not.toHaveBeenCalled();
  });

  it("rejects incorrect current passwords before hashing the new password", async () => {
    verifyPasswordMock.mockResolvedValue(false);

    await expect(
      changePasswordForUser({
        currentPassword: "wrong-password-123",
        newPassword: "new-secure-password-123",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      error: PASSWORD_CHANGE_CURRENT_PASSWORD_INCORRECT_ERROR,
      ok: false,
    });

    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });

  it("rejects reusing the current password before writing", async () => {
    verifyPasswordMock.mockResolvedValue(true);

    await expect(
      changePasswordForUser({
        currentPassword: "current-password-123",
        newPassword: "current-password-123",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      error: PASSWORD_CHANGE_SAME_PASSWORD_ERROR,
      ok: false,
    });

    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });

  it("returns a stable failure when another request changes the password first", async () => {
    prismaMock.user.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      changePasswordForUser({
        currentPassword: "current-password-123",
        newPassword: "new-secure-password-123",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      error: PASSWORD_CHANGE_FAILED_ERROR,
      ok: false,
    });

    expect(prismaMock.auditLog.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "password_changed",
        }),
      }),
    );
  });
});

describe("account password rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("limits repeated password change attempts for one user and client", () => {
    const now = () => 1000;
    const passwordChangeRequest = request("203.0.113.50");

    for (let index = 0; index < PASSWORD_CHANGE_RATE_LIMIT; index += 1) {
      expect(
        checkPasswordChangeRateLimit({
          now,
          request: passwordChangeRequest,
          userId: "user-1",
        }).allowed,
      ).toBe(true);
    }

    const rateLimit = checkPasswordChangeRateLimit({
      now,
      request: passwordChangeRequest,
      userId: "user-1",
    });

    expect(rateLimit.allowed).toBe(false);
    expect(rateLimit.retryAfterSeconds).toBe(
      PASSWORD_CHANGE_RATE_LIMIT_WINDOW_MS / 1000,
    );
  });
});
