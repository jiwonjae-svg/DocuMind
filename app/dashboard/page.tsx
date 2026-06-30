import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getCurrentDictionary } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const workspaceCardMeta = [
  {
    href: "/dashboard/documents",
    icon: "document",
    accent: "blue",
  },
  {
    href: "/dashboard/search",
    icon: "search",
    accent: "emerald",
  },
  {
    href: "/dashboard/ask",
    icon: "question",
    accent: "violet",
  },
  {
    href: "/dashboard/audit-logs",
    icon: "shield",
    accent: "amber",
  },
  {
    href: "/dashboard/admin/audit-logs",
    icon: "team",
    accent: "blue",
  },
  {
    href: "/dashboard/admin/teams",
    icon: "team",
    accent: "violet",
  },
] as const;

const roadmapMeta = [
  { icon: "team", accent: "violet" },
  { icon: "network", accent: "amber" },
] as const;

export default async function DashboardPage() {
  const session = await auth();
  const copy = await getCurrentDictionary();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const displayName =
    session?.user?.name ?? session?.user?.email ?? copy.common.userFallback;

  return (
    <main className={ui.page}>
      <AppHeader homeAriaLabel={copy.common.homeLink} userName={displayName}>
        <LanguageSwitcher />
        <LogoutButton label={copy.common.logout} />
      </AppHeader>

      <section className={ui.gradientBand}>
        <div className={`${ui.container} py-8 sm:py-10`}>
          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center`}>
            <div>
              <p className={ui.eyebrow}>{copy.common.dashboard}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.dashboard.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.dashboard.heroBody}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/dashboard/documents" className={ui.primaryButton}>
                <Icon name="document" className="h-4 w-4" />
                {copy.dashboard.cards[0][2]}
              </Link>
              <Link href="/dashboard/search" className={ui.secondaryButton}>
                <Icon name="search" className="h-4 w-4 text-blue-700" />
                {copy.common.search}
              </Link>
              <Link href="/dashboard/ask" className={ui.secondaryButton}>
                <Icon name="question" className="h-4 w-4 text-blue-700" />
                {copy.common.ask}
              </Link>
              <Link href="/dashboard/audit-logs" className={ui.secondaryButton}>
                <Icon name="shield" className="h-4 w-4 text-blue-700" />
                {copy.common.auditLogs}
              </Link>
              <Link href="/dashboard/admin/audit-logs" className={ui.secondaryButton}>
                <Icon name="team" className="h-4 w-4 text-blue-700" />
                {copy.common.adminAudit}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-8`}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {copy.dashboard.cards.map(([title, body, action], index) => {
            const card = workspaceCardMeta[index];

            return (
            <article key={title} className={`${ui.subtleCard} p-6`}>
              <div className="flex items-start gap-5">
                <IconTile accent={card.accent} icon={card.icon} />
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-[#0b1535]">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                  <Link
                    href={card.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                  >
                    {action}
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        <div className="mt-8">
          <p className={ui.eyebrow}>{copy.dashboard.roadmapEyebrow}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {copy.dashboard.roadmap.map(([title, body], index) => {
              const item = roadmapMeta[index];

              return (
              <article key={title} className={`${ui.subtleCard} p-6`}>
                <div className="flex items-start gap-5">
                  <IconTile accent={item.accent} icon={item.icon} />
                  <div>
                    <h2 className="text-lg font-semibold text-[#0b1535]">
                      {title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {body}
                    </p>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
