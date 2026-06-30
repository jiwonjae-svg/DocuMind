import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildPageMetadata } from "../lib/i18n/metadata";

const localizedMetadataPages = [
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/forgot-password/page.tsx",
  "app/reset-password/page.tsx",
  "app/join-team/page.tsx",
  "app/dashboard/page.tsx",
  "app/dashboard/documents/page.tsx",
  "app/dashboard/search/page.tsx",
  "app/dashboard/ask/page.tsx",
  "app/dashboard/audit-logs/page.tsx",
  "app/dashboard/admin/audit-logs/page.tsx",
  "app/dashboard/admin/teams/page.tsx",
];

const dashboardLanguageSwitcherPages = [
  "app/dashboard/page.tsx",
  "app/dashboard/documents/page.tsx",
  "app/dashboard/search/page.tsx",
  "app/dashboard/ask/page.tsx",
  "app/dashboard/audit-logs/page.tsx",
  "app/dashboard/admin/audit-logs/page.tsx",
  "app/dashboard/admin/teams/page.tsx",
];

function readSource(filePath: string) {
  return readFileSync(path.join(process.cwd(), filePath), "utf8");
}

describe("localized page metadata", () => {
  it("builds page-specific titles without dropping localized descriptions", () => {
    expect(
      buildPageMetadata({
        description: "팀 문서와 개인 문서를 관리합니다.",
        title: "문서",
      }),
    ).toEqual({
      description: "팀 문서와 개인 문서를 관리합니다.",
      title: "문서 | DocuMind",
    });
  });

  it("keeps key product pages on localized metadata exports", () => {
    for (const page of localizedMetadataPages) {
      const source = readSource(page);

      expect(source, `${page} missing metadata export`).toContain(
        "export async function generateMetadata()",
      );
      expect(source, `${page} should use the shared i18n metadata helper`).toContain(
        "buildPageMetadata",
      );
      expect(source, `${page} should read localized dictionary copy`).toContain(
        "getCurrentDictionary",
      );
    }
  });

  it("keeps dashboard product pages switchable between supported locales", () => {
    for (const page of dashboardLanguageSwitcherPages) {
      const source = readSource(page);

      expect(source, `${page} missing language switcher import`).toContain(
        "LanguageSwitcher",
      );
      expect(source, `${page} should pass the active locale`).toContain(
        "initialLocale={locale}",
      );
    }
  });
});
