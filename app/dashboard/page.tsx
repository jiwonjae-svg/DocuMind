import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

const nextSteps = [
  "EN, KO, and JA interface text",
  "Team access controls",
];

export default async function DashboardPage() {
  const session = await auth();
  const displayName = session?.user?.name ?? session?.user?.email ?? "User";

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
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Knowledge workspace
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Upload internal knowledge files, search ready document chunks, and
            ask grounded questions with citations.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Manage documents
            </Link>
            <Link
              href="/dashboard/ask"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
            >
              Ask questions
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">
              Document upload and management
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload, list, and delete your own documents.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">
              Grounded question answering
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ask questions over retrieved chunks and review source citations.
            </p>
          </div>
          {nextSteps.map((step) => (
            <div
              key={step}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-950">{step}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Planned for later MVP iterations.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
