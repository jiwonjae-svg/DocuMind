import Link from "next/link";
import type { ReactNode } from "react";

export type IconName =
  | "arrow"
  | "chart"
  | "check"
  | "compass"
  | "document"
  | "github"
  | "google"
  | "home"
  | "lock"
  | "network"
  | "question"
  | "search"
  | "settings"
  | "shield"
  | "team"
  | "trash"
  | "upload"
  | "view";

export const accentClasses: Record<
  "blue" | "emerald" | "violet" | "amber" | "red",
  { tile: string; icon: string; glow: string; badge: string }
> = {
  blue: {
    tile: "border-blue-100 bg-blue-50",
    icon: "text-blue-700",
    glow: "shadow-[0_16px_34px_rgba(37,99,235,0.12)]",
    badge: "bg-blue-50 text-blue-700",
  },
  emerald: {
    tile: "border-emerald-100 bg-emerald-50",
    icon: "text-emerald-700",
    glow: "shadow-[0_16px_34px_rgba(5,150,105,0.12)]",
    badge: "bg-emerald-50 text-emerald-700",
  },
  violet: {
    tile: "border-violet-100 bg-violet-50",
    icon: "text-violet-700",
    glow: "shadow-[0_16px_34px_rgba(109,40,217,0.12)]",
    badge: "bg-violet-50 text-violet-700",
  },
  amber: {
    tile: "border-amber-100 bg-amber-50",
    icon: "text-amber-700",
    glow: "shadow-[0_16px_34px_rgba(217,119,6,0.12)]",
    badge: "bg-amber-50 text-amber-700",
  },
  red: {
    tile: "border-red-100 bg-red-50",
    icon: "text-red-700",
    glow: "shadow-[0_16px_34px_rgba(220,38,38,0.12)]",
    badge: "bg-red-50 text-red-700",
  },
};

export const ui = {
  page:
    "min-h-screen overflow-x-hidden bg-[#f7fafe] text-[#0b1535]",
  gradientBand:
    "relative border-b border-slate-200/80 bg-[linear-gradient(135deg,#fbfdff_0%,#eef6ff_48%,#f8fbff_100%)]",
  container: "mx-auto max-w-7xl px-5 sm:px-6 lg:px-8",
  section: "mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8",
  card:
    "rounded-lg border border-slate-200 bg-white/88 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur",
  subtleCard:
    "rounded-lg border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.06)]",
  primaryButton:
    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#080f2f] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(8,15,47,0.2)] transition hover:bg-[#111a44] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none sm:h-12 sm:px-5",
  secondaryButton:
    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-[#10204b] shadow-sm transition hover:border-slate-400 hover:bg-white sm:h-12 sm:px-5",
  dangerButton:
    "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50",
  input:
    "w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100",
  label: "text-sm font-semibold text-[#0b1535]",
  eyebrow:
    "text-sm font-bold uppercase tracking-[0.14em] text-blue-700",
  pageTitle: "text-4xl font-semibold tracking-normal text-[#080f2f]",
  muted: "text-sm leading-6 text-slate-600",
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M5 19V9" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
          <path d="M3 19h18" />
          <rect x="4" y="9" width="2" height="10" rx="1" />
          <rect x="11" y="5" width="2" height="14" rx="1" />
          <rect x="18" y="12" width="2" height="7" rx="1" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M7 3h7l3 3v15H7z" />
          <path d="M14 3v4h4" />
          <path d="M9.5 11h5" />
          <path d="M9.5 15h5" />
        </svg>
      );
    case "github":
      return (
        <svg
          className={className}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.3-.3-4.7-1.2-4.7-5A3.9 3.9 0 0 1 6.5 9c-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1.1A9.5 9.5 0 0 1 12 7c.9 0 1.8.1 2.6.4 2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.8c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0 0 12 2.2Z" />
        </svg>
      );
    case "google":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285f4"
            d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.2 3-7.2Z"
          />
          <path
            fill="#34a853"
            d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9a5.9 5.9 0 0 1-5.5-4.1H3.2v2.6A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#fbbc05"
            d="M6.5 13.8a6 6 0 0 1 0-3.6V7.6H3.2a10 10 0 0 0 0 8.8l3.3-2.6Z"
          />
          <path
            fill="#ea4335"
            d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2 10 10 0 0 0 3.2 7.6l3.3 2.6A5.9 5.9 0 0 1 12 6.1Z"
          />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "network":
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2.2" />
          <circle cx="5" cy="18" r="2.2" />
          <circle cx="19" cy="18" r="2.2" />
          <path d="m11 7-5 9" />
          <path d="m13 7 5 9" />
          <path d="M7.3 18h9.4" />
        </svg>
      );
    case "question":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.7 9.4a2.6 2.6 0 1 1 3.9 2.3c-.9.5-1.6 1.1-1.6 2.3" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M4 7h10" />
          <path d="M18 7h2" />
          <circle cx="16" cy="7" r="2" />
          <path d="M4 17h2" />
          <path d="M10 17h10" />
          <circle cx="8" cy="17" r="2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5.5 5.8v5.6c0 4.1 2.6 7.7 6.5 9.1 3.9-1.4 6.5-5 6.5-9.1V5.8z" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="10" r="2.5" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M14.5 16.5A4.8 4.8 0 0 1 21 20" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );
    case "view":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
  }
}

export function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0b1b4f] shadow-[0_12px_24px_rgba(9,28,78,0.18)] sm:h-10 sm:w-10"
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,#26c6d7_0%,#2563eb_58%,#0b1b4f_58%)]" />
      <span className="relative h-5 w-5 rounded-r-full rounded-tl-sm bg-white/90" />
    </span>
  );
}

export function AppHeader({
  children,
  homeAriaLabel,
  userName,
}: {
  children?: ReactNode;
  homeAriaLabel: string;
  userName?: string;
}) {
  return (
    <header className="border-b border-slate-200/80 bg-white/92 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:min-h-[76px] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-2 text-xl font-semibold text-[#0b1535] sm:gap-3 sm:text-2xl"
          aria-label={homeAriaLabel}
        >
          <LogoMark />
          <span className="truncate">DocuMind</span>
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {userName ? (
            <span className="hidden max-w-44 truncate text-sm font-medium text-slate-600 md:block">
              {userName}
            </span>
          ) : null}
          {children}
        </div>
      </div>
    </header>
  );
}

export function IconTile({
  accent,
  icon,
  className = "",
}: {
  accent: keyof typeof accentClasses;
  icon: IconName;
  className?: string;
}) {
  const colors = accentClasses[accent];

  return (
    <div
      className={`grid h-14 w-14 shrink-0 place-items-center rounded-lg border ${colors.tile} ${colors.icon} ${colors.glow} ${className}`}
    >
      <Icon name={icon} className="h-6 w-6" />
    </div>
  );
}
