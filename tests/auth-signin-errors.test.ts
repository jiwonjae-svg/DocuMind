import { describe, expect, it } from "vitest";
import {
  getAuthPageErrorMessage,
  normalizeAuthPageErrorCode,
} from "../lib/auth/signin-errors";
import { getDictionary } from "../lib/i18n/dictionaries";

describe("Auth page error handling", () => {
  it("maps known Auth.js error codes to bounded user-facing categories", () => {
    expect(normalizeAuthPageErrorCode("AccessDenied")).toBe("accessDenied");
    expect(normalizeAuthPageErrorCode("OAuthAccountNotLinked")).toBe(
      "accountNotLinked",
    );
    expect(normalizeAuthPageErrorCode("OAuthCallback")).toBe("callback");
    expect(normalizeAuthPageErrorCode("OAuthCreateAccount")).toBe("oauth");
    expect(normalizeAuthPageErrorCode("CredentialsSignin")).toBe("credentials");
    expect(normalizeAuthPageErrorCode(["SessionRequired"])).toBe(
      "sessionRequired",
    );
    expect(normalizeAuthPageErrorCode("FutureAuthCode")).toBe("default");
  });

  it("rejects unsafe or oversized error query values", () => {
    expect(normalizeAuthPageErrorCode("")).toBeNull();
    expect(normalizeAuthPageErrorCode("OAuthCallback\nSet-Cookie:x=y")).toBeNull();
    expect(normalizeAuthPageErrorCode("OAuth-Callback")).toBeNull();
    expect(normalizeAuthPageErrorCode("x".repeat(65))).toBeNull();
    expect(normalizeAuthPageErrorCode(null)).toBeNull();
  });

  it("returns localized copy without reflecting the raw error code", () => {
    const english = getDictionary("en");
    const korean = getDictionary("ko");
    const japanese = getDictionary("ja");
    const kind = normalizeAuthPageErrorCode("OAuthAccountNotLinked");

    expect(getAuthPageErrorMessage(english.auth, kind)).toBe(
      english.auth.signInErrorAccountNotLinked,
    );
    expect(getAuthPageErrorMessage(korean.auth, kind)).toBe(
      korean.auth.signInErrorAccountNotLinked,
    );
    expect(getAuthPageErrorMessage(japanese.auth, kind)).toBe(
      japanese.auth.signInErrorAccountNotLinked,
    );
    expect(korean.auth.signInErrorTitle).not.toBe(english.auth.signInErrorTitle);
    expect(japanese.auth.signInErrorTitle).not.toBe(english.auth.signInErrorTitle);
  });
});
