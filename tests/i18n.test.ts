import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  I18N_COOKIE_NAME,
  SUPPORTED_LOCALES,
  normalizeLocale,
  readPreferredLocaleFromAcceptLanguage,
} from "../lib/i18n/config";
import {
  formatCopy,
  getDictionary,
  lookupApiError,
  lookupCopy,
  translate,
} from "../lib/i18n/dictionaries";

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

  it("keeps core product surfaces localized beyond the common nav", () => {
    const english = getDictionary("en");
    const localizedChecks: Array<(copy: typeof english) => string> = [
      (copy) => copy.auth.loginTitle,
      (copy) => copy.auth.showPassword,
      (copy) => copy.auth.hidePassword,
      (copy) => copy.apiErrors["Authentication required."],
      (copy) => copy.apiErrors["Too many search requests. Try again shortly."],
      (copy) => copy.apiErrors["Invalid API bearer token."],
      (copy) => copy.common.apiTokens,
      (copy) => copy.common.homeLink,
      (copy) => copy.common.primaryNavigation,
      (copy) => copy.meta.description,
      (copy) => copy.oauth.separator,
      (copy) => copy.home.implementedEyebrow,
      (copy) => copy.dashboard.title,
      (copy) => copy.documents.cardTitle,
      (copy) => copy.documents.status.READY,
      (copy) => copy.searchPage.title,
      (copy) => copy.searchForm.scopeEyebrow,
      (copy) => copy.askPage.title,
      (copy) => copy.askForm.answer,
      (copy) => copy.audit.title,
      (copy) => copy.apiTokens.title,
      (copy) => copy.apiTokens.createSubmit,
      (copy) => copy.adminAudit.accessTitle,
      (copy) => copy.adminAudit.organizationRoles.OWNER,
      (copy) => copy.adminAudit.teamRoles.VIEWER,
      (copy) => copy.teamAdmin.title,
      (copy) => copy.teamAdmin.createTeamSubmit,
      (copy) => copy.teamAdmin.inviteMemberSubmit,
      (copy) => copy.teamAdmin.removeMember,
      (copy) => copy.teamAdmin.successInvitationCreatedWithEmail,
      (copy) => copy.teamInvite.acceptInvitation,
      (copy) => copy.teamInvite.invalidTitle,
    ];

    for (const locale of ["ko", "ja"] as const) {
      const dictionary = getDictionary(locale);

      for (const readCopy of localizedChecks) {
        const localizedValue = readCopy(dictionary);

        expect(localizedValue).toBeTruthy();
        expect(localizedValue).not.toBe(readCopy(english));
      }
    }
  });

  it("formats and looks up localized display copy", () => {
    const ko = getDictionary("ko");
    const ja = getDictionary("ja");

    expect(formatCopy(ko.documents.countLabel, { count: 3 })).toBe(
      "3개 파일",
    );
    expect(lookupCopy(ko.documents.notices, "Document deleted.")).toBe(
      "문서를 삭제했습니다.",
    );
    expect(
      lookupCopy(ja.documents.processingErrors, "Document processing failed."),
    ).toBe("文書処理に失敗しました。");
    expect(
      lookupApiError(
        ko.apiErrors,
        "Team name must be between 1 and 80 characters.",
        "fallback",
      ),
    ).toBe("팀 이름은 1자 이상 80자 이하여야 합니다.");
    expect(lookupApiError(ja.apiErrors, "Unknown API error.", "fallback")).toBe(
      "fallback",
    );
  });

  it("keeps supported API error keys localized", () => {
    const english = getDictionary("en").apiErrors;

    for (const locale of ["ko", "ja"] as const) {
      const localized = getDictionary(locale).apiErrors;

      for (const [key, englishValue] of Object.entries(english)) {
        expect(localized[key], `${locale} missing API error: ${key}`).toBeTruthy();
        expect(localized[key], `${locale} untranslated API error: ${key}`).not.toBe(
          englishValue,
        );
      }
    }
  });
});
