import Link from "next/link";

const pillars = [
  {
    title: "Internal Knowledge Search",
    body: "Give teams one place to upload, search, ask, and cite internal policies, guides, and project context.",
  },
  {
    title: "Agent-Ready Foundation",
    body: "Expose scoped API endpoints that agents can call later without bypassing authentication or ownership checks.",
  },
  {
    title: "Japan-Facing MVP",
    body: "Keep copy concise, professional, and ready for Japanese and Korean operating teams.",
  },
];

const previewResults = [
  "Japan onboarding checklist",
  "Korea sales enablement brief",
  "Security policy for internal docs",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-slate-950">
            DocuMind
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-700">
              Agent-ready knowledge search
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              DocuMind
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              DocuMind is an agent-ready internal knowledge search system for
              Japanese/Korean teams. It combines secure document ingestion,
              owner-scoped semantic search, grounded answers, and clean API
              endpoints that can be wrapped by agents later.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">
              日本・韓国チーム向けの社内ナレッジ検索。文書のアップロード、意味検索、
              引用付き回答を安全に扱います。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open dashboard
              </Link>
              <a
                href="#mvp"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
              >
                View MVP scope
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Search preview
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  Internal document index
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                MVP
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                Search policies, guides, and project notes...
              </div>
            </div>
            <div className="border-t border-slate-200">
                {previewResults.map((result) => (
                <div key={result} className="border-b border-slate-100 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {result}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Owner-scoped retrieval with source-aware AI responses.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="mvp" className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            MVP direction
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Built for a focused first release
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-950">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
