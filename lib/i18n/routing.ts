import {
  I18N_COOKIE_NAME,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "./config";

export const I18N_LOCALE_HEADER = "x-documind-locale";

type LocalePathMatch = {
  locale: SupportedLocale;
  pathname: string;
};

export function readLocalePrefixedPath(pathname: string): LocalePathMatch | null {
  const [firstSegment, ...remainingSegments] = pathname
    .split("/")
    .filter(Boolean);

  if (!SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
    return null;
  }

  return {
    locale: firstSegment as SupportedLocale,
    pathname: remainingSegments.length > 0
      ? `/${remainingSegments.join("/")}`
      : "/",
  };
}

export function buildLocalePrefixedPath({
  locale,
  pathname,
}: {
  locale: SupportedLocale;
  pathname: string;
}) {
  const localePath = readLocalePrefixedPath(pathname);
  const unprefixedPathname = localePath?.pathname ?? pathname;
  const normalizedPathname = unprefixedPathname.startsWith("/")
    ? unprefixedPathname
    : `/${unprefixedPathname}`;

  return normalizedPathname === "/"
    ? `/${locale}`
    : `/${locale}${normalizedPathname}`;
}

export function getLocaleCookieOptions() {
  return {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getLocaleCookieName() {
  return I18N_COOKIE_NAME;
}
