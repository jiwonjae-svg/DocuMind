import type { Account, Profile, User } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  auditLog: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  userAccount: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

import { ensureOAuthUser } from "../lib/auth/oauth";

function oauthAccount(
  provider: string,
  providerAccountId = `${provider}-account-1`,
): Account {
  return {
    provider,
    providerAccountId,
    type: "oauth",
  } as Account;
}

function oauthUser(email = "owner@example.com"): User {
  return {
    email,
    id: "provider-user-1",
    name: "Owner",
  } as User;
}

function profile(value: Record<string, unknown>): Profile {
  return value as Profile;
}

describe("OAuth user provisioning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operations) =>
      Promise.all(operations),
    );
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-1" });
    prismaMock.userAccount.create.mockResolvedValue({ id: "account-1" });
  });

  it("allows already linked OAuth accounts without rechecking provider email", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue({ userId: "user-1" });
    prismaMock.user.update.mockResolvedValue({
      email: "owner@example.com",
      id: "user-1",
      image: null,
      name: "Owner",
    });

    await expect(
      ensureOAuthUser({
        account: oauthAccount("github"),
        profile: profile({}),
        user: oauthUser(),
      }),
    ).resolves.toMatchObject({ id: "user-1" });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "user-1",
        },
      }),
    );
  });

  it("rejects unverified provider emails before creating local users", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue(null);

    await expect(
      ensureOAuthUser({
        account: oauthAccount("github"),
        profile: profile({}),
        user: oauthUser("victim@example.com"),
      }),
    ).resolves.toBeNull();

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userAccount.create).not.toHaveBeenCalled();
  });

  it("does not auto-link OAuth to existing password accounts", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "password-user-1",
      passwordHash: "scrypt:salt:hash",
    });

    await expect(
      ensureOAuthUser({
        account: oauthAccount("google"),
        profile: profile({ email_verified: true }),
        user: oauthUser("owner@example.com"),
      }),
    ).resolves.toBeNull();

    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userAccount.create).not.toHaveBeenCalled();
  });

  it("creates a local OAuth user for verified provider emails", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.upsert.mockResolvedValue({
      email: "owner@example.com",
      id: "user-1",
      image: null,
      name: "Owner",
    });

    await expect(
      ensureOAuthUser({
        account: oauthAccount("google"),
        profile: profile({ email_verified: true }),
        user: oauthUser("owner@example.com"),
      }),
    ).resolves.toMatchObject({ id: "user-1" });

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          email: "owner@example.com",
        },
      }),
    );
    expect(prismaMock.userAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: "google",
          userId: "user-1",
        }),
      }),
    );
  });
});
