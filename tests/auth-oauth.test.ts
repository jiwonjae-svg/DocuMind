import type { Account, Profile, User } from "next-auth";
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  auditLog: {
    create: vi.fn(),
  },
  user: {
    create: vi.fn(),
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

function oauthUser(
  email = "owner@example.com",
  options: {
    image?: string | null;
    name?: string | null;
  } = {},
): User {
  return {
    email,
    id: "provider-user-1",
    image: options.image,
    name: Object.hasOwn(options, "name") ? options.name : "Owner",
  } as User;
}

function profile(value: Record<string, unknown>): Profile {
  return value as Profile;
}

function uniqueConstraintError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    clientVersion: "test",
    code: "P2002",
    meta: {
      target: ["provider", "providerAccountId"],
    },
  });
}

describe("OAuth user provisioning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operation) =>
      typeof operation === "function"
        ? operation(prismaMock)
        : Promise.all(operation),
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
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    expect(prismaMock.userAccount.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
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
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rechecks password accounts inside the OAuth linking transaction", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
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

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.userAccount.create).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it("creates a local OAuth user for verified provider emails", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
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

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: "owner@example.com",
          image: null,
          name: "Owner",
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
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("normalizes OAuth profile display values before storing them", async () => {
    prismaMock.userAccount.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      email: "owner@example.com",
      id: "user-1",
      image: "https://cdn.example.com/avatar.png",
      name: "Owner Name",
    });

    await expect(
      ensureOAuthUser({
        account: oauthAccount("google"),
        profile: profile({
          email_verified: true,
          name: "Owner\u202e\r\nName",
          picture: "javascript:alert(1)",
        }),
        user: oauthUser("owner@example.com", {
          image: "https://cdn.example.com/avatar.png",
          name: null,
        }),
      }),
    ).resolves.toMatchObject({ id: "user-1" });

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: "owner@example.com",
          image: "https://cdn.example.com/avatar.png",
          name: "Owner Name",
        },
      }),
    );
  });

  it("recovers when concurrent OAuth linking creates the account first", async () => {
    prismaMock.userAccount.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: "user-1" });
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockRejectedValue(uniqueConstraintError());
    prismaMock.user.update.mockResolvedValue({
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

    expect(prismaMock.userAccount.findUnique).toHaveBeenCalledTimes(2);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "user-1",
        },
      }),
    );
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });
});
