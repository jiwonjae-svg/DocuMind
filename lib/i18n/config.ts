export const I18N_COOKIE_NAME = "documind_locale";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "ko", "ja"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(value as SupportedLocale)
  );
}

export function normalizeLocale(value: unknown): SupportedLocale {
  if (isSupportedLocale(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return DEFAULT_LOCALE;
  }

  const language = value.trim().toLowerCase().split(/[-_]/)[0];

  return isSupportedLocale(language) ? language : DEFAULT_LOCALE;
}

export function readPreferredLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): SupportedLocale {
  if (!acceptLanguage?.trim()) {
    return DEFAULT_LOCALE;
  }

  const candidates = acceptLanguage
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);

    if (locale !== DEFAULT_LOCALE || candidate?.toLowerCase().startsWith("en")) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}
