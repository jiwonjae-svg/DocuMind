import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { buildAuditLogOwnerWhere } from "@/lib/audit/access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const auditActionLabels: Record<string, string> = {
  agent_tool_ask_with_citations: "Agent ask with citations",
  agent_tool_search_documents: "Agent document search",
  agent_tool_summarize_document: "Agent document summary",
  demo_user_seeded: "Demo user seeded",
  document_search: "Document search",
  document_delete: "Document deleted",
  document_process_failed: "Document processing failed",
  document_process_ready: "Document processing ready",
  document_upload: "Document uploaded",
  question_ask: "Question asked",
  user_login: "User signed in",
};

function formatAction(action: string) {
  return auditActionLabels[action] ?? action.replaceAll("_", " ");
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.length > 80 ? `${value.slice(0, 77)}...` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  return JSON.stringify(value);
}

function formatMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const entries = Object.entries(metadata)
    .map(([key, value]) => [key, formatMetadataValue(value)] as const)
    .filter(([, value]) => value.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
}

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
        <div className={`${ui.container} py-10 sm:py-14`}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              Back to dashboard
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row">
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

          <div className={`${ui.card} grid gap-8 p-7 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>Audit logs</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-[#080f2f]">
                Review your account activity
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
                This view shows only audit records created by the signed-in
                user. It helps reviewers verify that document, search, ask, and
                agent tool actions are recorded without exposing logs from other
                users.
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
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

      <section className={`${ui.container} py-10`}>
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
                const metadata = formatMetadata(log.metadata);

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
                          {formatAction(log.action)}
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
                      {formatTimestamp(log.createdAt)}
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
