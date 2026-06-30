"use client";

import {
  DEFAULT_LOCALE,
  I18N_COOKIE_NAME,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";
import { useState } from "react";

const localeLabels: Record<SupportedLocale, string> = {
  en: "EN",
  ja: "JA",
  ko: "KO",
};

function readLocaleCookie(): SupportedLocale {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }

  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${I18N_COOKIE_NAME}=`))
    ?.split("=")[1];

  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
    ? (value as SupportedLocale)
    : DEFAULT_LOCALE;
}

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] =
    useState<SupportedLocale>(() => readLocaleCookie());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const label = translate(currentLocale, "language");

  async function updateLocale(locale: SupportedLocale) {
    if (locale === currentLocale || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/locale", {
      body: JSON.stringify({ locale }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.ok) {
      setCurrentLocale(locale);
      window.location.reload();
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <div
      aria-label={label}
      className="inline-flex h-10 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
      role="group"
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLocale === locale;

        return (
          <button
            key={locale}
            type="button"
            aria-pressed={isActive}
            disabled={isSubmitting}
            onClick={() => void updateLocale(locale)}
            className={`min-w-10 px-3 text-xs font-semibold transition ${
              isActive
                ? "bg-[#080f2f] text-white"
                : "text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            title={locale}
          >
            {localeLabels[locale]}
          </button>
        );
      })}
    </div>
  );
}
