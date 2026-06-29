import { describe, expect, it } from "vitest";
import {
  getEnabledOAuthProviders,
  getOAuthProviderName,
  isOAuthProviderEnabled,
} from "../lib/auth/oauth-providers";

describe("OAuth provider configuration", () => {
  it("enables providers only when both client ID and secret are configured", () => {
    const env = {
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-secret",
      AUTH_GOOGLE_ID: "google-client-id",
    };

    expect(getEnabledOAuthProviders(env)).toEqual([
      {
        id: "github",
        name: "GitHub",
      },
    ]);
    expect(isOAuthProviderEnabled("github", env)).toBe(true);
    expect(isOAuthProviderEnabled("google", env)).toBe(false);
  });

  it("returns display names for known providers", () => {
    expect(getOAuthProviderName("google")).toBe("Google");
    expect(getOAuthProviderName("github")).toBe("GitHub");
    expect(getOAuthProviderName("custom")).toBe("custom");
  });
});
