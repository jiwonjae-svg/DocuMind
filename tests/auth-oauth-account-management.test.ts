import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  auditLog: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  userAccount: {
    deleteMany: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  OAUTH_ACCOUNT_INVALID_INPUT_ERROR,
  OAUTH_ACCOUNT_LAST_METHOD_ERROR,
  OAUTH_ACCOUNT_NOT_FOUND_ERROR,
  normalizeOAuthAccountId,
  unlinkOAuthAccountForUser,
  validateUnlinkOAuthAccountInput,
} from "../lib/auth/oauth-account-management";

function request() {
  return {
    headers: new Headers({
      "user-agent": "DocuMind account browser",
      "x-forwarded-for": "203.0.113.60",
    }),
  } as Pick<Request, "headers">;
}

describe("OAuth account management validation", () => {
  it("normalizes bounded local OAuth account IDs", () => {
    expect(normalizeOAuthAccountId(" account_123-abc ")).toBe("account_123-abc");
    expect(normalizeOAuthAccountId("")).toBeNull();
    expect(normalizeOAuthAccountId("bad/account")).toBeNull();
    expect(normalizeOAuthAccountId("x".repeat(129))).toBeNull();
  });

  it("validates OAuth unlink input", () => {
    expect(validateUnlinkOAuthAccountInput({ accountId: "account-1" })).toEqual({
      data: {
        accountId: "account-1",
      },
      ok: true,
    });
    expect(validateUnlinkOAuthAccountInput({ accountId: "../account" })).toEqual({
      error: OAUTH_ACCOUNT_INVALID_INPUT_ERROR,
      ok: false,
    });
  });
});

describe("OAuth account unlink persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock),
    );
    prismaMock.user.findUnique.mockResolvedValue({
      accounts: [
        {
          id: "account-1",
          provider: "google",
        },
      ],
      id: "user-1",
      passwordHash: "scrypt:hash",
    });
    prismaMock.userAccount.deleteMany.mockResolvedValue({ count: 1 });
  });

  it("deletes an owned OAuth account when another sign-in method remains", async () => {
    await expect(
      unlinkOAuthAccountForUser({
        accountId: "account-1",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      ok: true,
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      select: {
        accounts: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            provider: true,
          },
        },
        id: true,
        passwordHash: true,
      },
      where: {
        id: "user-1",
      },
    });
    expect(prismaMock.userAccount.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "account-1",
        userId: "user-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "oauth_account_unlinked",
        actorId: "user-1",
        ipAddress: "203.0.113.60",
        metadata: {
          passwordEnabled: true,
          provider: "Google",
          remainingOAuthAccounts: 0,
        },
        resourceId: "user-1",
        resourceType: "User",
        userAgent: "DocuMind account browser",
      },
    });
  });

  it("allows removing one OAuth account when another OAuth method remains", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      accounts: [
        {
          id: "account-1",
          provider: "google",
        },
        {
          id: "account-2",
          provider: "github",
        },
      ],
      id: "user-1",
      passwordHash: null,
    });

    await expect(
      unlinkOAuthAccountForUser({
        accountId: "account-1",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      ok: true,
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          passwordEnabled: false,
          remainingOAuthAccounts: 1,
        }),
      }),
    });
  });

  it("rejects removing the last available sign-in method", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      accounts: [
        {
          id: "account-1",
          provider: "google",
        },
      ],
      id: "user-1",
      passwordHash: null,
    });

    await expect(
      unlinkOAuthAccountForUser({
        accountId: "account-1",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      error: OAUTH_ACCOUNT_LAST_METHOD_ERROR,
      ok: false,
    });

    expect(prismaMock.userAccount.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it("rejects unknown or unowned OAuth accounts", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      accounts: [],
      id: "user-1",
      passwordHash: "scrypt:hash",
    });

    await expect(
      unlinkOAuthAccountForUser({
        accountId: "account-2",
        request: request(),
        userId: "user-1",
      }),
    ).resolves.toEqual({
      error: OAUTH_ACCOUNT_NOT_FOUND_ERROR,
      ok: false,
    });

    expect(prismaMock.userAccount.deleteMany).not.toHaveBeenCalled();
  });
});
