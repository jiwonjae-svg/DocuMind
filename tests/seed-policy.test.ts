import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEED_USER_EMAIL,
  DEFAULT_SEED_USER_PASSWORD,
  MAX_SEED_USER_PASSWORD_LENGTH,
  readSeedCredentials,
} from "../prisma/seed-policy.mjs";

describe("bootstrap seed credential policy", () => {
  it("allows documented defaults outside production for local bootstrap", () => {
    expect(readSeedCredentials({})).toEqual({
      email: DEFAULT_SEED_USER_EMAIL,
      password: DEFAULT_SEED_USER_PASSWORD,
    });
  });

  it("rejects the default seed password in production", () => {
    expect(() =>
      readSeedCredentials({
        NODE_ENV: "production",
      }),
    ).toThrow(/non-default value/);

    expect(() =>
      readSeedCredentials({
        NODE_ENV: "production",
        SEED_USER_PASSWORD: DEFAULT_SEED_USER_PASSWORD,
      }),
    ).toThrow(/non-default value/);
  });

  it("allows explicit production seed credentials when the password is strong", () => {
    expect(
      readSeedCredentials({
        NODE_ENV: "production",
        SEED_USER_EMAIL: " Operator@Example.com ",
        SEED_USER_PASSWORD: "non-default-production-password",
      }),
    ).toEqual({
      email: "operator@example.com",
      password: "non-default-production-password",
    });
  });

  it("supports legacy demo credential variables outside production", () => {
    expect(
      readSeedCredentials({
        DEMO_USER_EMAIL: " reviewer@example.com ",
        DEMO_USER_PASSWORD: "legacy-local-password",
      }),
    ).toEqual({
      email: "reviewer@example.com",
      password: "legacy-local-password",
    });
  });

  it("rejects legacy demo variables as production seed credentials", () => {
    expect(() =>
      readSeedCredentials({
        DEMO_USER_PASSWORD: "legacy-production-password",
        NODE_ENV: "production",
      }),
    ).toThrow(/non-default value/);
  });

  it("rejects short seed passwords in every environment", () => {
    expect(() =>
      readSeedCredentials({
        SEED_USER_PASSWORD: "short",
      }),
    ).toThrow(/at least 12 characters/);
  });

  it("rejects malformed or unsafe seed emails", () => {
    expect(() =>
      readSeedCredentials({
        SEED_USER_EMAIL: "not-an-email",
      }),
    ).toThrow(/valid email/);
    expect(() =>
      readSeedCredentials({
        SEED_USER_EMAIL: "seed\u202e@documind.local",
      }),
    ).toThrow(/valid email/);
    expect(() =>
      readSeedCredentials({
        SEED_USER_EMAIL: "seed @documind.local",
      }),
    ).toThrow(/valid email/);
  });

  it("rejects oversized seed passwords before hashing", () => {
    expect(() =>
      readSeedCredentials({
        SEED_USER_PASSWORD: "x".repeat(MAX_SEED_USER_PASSWORD_LENGTH + 1),
      }),
    ).toThrow(/1024 characters or fewer/);
  });

  it("does not write raw seed emails to audit metadata or logs", () => {
    const seedSource = readFileSync("prisma/seed.mjs", "utf8");

    expect(seedSource).not.toContain("email: user.email");
    expect(seedSource).not.toContain("email: true");
    expect(seedSource).not.toContain("${user.email}");
    expect(seedSource).toContain('method: "seed"');
  });
});
