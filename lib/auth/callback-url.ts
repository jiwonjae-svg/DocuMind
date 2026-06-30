export const DEFAULT_LOGIN_CALLBACK_URL = "/dashboard";
export const MAX_AUTH_REDIRECT_URL_LENGTH = 512;

const LOGIN_CALLBACK_ORIGIN = "https://documind.local";

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isJoinTeamPath(pathname: string) {
  return pathname === "/join-team";
}

function isAuthRedirectPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    isJoinTeamPath(pathname) ||
    isDashboardPath(pathname)
  );
}

function hasEncodedPathSeparator(pathname: string) {
  return /%2f|%5c/i.test(pathname);
}

function hasUnsafeRedirectCharacters(value: string) {
  return value.includes("\\") || /[\u0000-\u001f\u007f-\u009f\p{Cf}]/u.test(value);
}

export function normalizeLoginCallbackUrl(value: unknown) {
  if (typeof value !== "string") {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  const callbackUrl = value.trim();

  if (
    !callbackUrl ||
    callbackUrl.length > MAX_AUTH_REDIRECT_URL_LENGTH ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    hasUnsafeRedirectCharacters(callbackUrl)
  ) {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  try {
    const parsed = new URL(callbackUrl, LOGIN_CALLBACK_ORIGIN);

    if (
      parsed.origin !== LOGIN_CALLBACK_ORIGIN ||
      !(isDashboardPath(parsed.pathname) || isJoinTeamPath(parsed.pathname)) ||
      hasEncodedPathSeparator(parsed.pathname)
    ) {
      return DEFAULT_LOGIN_CALLBACK_URL;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }
}

function buildAuthRedirectUrl(baseUrl: string, path: string) {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }
}

export function normalizeAuthRedirectUrl({
  baseUrl,
  url,
}: {
  baseUrl: string;
  url: string;
}) {
  const fallbackUrl = buildAuthRedirectUrl(baseUrl, DEFAULT_LOGIN_CALLBACK_URL);

  const redirectUrl = url.trim();

  if (
    !redirectUrl ||
    redirectUrl.length > MAX_AUTH_REDIRECT_URL_LENGTH ||
    hasUnsafeRedirectCharacters(redirectUrl)
  ) {
    return fallbackUrl;
  }

  try {
    const base = new URL(baseUrl);
    const parsed = new URL(redirectUrl, base);

    if (
      parsed.origin !== base.origin ||
      !isAuthRedirectPath(parsed.pathname) ||
      hasEncodedPathSeparator(parsed.pathname)
    ) {
      return fallbackUrl;
    }

    return parsed.toString();
  } catch {
    return fallbackUrl;
  }
}
