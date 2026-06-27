export const DEFAULT_LOGIN_CALLBACK_URL = "/dashboard";

const LOGIN_CALLBACK_ORIGIN = "https://documind.local";

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function hasEncodedPathSeparator(pathname: string) {
  return /%2f|%5c/i.test(pathname);
}

export function normalizeLoginCallbackUrl(value: unknown) {
  if (typeof value !== "string") {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  const callbackUrl = value.trim();

  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(callbackUrl)
  ) {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  try {
    const parsed = new URL(callbackUrl, LOGIN_CALLBACK_ORIGIN);

    if (
      parsed.origin !== LOGIN_CALLBACK_ORIGIN ||
      !isDashboardPath(parsed.pathname) ||
      hasEncodedPathSeparator(parsed.pathname)
    ) {
      return DEFAULT_LOGIN_CALLBACK_URL;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }
}
