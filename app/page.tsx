import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import Link from "next/link";

const pillars = [
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
] as const;

const previewResults = [
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
] as const;

export default function Home() {
  return (
    <main className={ui.page}>
      <AppHeader>
        <nav aria-label="Primary navigation" className="flex items-center gap-3">
          <Link href="/dashboard" className={ui.secondaryButton}>
            Dashboard
          </Link>
          <Link href="/login" className={ui.primaryButton}>
            Sign in
          </Link>
        </nav>
      </AppHeader>

      <section className={ui.gradientBand}>
        <div className="absolute bottom-8 left-0 hidden h-36 w-40 bg-[radial-gradient(#c7d9ef_1.1px,transparent_1.1px)] [background-size:18px_18px] md:block" />
        <div className={`${ui.container} grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:py-24`}>
          <div className="flex flex-col justify-center">
            <p className={ui.eyebrow}>Agent-ready knowledge search</p>
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
              <Link href="/dashboard" className={`${ui.primaryButton} w-full sm:w-auto`}>
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/40">
                  <Icon name="compass" className="h-3.5 w-3.5" />
                </span>
                Open dashboard
              </Link>
              <a href="#mvp" className={`${ui.secondaryButton} w-full sm:w-auto`}>
                <Icon name="view" className="h-5 w-5 text-blue-700" />
                View MVP scope
              </a>
            </div>
          </div>

          <aside className={`${ui.card} p-7`}>
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
              {previewResults.map((result) => (
                <div
                  key={result.title}
                  className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-4 py-6 max-sm:grid-cols-[56px_1fr] max-sm:gap-y-2"
                >
                  <IconTile accent={result.accent} icon={result.icon} />
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
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="mvp" className={`${ui.container} py-12 sm:py-14`}>
        <div className="mb-7">
          <p className={ui.eyebrow}>MVP direction</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
            Built for a focused first release
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className={`${ui.subtleCard} grid min-h-[164px] grid-cols-[64px_1fr] gap-5 p-6`}
            >
              <IconTile accent={pillar.accent} icon={pillar.icon} />
              <div>
                <h3 className="text-lg font-semibold text-[#0b1535]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">
                  {pillar.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
