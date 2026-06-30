import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getOrganizationAdminContext } from "@/lib/auth/rbac";
import { getDeploymentReadiness } from "@/lib/deployment/readiness";
import { formatCopy } from "@/lib/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getCurrentDictionary, getCurrentI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusClasses = {
  missing: "border-red-200 bg-red-50 text-red-700",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

const statusAccents = {
  missing: "red",
  ready: "emerald",
  warning: "amber",
} as const;

function readSummary(copy: Awaited<ReturnType<typeof getCurrentDictionary>>["readiness"], status: keyof typeof statusClasses) {
  if (status === "ready") {
    return copy.summaryReady;
  }

  if (status === "warning") {
    return copy.summaryWarning;
  }

  return copy.summaryMissing;
}

export async function generateMetadata() {
  const copy = await getCurrentDictionary();

  return buildPageMetadata({
    description: copy.readiness.body,
    title: copy.common.readiness,
  });
}

export default async function AdminReadinessPage() {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin/readiness");
  }

  const context = await getOrganizationAdminContext({
    userId: session.user.id,
  });
  const displayName =
    session.user.name ?? session.user.email ?? copy.common.userFallback;

  if (!context) {
    return (
      <main className={ui.page}>
        <AppHeader homeAriaLabel={copy.common.homeLink} userName={displayName}>
          <LanguageSwitcher initialLocale={locale} />
          <LogoutButton label={copy.common.logout} />
        </AppHeader>

        <section className={`${ui.container} py-10`}>
          <div className={`${ui.card} p-6`}>
            <IconTile accent="red" icon="shield" />
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.adminAudit.accessTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {copy.adminAudit.accessBody}
            </p>
            <Link href="/dashboard" className={`mt-6 ${ui.secondaryButton}`}>
              <Icon name="arrow" className="h-4 w-4 rotate-180 text-blue-700" />
              {copy.common.backToDashboard}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const readiness = getDeploymentReadiness();

  return (
    <main className={ui.page}>
      <AppHeader homeAriaLabel={copy.common.homeLink} userName={displayName}>
        <LanguageSwitcher initialLocale={locale} />
        <LogoutButton label={copy.common.logout} />
      </AppHeader>

      <section className={ui.gradientBand}>
        <div className={`${ui.container} py-6 sm:py-10`}>
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              {copy.common.backToDashboard}
            </Link>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link href="/dashboard/admin/audit-logs" className={ui.secondaryButton}>
                <Icon name="shield" className="h-4 w-4 text-blue-700" />
                {copy.common.adminAudit}
              </Link>
              <Link href="/dashboard/admin/teams" className={ui.secondaryButton}>
                <Icon name="team" className="h-4 w-4 text-blue-700" />
                {copy.teamAdmin.title}
              </Link>
              <Link href="/dashboard/documents" className={ui.secondaryButton}>
                <Icon name="document" className="h-4 w-4 text-blue-700" />
                {copy.common.documents}
              </Link>
            </div>
          </div>

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>{copy.common.readiness}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.readiness.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.readiness.body}
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile
                accent={statusAccents[readiness.status]}
                icon={readiness.status === "ready" ? "check" : "settings"}
              />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {context.organization.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {copy.readiness.organizationBody}
              </p>
              <p className="mt-3 text-sm font-semibold text-blue-700">
                {formatCopy(copy.readiness.checkCount, {
                  ready: readiness.readyCount,
                  total: readiness.totalCount,
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} grid gap-6 py-8 xl:grid-cols-[360px_1fr]`}>
        <aside className={`${ui.card} self-start p-6`}>
          <IconTile accent={statusAccents[readiness.status]} icon="shield" />
          <h2 className="mt-4 text-xl font-semibold text-[#080f2f]">
            {copy.readiness.statusLabels[readiness.status]}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {readSummary(copy.readiness, readiness.status)}
          </p>
          <div className="mt-5 grid gap-3">
            <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {formatCopy(copy.readiness.checkCount, {
                ready: readiness.readyCount,
                total: readiness.totalCount,
              })}
            </span>
            <span className="rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              {formatCopy(copy.readiness.warningCount, {
                count: readiness.warningCount,
              })}
            </span>
            <span className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {formatCopy(copy.readiness.missingCount, {
                count: readiness.missingCount,
              })}
            </span>
          </div>
        </aside>

        <section className={`${ui.card} overflow-hidden`}>
          <div className="border-b border-slate-200 px-6 py-5">
            <p className={ui.eyebrow}>{copy.common.readiness}</p>
            <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
              {copy.readiness.checksTitle}
            </h2>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            {readiness.checks.map((check) => {
              const checkCopy = copy.readiness.checks[check.id];

              return (
                <article
                  key={check.id}
                  className="rounded-lg border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[#0b1535]">
                        {checkCopy.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {checkCopy[check.message]}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClasses[check.status]}`}
                    >
                      {copy.readiness.statusLabels[check.status]}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
