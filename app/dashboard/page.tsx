import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import Link from "next/link";

const workspaceCards = [
  {
    title: "Document management",
    body: "Upload, process, list, and delete only your own documents.",
    href: "/dashboard/documents",
    action: "Manage documents",
    icon: "document",
    accent: "blue",
  },
  {
    title: "Grounded question answering",
    body: "Ask questions over retrieved chunks and review source citations.",
    href: "/dashboard/ask",
    action: "Ask questions",
    icon: "question",
    accent: "emerald",
  },
] as const;

const roadmap = [
  {
    title: "EN, KO, and JA interface text",
    body: "Expand user-facing copy into a complete multilingual product pass.",
    icon: "team",
    accent: "violet",
  },
  {
    title: "Team access controls",
    body: "Add team and role boundaries after the single-owner MVP is stable.",
    icon: "shield",
    accent: "amber",
  },
] as const;

export default async function DashboardPage() {
  const session = await auth();
  const displayName = session?.user?.name ?? session?.user?.email ?? "User";

  return (
    <main className={ui.page}>
      <AppHeader userName={displayName}>
        <LogoutButton />
      </AppHeader>

      <section className={ui.gradientBand}>
        <div className={`${ui.container} py-10 sm:py-14`}>
          <div className={`${ui.card} grid gap-8 p-7 lg:grid-cols-[1fr_auto] lg:items-center`}>
            <div>
              <p className={ui.eyebrow}>Dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-[#080f2f]">
                Knowledge workspace
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
                Upload internal knowledge files, search ready document chunks,
                and ask grounded questions with citations in one protected
                workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <Link href="/dashboard/documents" className={ui.primaryButton}>
                <Icon name="document" className="h-4 w-4" />
                Manage documents
              </Link>
              <Link href="/dashboard/ask" className={ui.secondaryButton}>
                <Icon name="question" className="h-4 w-4 text-blue-700" />
                Ask questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-10`}>
        <div className="grid gap-6 lg:grid-cols-2">
          {workspaceCards.map((card) => (
            <article key={card.title} className={`${ui.subtleCard} p-6`}>
              <div className="flex items-start gap-5">
                <IconTile accent={card.accent} icon={card.icon} />
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-[#0b1535]">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {card.body}
                  </p>
                  <Link
                    href={card.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                  >
                    {card.action}
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <p className={ui.eyebrow}>MVP roadmap</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {roadmap.map((item) => (
              <article key={item.title} className={`${ui.subtleCard} p-6`}>
                <div className="flex items-start gap-5">
                  <IconTile accent={item.accent} icon={item.icon} />
                  <div>
                    <h2 className="text-lg font-semibold text-[#0b1535]">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
