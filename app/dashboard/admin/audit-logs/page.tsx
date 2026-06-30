import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { formatAuditMetadata } from "@/lib/audit/formatting";
import { formatAuditAction, formatAuditTimestamp } from "@/lib/audit/labels";
import {
  buildOrganizationAuditLogWhere,
  getOrganizationAdminContext,
} from "@/lib/auth/rbac";
import { formatCopy } from "@/lib/i18n/dictionaries";
import { getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

type AdminAuditLogsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatMemberName(member: {
  user: {
    email: string;
    name: string | null;
  };
}) {
  return member.user.name ?? member.user.email;
}

export default async function AdminAuditLogsPage({
  searchParams,
}: AdminAuditLogsPageProps) {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin/audit-logs");
  }

  const params = searchParams ? await searchParams : {};
  const context = await getOrganizationAdminContext({
    organizationId: readParam(params.organizationId),
    userId: session.user.id,
  });
  const displayName =
    session.user.name ?? session.user.email ?? copy.common.userFallback;

  if (!context) {
    return (
      <main className={ui.page}>
        <AppHeader userName={displayName}>
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

  const members = context.organization.memberships;
  const memberUserIds = members.map((member) => member.userId);
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      action: true,
      actor: {
        select: {
          email: true,
          id: true,
          name: true,
        },
      },
      actorId: true,
      createdAt: true,
      id: true,
      metadata: true,
      resourceId: true,
      resourceType: true,
    },
    take: 100,
    where: buildOrganizationAuditLogWhere(memberUserIds),
  });

  return (
    <main className={ui.page}>
      <AppHeader userName={displayName}>
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
              <Link href="/dashboard/audit-logs" className={ui.secondaryButton}>
                <Icon name="shield" className="h-4 w-4 text-blue-700" />
                {copy.adminAudit.myAuditLogs}
              </Link>
              <Link href="/dashboard/documents" className={ui.secondaryButton}>
                <Icon name="document" className="h-4 w-4 text-blue-700" />
                {copy.common.documents}
              </Link>
            </div>
          </div>

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>{copy.common.adminAudit}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {context.organization.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.adminAudit.body}
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile accent="amber" icon="team" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {copy.adminAudit.adminRole}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {formatCopy(copy.adminAudit.roleBody, {
                  role: copy.adminAudit.organizationRoles[context.role],
                })}
              </p>
              <p className="mt-3 text-sm font-semibold text-blue-700">
                {formatCopy(copy.adminAudit.count, {
                  events: auditLogs.length,
                  members: members.length,
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} grid gap-6 py-4 sm:py-8 xl:grid-cols-[360px_1fr]`}>
        <aside className={`${ui.card} self-start overflow-hidden`}>
          <div className="border-b border-slate-200 px-6 py-5">
            <p className={ui.eyebrow}>{copy.adminAudit.rbac}</p>
            <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
              {copy.adminAudit.membersAndTeams}
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {members.map((member) => (
              <article key={member.userId} className="px-6 py-5">
                <h3 className="truncate text-sm font-semibold text-[#0b1535]">
                  {formatMemberName(member)}
                </h3>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {member.user.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {copy.adminAudit.memberRolePrefix}{" "}
                    {copy.adminAudit.organizationRoles[member.role]}
                  </span>
                  {member.teamRoles.map((teamRole) => (
                    <span
                      key={`${teamRole.team.id}-${teamRole.role}`}
                      className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    >
                      {teamRole.team.name}{" "}
                      {copy.adminAudit.teamRoles[teamRole.role]}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className={`${ui.card} overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={ui.eyebrow}>{copy.audit.latest}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
                {copy.adminAudit.latestEvents}
              </h2>
            </div>
            <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {formatCopy(copy.audit.countShown, { count: auditLogs.length })}
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="grid place-items-center px-6 py-14 text-center">
              <IconTile accent="amber" icon="shield" />
              <h3 className="mt-4 text-lg font-semibold text-[#0b1535]">
                {copy.adminAudit.emptyTitle}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                {copy.adminAudit.emptyBody}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {auditLogs.map((log) => {
                const metadata = formatAuditMetadata(log.metadata);
                const actorName = log.actor
                  ? (log.actor.name ?? log.actor.email)
                  : copy.adminAudit.unknownActor;

                return (
                  <article
                    key={log.id}
                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto]"
                  >
                    <div className="flex min-w-0 gap-4">
                      <IconTile
                        accent="amber"
                        icon="check"
                        className="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[#0b1535]">
                          {formatAuditAction(log.action, locale)}
                        </h3>
                        <p className="mt-2 break-words text-sm text-slate-600">
                          {actorName} / {log.resourceType}
                          {log.resourceId ? ` / ${log.resourceId}` : ""}
                        </p>
                        {metadata ? (
                          <p className="mt-2 break-words text-xs leading-5 text-slate-500">
                            {metadata}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <time
                      dateTime={log.createdAt.toISOString()}
                      className="text-sm font-medium text-slate-500 lg:text-right"
                    >
                      {formatAuditTimestamp(log.createdAt, locale)}
                    </time>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
