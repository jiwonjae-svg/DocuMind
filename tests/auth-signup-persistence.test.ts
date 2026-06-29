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
  },
}));

const hashPasswordMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../lib/password", () => ({
  hashPassword: hashPasswordMock,
}));

import { createPasswordUser } from "../lib/auth/signup";

function uniqueEmailError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    clientVersion: "test",
    code: "P2002",
    meta: {
      target: ["email"],
    },
  });
}

describe("signup persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashPasswordMock.mockResolvedValue("scrypt:salt:hash");
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock),
    );
  });

  it("stores password users and signup audit logs in one transaction", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      email: "new.user@example.com",
      id: "user-1",
      name: "New User",
    });
    prismaMock.auditLog.create.mockResolvedValue({ id: "audit-1" });

    await expect(
      createPasswordUser({
        email: "new.user@example.com",
        name: "New User",
        password: "secure-password-123",
      }),
    ).resolves.toEqual({
      created: true,
      ok: true,
      user: {
        email: "new.user@example.com",
        id: "user-1",
        name: "New User",
      },
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("secure-password-123");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: "new.user@example.com",
          name: "New User",
          passwordHash: "scrypt:salt:hash",
        },
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "user-1",
        action: "user_signed_up",
        metadata: {
          method: "password",
        },
        resourceId: "user-1",
        resourceType: "User",
      },
    });
  });

  it("does not reveal unique email collisions", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue(uniqueEmailError());

    await expect(
      createPasswordUser({
        email: "existing@example.com",
        name: "Existing User",
        password: "secure-password-123",
      }),
    ).resolves.toEqual({
      created: false,
      ok: true,
      user: null,
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("secure-password-123");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });
});
