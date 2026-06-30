import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  I18N_LOCALE_HEADER,
  buildLocalePrefixedPath,
  getLocaleCookieName,
  getLocaleCookieOptions,
  readLocalePrefixedPath,
} from "../lib/i18n/routing";

function readSource(filePath: string) {
  return readFileSync(path.join(process.cwd(), filePath), "utf8");
}

describe("i18n locale-prefixed routing", () => {
  it("reads supported locale prefixes without changing the internal route", () => {
    expect(readLocalePrefixedPath("/ko")).toEqual({
      locale: "ko",
      pathname: "/",
    });
    expect(readLocalePrefixedPath("/ja/dashboard/documents")).toEqual({
      locale: "ja",
      pathname: "/dashboard/documents",
    });
    expect(readLocalePrefixedPath("/fr/dashboard")).toBeNull();
    expect(readLocalePrefixedPath("/dashboard")).toBeNull();
  });

  it("builds stable locale-prefixed paths for language switching", () => {
    expect(buildLocalePrefixedPath({ locale: "ko", pathname: "/" })).toBe(
      "/ko",
    );
    expect(
      buildLocalePrefixedPath({
        locale: "ja",
        pathname: "/dashboard/search",
      }),
    ).toBe("/ja/dashboard/search");
    expect(
      buildLocalePrefixedPath({
        locale: "en",
        pathname: "/ko/dashboard/search",
      }),
    ).toBe("/en/dashboard/search");
  });

  it("shares stable locale cookie settings between proxy and API route", () => {
    expect(I18N_LOCALE_HEADER).toBe("x-documind-locale");
    expect(getLocaleCookieName()).toBe("documind_locale");
    expect(getLocaleCookieOptions()).toEqual({
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

  it("keeps locale prefix handling in the Next.js proxy", () => {
    const proxySource = readSource("proxy.ts");
    const serverSource = readSource("lib/i18n/server.ts");
    const switcherSource = readSource("components/language-switcher.tsx");

    expect(proxySource).toContain("readLocalePrefixedPath");
    expect(proxySource).toContain("NextResponse.rewrite");
    expect(proxySource).toContain("headers.set(I18N_LOCALE_HEADER");
    expect(proxySource).toContain("response.cookies.set");
    expect(proxySource).toContain("api|_next/static|_next/image");
    expect(serverSource).toContain("headerStore.get(I18N_LOCALE_HEADER)");
    expect(switcherSource).toContain("buildLocalePrefixedPath");
    expect(switcherSource).toContain("window.location.assign");
  });
});
