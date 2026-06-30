import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  I18N_COOKIE_NAME,
  SUPPORTED_LOCALES,
  normalizeLocale,
  readPreferredLocaleFromAcceptLanguage,
} from "../lib/i18n/config";
import { translate } from "../lib/i18n/dictionaries";

describe("i18n locale helpers", () => {
  it("normalizes supported locale values", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "ko", "ja"]);
    expect(I18N_COOKIE_NAME).toBe("documind_locale");
    expect(normalizeLocale("ko-KR")).toBe("ko");
    expect(normalizeLocale("ja_JP")).toBe("ja");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("fr-FR")).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE);
  });

  it("reads the first supported Accept-Language candidate", () => {
    expect(
      readPreferredLocaleFromAcceptLanguage(
        "fr-FR, ko-KR;q=0.9, ja-JP;q=0.8",
      ),
    ).toBe("ko");
    expect(
      readPreferredLocaleFromAcceptLanguage("ja-JP, en-US;q=0.8"),
    ).toBe("ja");
    expect(readPreferredLocaleFromAcceptLanguage("fr-FR")).toBe("en");
  });

  it("translates shared navigation labels", () => {
    expect(translate("en", "login")).toBe("Sign in");
    expect(translate("ko", "login")).toBe("로그인");
    expect(translate("ja", "login")).toBe("ログイン");
  });
});
