import { afterEach, describe, expect, it, vi } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }

  vi.resetModules();
});

describe("Prisma client initialization", () => {
  it("does not require DATABASE_URL when the module is imported", async () => {
    delete process.env.DATABASE_URL;

    await expect(import("../lib/prisma")).resolves.toHaveProperty("prisma");
  });

  it("requires DATABASE_URL only when the Prisma client is first used", async () => {
    delete process.env.DATABASE_URL;

    const { getPrismaClient } = await import("../lib/prisma");

    expect(() => getPrismaClient()).toThrow("DATABASE_URL is required.");
  });
});
