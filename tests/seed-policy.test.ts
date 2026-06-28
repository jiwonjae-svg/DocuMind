import { describe, expect, it } from "vitest";
import {
  DEFAULT_DEMO_USER_EMAIL,
  DEFAULT_DEMO_USER_PASSWORD,
  readDemoSeedCredentials,
} from "../prisma/seed-policy.mjs";

describe("demo seed credential policy", () => {
  it("allows documented defaults outside production for local review", () => {
    expect(readDemoSeedCredentials({})).toEqual({
      email: DEFAULT_DEMO_USER_EMAIL,
      password: DEFAULT_DEMO_USER_PASSWORD,
    });
  });

  it("rejects the default demo password in production", () => {
    expect(() =>
      readDemoSeedCredentials({
        NODE_ENV: "production",
      }),
    ).toThrow(/non-default value/);

    expect(() =>
      readDemoSeedCredentials({
        DEMO_USER_PASSWORD: DEFAULT_DEMO_USER_PASSWORD,
        NODE_ENV: "production",
      }),
    ).toThrow(/non-default value/);
  });

  it("allows explicit production demo credentials when the password is strong", () => {
    expect(
      readDemoSeedCredentials({
        DEMO_USER_EMAIL: " reviewer@example.com ",
        DEMO_USER_PASSWORD: "non-default-production-password",
        NODE_ENV: "production",
      }),
    ).toEqual({
      email: "reviewer@example.com",
      password: "non-default-production-password",
    });
  });

  it("rejects short demo passwords in every environment", () => {
    expect(() =>
      readDemoSeedCredentials({
        DEMO_USER_PASSWORD: "short",
      }),
    ).toThrow(/at least 12 characters/);
  });
});
