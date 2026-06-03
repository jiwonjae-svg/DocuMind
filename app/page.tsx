import Link from "next/link";

type IconName =
  | "arrow"
  | "chart"
  | "compass"
  | "document"
  | "network"
  | "search"
  | "settings"
  | "shield"
  | "team"
  | "view";

const pillars: Array<{
  title: string;
  body: string;
  icon: IconName;
  accent: string;
}> = [
  {
    title: "Internal Knowledge Search",
    body: "Give teams one place to upload, search, ask, and cite internal policies, guides, and project context.",
    icon: "search",
    accent: "blue",
  },
  {
    title: "Agent-Ready Foundation",
    body: "Expose scoped API endpoints that agents can call later without bypassing authentication or ownership checks.",
    icon: "network",
    accent: "emerald",
  },
  {
    title: "Japan-Facing MVP",
    body: "Keep copy concise, professional, and ready for Japanese and Korean operating teams.",
    icon: "team",
    accent: "violet",
  },
];

const previewResults: Array<{
  title: string;
  updatedAt: string;
  icon: IconName;
  accent: string;
}> = [
  {
    title: "Japan onboarding checklist",
    updatedAt: "Updated 2d ago",
    icon: "document",
    accent: "blue",
  },
  {
    title: "Korea sales enablement brief",
    updatedAt: "Updated 5d ago",
    icon: "chart",
    accent: "emerald",
  },
  {
    title: "Security policy for internal docs",
    updatedAt: "Updated 1w ago",
    icon: "shield",
    accent: "violet",
  },
];

const accentClasses: Record<
  string,
  { tile: string; icon: string; glow: string }
> = {
  blue: {
    tile: "border-blue-100 bg-blue-50",
    icon: "text-blue-700",
    glow: "shadow-[0_16px_34px_rgba(37,99,235,0.12)]",
  },
  emerald: {
    tile: "border-emerald-100 bg-emerald-50",
    icon: "text-emerald-700",
    glow: "shadow-[0_16px_34px_rgba(5,150,105,0.12)]",
  },
  violet: {
    tile: "border-violet-100 bg-violet-50",
    icon: "text-violet-700",
    glow: "shadow-[0_16px_34px_rgba(109,40,217,0.12)]",
  },
};

function Icon({
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
    case "view":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
  }
}

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-[#0b1b4f] shadow-[0_12px_24px_rgba(9,28,78,0.18)] sm:h-10 sm:w-10"
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,#26c6d7_0%,#2563eb_58%,#0b1b4f_58%)]" />
      <span className="relative h-5 w-5 rounded-r-full rounded-tl-sm bg-white/90" />
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fafe] text-[#0b1535]">
      <header className="border-b border-slate-200/80 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2 text-xl font-semibold text-[#0b1535] sm:gap-3 sm:text-2xl"
            aria-label="DocuMind home"
          >
            <LogoMark />
            <span className="truncate">DocuMind</span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-950 sm:h-12 sm:px-5"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg bg-[#080f2f] px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(8,15,47,0.22)] transition hover:bg-[#111a44] sm:h-12 sm:px-6"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative border-b border-slate-200/80 bg-[linear-gradient(135deg,#fbfdff_0%,#eef6ff_48%,#f8fbff_100%)]">
        <div className="absolute bottom-8 left-0 hidden h-36 w-40 bg-[radial-gradient(#c7d9ef_1.1px,transparent_1.1px)] [background-size:18px_18px] md:block" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              Agent-ready knowledge search
            </p>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold tracking-normal text-[#080f2f] sm:text-6xl lg:text-7xl">
              DocuMind
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700">
              DocuMind is an agent-ready internal knowledge search system for
              Japanese/Korean teams. It combines secure document ingestion,
              owner-scoped semantic search, grounded answers, and clean API
              endpoints that can be wrapped by agents.
            </p>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-700">
              日本・韓国チーム向けの社内ナレッジ検索システム。文書のアップロード、
              意味検索、引用付き回答を安全に扱います。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#080f2f] px-6 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(8,15,47,0.24)] transition hover:bg-[#111a44] sm:w-auto"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/40">
                  <Icon name="compass" className="h-3.5 w-3.5" />
                </span>
                Open dashboard
              </Link>
              <a
                href="#mvp"
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white/70 px-6 text-sm font-semibold text-[#10204b] shadow-sm transition hover:border-slate-400 hover:bg-white sm:w-auto"
              >
                <Icon name="view" className="h-5 w-5 text-blue-700" />
                View MVP scope
              </a>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white/86 p-7 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Search preview
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#080f2f]">
                  Internal document index
                </h2>
              </div>
              <span className="rounded-md bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
                MVP
              </span>
            </div>

            <div className="mt-8 flex h-14 items-center gap-4 rounded-lg border border-slate-300 bg-white px-5 text-slate-500 shadow-sm">
              <Icon name="search" className="h-5 w-5 shrink-0 text-slate-600" />
              <p className="min-w-0 flex-1 truncate text-base">
                Search policies, guides, and project notes...
              </p>
              <Icon
                name="settings"
                className="h-5 w-5 shrink-0 text-slate-600"
              />
            </div>

            <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
              {previewResults.map((result) => {
                const accent = accentClasses[result.accent];

                return (
                  <div
                    key={result.title}
                    className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-4 py-6 max-sm:grid-cols-[56px_1fr] max-sm:gap-y-2"
                  >
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-xl border ${accent.tile} ${accent.icon} ${accent.glow}`}
                    >
                      <Icon name={result.icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#0b1535]">
                        {result.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        Owner-scoped retrieval with source-aware AI responses.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-500 max-sm:col-start-2">
                      {result.updatedAt}
                    </p>
                    <Icon
                      name="arrow"
                      className="h-5 w-5 text-slate-600 max-sm:hidden"
                    />
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section
        id="mvp"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
            MVP direction
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
            Built for a focused first release
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => {
            const accent = accentClasses[pillar.accent];

            return (
              <article
                key={pillar.title}
                className="grid min-h-[164px] grid-cols-[64px_1fr] gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
              >
                <div
                  className={`grid h-14 w-14 place-items-center rounded-xl border ${accent.tile} ${accent.icon}`}
                >
                  <Icon name={pillar.icon} className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0b1535]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">
                    {pillar.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
