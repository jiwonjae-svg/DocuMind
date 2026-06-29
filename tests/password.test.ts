import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("password hashing", () => {
  it("hashes and verifies scrypt password hashes", async () => {
    const hash = await hashPassword("secure-password-123");

    expect(hash).toMatch(/^scrypt:[a-f0-9]{32}:[a-f0-9]+$/);
    await expect(verifyPassword("secure-password-123", hash)).resolves.toBe(
      true,
    );
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("rejects missing hashes for OAuth-only users", async () => {
    await expect(verifyPassword("secure-password-123", null)).resolves.toBe(
      false,
    );
  });
});
