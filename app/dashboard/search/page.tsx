import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchForm } from "./search-form";

export default async function SearchPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/search");
  }

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
              <Link href="/dashboard/ask" className={ui.secondaryButton}>
                <Icon name="question" className="h-4 w-4 text-blue-700" />
                Ask questions
              </Link>
              <Link href="/dashboard/audit-logs" className={ui.secondaryButton}>
                <Icon name="shield" className="h-4 w-4 text-blue-700" />
                Audit logs
              </Link>
            </div>
          </div>

          <div className={`${ui.card} grid gap-8 p-7 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>Semantic search</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-[#080f2f]">
                Search your ready document chunks
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
                Enter a natural-language query to retrieve the most relevant
                chunks from your own READY documents. OpenAI calls stay inside
                the server route.
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile accent="emerald" icon="search" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                Retrieval preview
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Results include document title, chunk index, snippet, and a
                similarity score for fast validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-10`}>
        <SearchForm />
      </section>
    </main>
  );
}
