import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { buildAuditLogOwnerWhere } from "@/lib/audit/access";
import { formatAuditMetadata } from "@/lib/audit/formatting";
import { formatAuditAction, formatAuditTimestamp } from "@/lib/audit/labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuditLogsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/audit-logs");
  }

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    where: buildAuditLogOwnerWhere(session.user.id),
    select: {
      action: true,
      createdAt: true,
      id: true,
      metadata: true,
      resourceId: true,
      resourceType: true,
    },
  });
  const displayName = session.user.name ?? session.user.email ?? "User";

  return (
    <main className={ui.page}>
      <AppHeader userName={displayName}>
        <LogoutButton />
      </AppHeader>

      <section className={ui.gradientBand}>
        <div className={`${ui.container} py-6 sm:py-10`}>
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              Back to dashboard
            </Link>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link href="/dashboard/documents" className={ui.secondaryButton}>
                <Icon name="document" className="h-4 w-4 text-blue-700" />
                Documents
              </Link>
              <Link href="/dashboard/search" className={ui.secondaryButton}>
                <Icon name="search" className="h-4 w-4 text-blue-700" />
                Search
              </Link>
              <Link href="/dashboard/ask" className={ui.secondaryButton}>
                <Icon name="question" className="h-4 w-4 text-blue-700" />
                Ask questions
              </Link>
            </div>
          </div>

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>Audit logs</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                Review your account activity
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                This view shows only audit records created by the signed-in
                user. It helps you verify document, search, ask, and agent tool
                activity without exposing logs from other users.
              </p>
            </div>

            <div className={`${ui.subtleCard} hidden p-5 lg:block`}>
              <IconTile accent="violet" icon="shield" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                Owner-scoped visibility
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The query is filtered by the current session user before any
                audit records are rendered.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-4 sm:py-8`}>
        <div className={`${ui.card} overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={ui.eyebrow}>Latest activity</p>
              <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
                Most recent audit events
              </h2>
            </div>
            <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {auditLogs.length} shown
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="grid place-items-center px-6 py-14 text-center">
              <IconTile accent="violet" icon="shield" />
              <h3 className="mt-4 text-lg font-semibold text-[#0b1535]">
                No audit events yet
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Upload a document, run a search, ask a question, or use an
                agent-ready tool endpoint to create owner-scoped audit records.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {auditLogs.map((log) => {
                const metadata = formatAuditMetadata(log.metadata);

                return (
                  <article
                    key={log.id}
                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto]"
                  >
                    <div className="flex min-w-0 gap-4">
                      <IconTile
                        accent="violet"
                        icon="check"
                        className="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[#0b1535]">
                          {formatAuditAction(log.action)}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {log.resourceType}
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
                      {formatAuditTimestamp(log.createdAt)}
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
