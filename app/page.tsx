import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import Link from "next/link";

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

const implementedFeatures = [
  {
    title: "Secure document ingestion",
    body: "Authenticated users can upload .txt, .md, and .pdf files with server-side file validation and owner-scoped metadata.",
    icon: "upload",
    accent: "blue",
  },
  {
    title: "Document processing pipeline",
    body: "Uploaded files are parsed, chunked, stored locally for development, and tracked with UPLOADED, PROCESSING, READY, or FAILED status.",
    icon: "document",
    accent: "emerald",
  },
  {
    title: "pgvector semantic search",
    body: "Document chunks store OpenAI embeddings in PostgreSQL with pgvector and are searched only inside the current user's documents.",
    icon: "search",
    accent: "violet",
  },
  {
    title: "Grounded answers with citations",
    body: "Questions retrieve matching chunks, build a source-bounded prompt, and return answers with citations, snippets, and matched scores.",
    icon: "question",
    accent: "blue",
  },
  {
    title: "Agent-ready tool endpoints",
    body: "Scoped /api/tools endpoints expose search, ask-with-citations, and summarize-document without bypassing auth or ownership checks.",
    icon: "network",
    accent: "emerald",
  },
  {
    title: "Auditability and access control",
    body: "Upload, delete, ask, processing, and agent tool actions write audit records while protected routes enforce session checks.",
    icon: "shield",
    accent: "violet",
  },
] as const;

const architectureFlow = [
  "Upload",
  "Parse",
  "Chunk",
  "Embed",
  "Store",
  "Search",
  "Answer",
  "Cite",
  "Audit",
] as const;

const demoSteps = [
  "Sign in with the prefilled demo account",
  "Review sample documents, or upload a short .txt/.md file if the demo database is empty",
  "Ask a question",
  "Check citations and matched snippets",
  "Review audit logs or access behavior",
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
        <div
          className={`${ui.container} grid gap-12 py-14 sm:py-18 lg:grid-cols-[0.95fr_1.05fr] lg:py-20`}
        >
          <div className="flex flex-col justify-center">
            <p className={ui.eyebrow}>Agent-ready knowledge search</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-normal text-[#080f2f] sm:text-6xl lg:text-7xl">
              DocuMind
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              DocuMind is an agent-ready internal knowledge search system for
              Japanese/Korean teams. It combines secure document ingestion,
              owner-scoped semantic search, grounded answers, and clean API
              endpoints that can be wrapped by agents.
            </p>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-700">
              日本・韓国チーム向けの社内ナレッジ検索システムです。認証、
              文書処理、意味検索、引用付き回答を安全に扱うための
              バックエンド重視のMVPです。
            </p>
            <p className="mt-5 max-w-2xl rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-sm font-semibold leading-6 text-[#10204b] shadow-sm">
              Built with Next.js, TypeScript, PostgreSQL, Prisma, pgvector,
              Auth.js, OpenAI API, and Vercel.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className={`${ui.primaryButton} w-full sm:w-auto`}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/40">
                  <Icon name="compass" className="h-3.5 w-3.5" />
                </span>
                Open dashboard
              </Link>
              <a href="#implemented" className={`${ui.secondaryButton} w-full sm:w-auto`}>
                <Icon name="view" className="h-5 w-5 text-blue-700" />
                View implementation
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

      <section id="implemented" className={`${ui.container} py-12 sm:py-14`}>
        <div className="mb-7 max-w-3xl">
          <p className={ui.eyebrow}>Implemented features</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
            Concrete backend and full-stack evidence
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The MVP focuses on secure retrieval-augmented document workflows:
            authentication, ownership checks, document processing, vector
            search, grounded answers, and auditable tool APIs.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {implementedFeatures.map((feature) => (
            <article key={feature.title} className={`${ui.subtleCard} p-6`}>
              <IconTile accent={feature.accent} icon={feature.icon} />
              <h3 className="mt-5 text-lg font-semibold text-[#0b1535]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/70">
        <div className={`${ui.container} py-12 sm:py-14`}>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className={ui.eyebrow}>Architecture</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
                Document-to-answer flow
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                DocuMind keeps the critical authorization boundary in the
                backend before documents are embedded, searched, summarized, or
                answered.
              </p>
            </div>
            <div className={`${ui.card} p-6`}>
              <div className="flex flex-wrap items-center gap-3">
                {architectureFlow.map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#10204b] shadow-sm">
                      {stage}
                    </span>
                    {index < architectureFlow.length - 1 ? (
                      <span className="text-sm font-semibold text-blue-700">
                        →
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Upload → Parse → Chunk → Embed → Store → Search → Answer → Cite
                → Audit
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-12 sm:py-14`}>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className={`${ui.card} p-7`}>
            <IconTile accent="emerald" icon="network" />
            <p className={`${ui.eyebrow} mt-5`}>Why agent-ready?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              A controlled knowledge layer for humans and agents
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Agent-ready matters because future assistants need reliable tools,
              not unrestricted database access. DocuMind is a controlled
              knowledge layer for both human users and future AI agents: the
              same authentication, owner-scoped retrieval, citations, and audit
              logging apply to UI actions and API tool calls.
            </p>
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              DocuMindは、人間のユーザーと将来のAIエージェントが同じ認証、
              所有者スコープ、引用、監査ログの下で社内文書を扱うための、
              制御されたナレッジレイヤーです。
            </p>
          </article>

          <article className={`${ui.card} p-7`}>
            <IconTile accent="blue" icon="check" />
            <p className={`${ui.eyebrow} mt-5`}>Try the demo</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              What reviewers should test
            </h2>
            <ol className="mt-5 grid gap-3">
              {demoSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Audit logs are stored server-side; from the UI, reviewers can
              verify protected access behavior by signing out and revisiting
              dashboard routes.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
