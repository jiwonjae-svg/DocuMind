import { cookies, headers } from "next/headers";
import {
  I18N_COOKIE_NAME,
  readPreferredLocaleFromAcceptLanguage,
  normalizeLocale,
} from "./config";
import { getDictionary } from "./dictionaries";

export async function getCurrentLocale() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get(I18N_COOKIE_NAME)?.value;

  return cookieLocale
    ? normalizeLocale(cookieLocale)
    : readPreferredLocaleFromAcceptLanguage(headerStore.get("accept-language"));
}

export async function getCurrentDictionary() {
  return getDictionary(await getCurrentLocale());
}

export async function getCurrentI18n() {
  const locale = await getCurrentLocale();

  return {
    copy: getDictionary(locale),
    locale,
  };
}
