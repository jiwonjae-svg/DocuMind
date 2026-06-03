import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AskForm } from "./ask-form";

export default async function AskPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/ask");
  }

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
              Ask
            </h1>
          </div>
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
          >
            Documents
          </Link>
        </div>

        <AskForm />
      </section>
    </main>
  );
}
