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
    title: "Protected dashboard routes",
    body: "Server-side session checks redirect unauthenticated visitors before protected dashboard content is rendered.",
    icon: "lock",
    accent: "blue",
  },
  {
    title: "Demo authentication",
    body: "Auth.js credentials authentication provides a documented reviewer account while keeping session handling on the server.",
    icon: "team",
    accent: "emerald",
  },
  {
    title: "Document management",
    body: "Authenticated users can upload, process, list, and delete validated .txt, .md, and .pdf documents.",
    icon: "document",
    accent: "violet",
  },
  {
    title: "Owner-scoped data access",
    body: "Document reads, deletes, chunks, retrieval, and tool calls filter against the authenticated user's owner ID.",
    icon: "shield",
    accent: "blue",
  },
  {
    title: "Semantic search",
    body: "OpenAI embeddings and PostgreSQL pgvector rank relevant chunks through authenticated server routes and a dashboard search UI.",
    icon: "search",
    accent: "emerald",
  },
  {
    title: "Grounded answers with source citations",
    body: "Retrieved chunks constrain the answer prompt, and the UI returns source titles, chunk indexes, snippets, and scores.",
    icon: "question",
    accent: "violet",
  },
  {
    title: "Audit logging and review",
    body: "Login, upload, processing, delete, ask, and agent-tool actions create owner-scoped audit records visible in the dashboard.",
    icon: "check",
    accent: "blue",
  },
  {
    title: "Agent-ready API endpoint structure",
    body: "Authenticated tool routes expose search, answers with citations, and document summaries without bypassing application rules.",
    icon: "network",
    accent: "emerald",
  },
] as const;

const architectureFlow = [
  {
    title: "Upload",
    body: "Validate type, size, and file bytes before saving metadata.",
  },
  {
    title: "Parse",
    body: "Extract text server-side from TXT, Markdown, or PDF files.",
  },
  {
    title: "Chunk",
    body: "Split normalized text into bounded, indexed retrieval units.",
  },
  {
    title: "Embed",
    body: "Generate missing chunk vectors through the server-side OpenAI client.",
  },
  {
    title: "Store",
    body: "Persist documents, chunks, status, and vectors in PostgreSQL.",
  },
  {
    title: "Search",
    body: "Rank ready chunks with pgvector under the current owner ID.",
  },
  {
    title: "Answer",
    body: "Build a prompt constrained to the retrieved document context.",
  },
  {
    title: "Cite",
    body: "Return supporting titles, chunk indexes, and matched snippets.",
  },
  {
    title: "Audit",
    body: "Record security-relevant user and agent-tool actions.",
  },
] as const;

const plannedFeatures = [
  "Enterprise SSO and team/workspace RBAC",
  "Durable object storage and background processing",
  "Organization-wide admin audit review",
  "Full EN/KO/JA route-level localization",
  "MCP wrapper around the existing tool endpoints",
] as const;

const demoSteps = [
  "Sign in with the seeded demo account.",
  "Open Documents to review existing files or upload a short .txt or .md file.",
  "Run semantic search from Search and inspect matching chunks, snippets, and scores.",
  "Ask a grounded question using content from an uploaded or seeded document.",
  "Check the answer, citations, matched snippets, and insufficient-information behavior.",
  "Review owner-scoped audit log entries for your activity.",
] as const;

