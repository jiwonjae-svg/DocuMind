import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
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

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getNotice(params: Record<string, string | string[] | undefined>) {
  if (readParam(params.uploaded)) {
    if (readParam(params.processed) === "failed") {
      return {
        tone: "error",
        text: "Document uploaded, but text extraction failed.",
      };
    }

    return { tone: "success", text: "Document uploaded and processed." };
  }

  if (readParam(params.deleted)) {
    return { tone: "success", text: "Document deleted." };
  }

  const error = readParam(params.error);

  if (error === "missing-file") {
    return { tone: "error", text: "Choose a file before uploading." };
  }

  if (error === "not-found") {
    return { tone: "error", text: "Document not found." };
  }

  if (error) {
    return { tone: "error", text: error };
  }

  return null;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/documents");
  }

  const params = searchParams ? await searchParams : {};
  const notice = getNotice(params);
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
  const displayName = session.user.name ?? session.user.email ?? "User";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-slate-950">
            DocuMind
          </Link>
          <div className="flex items-center gap-3">
            <span className="max-w-40 truncate text-sm text-slate-600 sm:max-w-none">
              {displayName}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              Documents
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Upload text, Markdown, or PDF files for your own workspace.
            </p>
          </div>
          <Link
            href="/dashboard/ask"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
          >
            Ask questions
          </Link>
        </div>

        {notice ? (
          <div
            className={`mb-6 rounded-md border px-4 py-3 text-sm ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <form
            action="/api/documents"
            method="post"
            encType="multipart/form-data"
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <label
                htmlFor="file"
                className="text-sm font-medium text-slate-800"
              >
                Upload document
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                required
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-800"
              />
              <p className="mt-2 text-xs text-slate-500">
                Accepted formats: .txt, .md, .pdf. Maximum size: 10 MB.
              </p>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
              >
                Upload
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Uploaded documents
            </h2>
          </div>

          {documents.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-600">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-950">
                        {document.title}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyles[document.status]}`}
                      >
                        {document.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {document.originalName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatBytes(document.sizeBytes)} - {document.mimeType} -{" "}
                      {document._count.chunks} chunks -{" "}
                      {document.extractedCharCount} characters -{" "}
                      {document.createdAt.toLocaleDateString("en-US")}
                    </p>
                    {document.processingError ? (
                      <p className="mt-2 text-xs leading-5 text-red-700">
                        {document.processingError}
                      </p>
                    ) : null}
                  </div>
                  <form
                    action={`/api/documents/${document.id}/delete`}
                    method="post"
                    className="flex items-start md:justify-end"
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
