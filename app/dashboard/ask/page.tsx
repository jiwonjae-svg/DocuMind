import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
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
            <Link href="/dashboard/documents" className={ui.secondaryButton}>
              <Icon name="document" className="h-4 w-4 text-blue-700" />
              Documents
            </Link>
          </div>

          <div className={`${ui.card} grid gap-8 p-7 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>Grounded QA</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-[#080f2f]">
                Ask with source citations
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
                Questions are embedded on the server, matched against your own
                document chunks, and answered only from retrieved context.
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile accent="emerald" icon="shield" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                Retrieval guardrail
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Unsupported questions return an insufficient-information answer
                instead of invented facts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-10`}>
        <AskForm />
      </section>
    </main>
  );
}
