import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";
import {
  I18N_PATHNAME_HEADER,
  I18N_SEARCH_HEADER,
  buildLocalePrefixedPath,
} from "@/lib/i18n/routing";
import { headers } from "next/headers";

const localeLabels: Record<SupportedLocale, string> = {
  en: "EN",
  ja: "JA",
  ko: "KO",
};

export async function LanguageSwitcher({
  initialLocale,
}: {
  initialLocale: SupportedLocale;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get(I18N_PATHNAME_HEADER) ?? "/";
  const search = headerStore.get(I18N_SEARCH_HEADER) ?? "";
  const currentLocale = initialLocale ?? DEFAULT_LOCALE;
  const label = translate(currentLocale, "language");

  return (
    <div
      aria-label={label}
      className="inline-flex h-10 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
      role="group"
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLocale === locale;
        const href = `${buildLocalePrefixedPath({
          locale,
          pathname,
        })}${search}`;

        return (
          <a
            key={locale}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`grid h-10 w-12 place-items-center text-xs font-semibold transition ${
              isActive
                ? "bg-[#080f2f] text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            title={locale}
          >
            {localeLabels[locale]}
          </a>
        );
      })}
    </div>
  );
}
