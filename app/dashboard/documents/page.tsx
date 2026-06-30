import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getDocumentOperationNotice } from "@/lib/documents/notices";
import { formatStoredDocumentProcessingError } from "@/lib/documents/processing-errors";
import { formatCopy, lookupCopy } from "@/lib/i18n/dictionaries";
import { getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

type DocumentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusStyles = {
  UPLOADED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  READY: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/documents");
  }

  const params = searchParams ? await searchParams : {};
  const notice = getDocumentOperationNotice(params);
  const documents = await prisma.document.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      originalName: true,
      processingError: true,
      extractedCharCount: true,
      mimeType: true,
      sizeBytes: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          chunks: true,
        },
      },
    },
  });
  const displayName =
    session.user.name ?? session.user.email ?? copy.common.userFallback;

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
            </div>
          </div>

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_380px]`}>
            <div>
              <p className={ui.eyebrow}>{copy.common.documents}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.documents.cardTitle}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.documents.cardBody}
              </p>
            </div>

            <div className={`${ui.subtleCard} hidden p-5 lg:block`}>
              <IconTile accent="blue" icon="upload" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {copy.documents.storageTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {copy.documents.storageBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-4 sm:py-8`}>
        {notice ? (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {lookupCopy(copy.documents.notices, notice.text)}
          </div>
        ) : null}

        <div className={`${ui.card} p-6`}>
          <form
            action="/api/documents"
            method="post"
            encType="multipart/form-data"
            className="grid gap-5 md:grid-cols-[1fr_auto]"
          >
            <div>
              <label htmlFor="file" className={ui.label}>
                {copy.documents.uploadDocument}
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                required
                className={`mt-2 block ${ui.input} file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700`}
              />
              <p className="mt-2 text-xs text-slate-500">
                {copy.documents.acceptedFormats}
              </p>
            </div>
            <div className="flex items-end">
              <button type="submit" className={`${ui.primaryButton} w-full md:w-auto`}>
                <Icon name="upload" className="h-4 w-4" />
                {copy.documents.upload}
              </button>
            </div>
          </form>
        </div>

        <div className={`${ui.card} mt-6 overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={ui.eyebrow}>{copy.documents.library}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
                {copy.documents.uploadedDocuments}
              </h2>
            </div>
            <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {formatCopy(copy.documents.countLabel, {
                count: documents.length,
              })}
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="grid place-items-center px-6 py-14 text-center">
              <IconTile accent="blue" icon="document" />
              <h3 className="mt-4 text-lg font-semibold text-[#0b1535]">
                {copy.documents.emptyTitle}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                {copy.documents.emptyBody}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {documents.map((document) => {
                const processingError = formatStoredDocumentProcessingError(
                  document.processingError,
                );
                const processingErrorText = processingError
                  ? lookupCopy(copy.documents.processingErrors, processingError)
                  : null;

                return (
                  <div
                    key={document.id}
                    className="grid gap-5 px-6 py-5 lg:grid-cols-[1fr_auto]"
                  >
                    <div className="flex gap-4">
                      <IconTile
                        accent="blue"
                        icon="document"
                        className="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-[#0b1535]">
                            {document.title}
                          </h3>
                          <span
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[document.status]}`}
                          >
                            {copy.documents.status[document.status]}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-sm text-slate-600">
                          {document.originalName}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {formatBytes(document.sizeBytes)} / {document.mimeType} /{" "}
                          {document._count.chunks} {copy.documents.chunks} /{" "}
                          {document.extractedCharCount} {copy.documents.characters} /{" "}
                          {document.createdAt.toLocaleDateString(locale)}
                        </p>
                        {processingErrorText ? (
                          <p className="mt-2 text-xs leading-5 text-red-700">
                            {processingErrorText}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <form
                      action={`/api/documents/${document.id}/delete`}
                      method="post"
                      className="flex items-start lg:justify-end"
                    >
                      <button type="submit" className={ui.dangerButton}>
                        <Icon name="trash" className="h-4 w-4" />
                        {copy.common.delete}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