const repositoryUrl = "https://github.com/jiwonjae-svg/DocuMind";
const implementationUrl =
  `${repositoryUrl}/blob/main/README.md`;

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
          className={`${ui.container} grid min-w-0 grid-cols-1 gap-12 py-14 sm:py-18 lg:grid-cols-[0.95fr_1.05fr] lg:py-20`}
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
              文書処理、セマンティック検索、出典付き回答を安全に扱うための
              バックエンド重視のMVPです。
            </p>
            <div className="mt-5 max-w-2xl border-l-4 border-blue-600 bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-sm font-semibold leading-6 text-[#10204b]">
                Built with Next.js, TypeScript, PostgreSQL, Prisma, pgvector,
                Auth.js, OpenAI API, and Vercel.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Next.js / TypeScript / PostgreSQL / pgvector / OpenAI API
                を使用。
              </p>
            </div>
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
              <a
                href={implementationUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="View the DocuMind implementation README in the GitHub repository"
                className={`${ui.secondaryButton} w-full sm:w-auto`}
              >
                <Icon name="view" className="h-5 w-5 text-blue-700" />
                View implementation
              </a>
            </div>
          </div>

          <aside className={`${ui.card} min-w-0 p-7`}>
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
          <p className={ui.eyebrow}>Implemented / Available now</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
            Concrete backend and full-stack evidence
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The MVP focuses on secure retrieval-augmented document workflows:
            authentication, ownership checks, document processing, vector
            search, grounded answers, and auditable tool APIs. Everything in
            this section is implemented in the current demo; planned work is
            separated below.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
        <div
          className={`${ui.container} grid gap-8 py-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start`}
        >
          <div>
            <p className={ui.eyebrow}>Future / Planned only</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal text-[#080f2f]">
              Intentionally outside the current MVP
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              These items are planned for production hardening and are not
              implemented in the current demo.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {plannedFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 border-b border-slate-200 pb-3 text-sm leading-6 text-slate-600"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400"
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className={`${ui.container} py-12 sm:py-14`}>
          <div className="max-w-3xl">
            <p className={ui.eyebrow}>Architecture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              Upload → Parse → Chunk → Embed → Store → Search → Answer → Cite →
              Audit
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Authorization stays in the backend before documents are
              processed, embedded, searched, summarized, or used for answers.
            </p>
          </div>
          <ol className="mt-8 grid border-l border-t border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">
            {architectureFlow.map((stage, index) => (
              <li
                key={stage.title}
                className="min-h-40 border-b border-r border-slate-200 p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-blue-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-[#0b1535]">
                    {stage.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {stage.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-white/70">
        <div className={`${ui.container} py-12 sm:py-14`}>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className={`${ui.card} p-7`}>
            <IconTile accent="emerald" icon="network" />
            <p className={`${ui.eyebrow} mt-5`}>Why agent-ready?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              A controlled knowledge layer for humans and agents
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              DocuMind is not just a chat UI. It is a controlled knowledge layer
              for human users and future AI agents. Agents should reach
              internal knowledge through authenticated, owner-scoped, auditable
              API boundaries instead of bypassing application logic or reading
              the database directly.
            </p>
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              DocuMindは単なるチャットUIではありません。人と将来のAI
              エージェントが、認証・所有者スコープ・監査可能なAPI境界を
              通じて社内ナレッジへアクセスするための制御レイヤーです。
            </p>
          </article>

          <article className={`${ui.card} p-7`}>
            <IconTile accent="blue" icon="check" />
            <p className={`${ui.eyebrow} mt-5`}>Try the demo</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              What reviewers should test
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Use the flow below; each step is implemented in the current
              demo. Planned-only items, including MCP wrapping, team RBAC, and
              organization-wide audit review, are intentionally separated in
              the MVP scope section above.
            </p>
            <ul
              role="list"
              aria-label="Try the demo steps"
              className="mt-5 grid list-none gap-3 p-0"
            >
              {demoSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700"
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="sr-only">Step {index + 1}: </span>
                    {step}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Implemented now: an owner-scoped audit log view for the
              signed-in user. Planned only: organization-wide admin audit
              review.
            </p>
            <Link
              href="/login?callbackUrl=/dashboard/audit-logs"
              className={`${ui.primaryButton} mt-6 w-full sm:w-auto`}
            >
              <Icon name="compass" className="h-4 w-4" />
              Start demo
            </Link>
          </article>
        </div>
        </div>
      </section>
    </main>
  );
}
