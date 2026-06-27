export const DEFAULT_LOGIN_CALLBACK_URL = "/dashboard";

export function normalizeLoginCallbackUrl(value: unknown) {
  if (typeof value !== "string") {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  const callbackUrl = value.trim();

  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\")
  ) {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  return callbackUrl;
}
