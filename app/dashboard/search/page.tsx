import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { buildReadableDocumentsWhere } from "@/lib/documents/access";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getCurrentDictionary, getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchForm } from "./search-form";

export async function generateMetadata() {
  const copy = await getCurrentDictionary();

  return buildPageMetadata({
    description: copy.searchPage.body,
    title: copy.common.search,
  });
}

export default async function SearchPage() {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/search");
  }

  const displayName =
    session.user.name ?? session.user.email ?? copy.common.userFallback;
  const readyChunkDocumentCount = await prisma.document.count({
    where: {
      AND: [
        buildReadableDocumentsWhere(session.user.id),
        {
          chunks: {
            some: {},
          },
          status: "READY",
        },
      ],
    },
  });

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
              <Link href="/dashboard/documents" className={ui.secondaryButton}>
                <Icon name="document" className="h-4 w-4 text-blue-700" />
                {copy.common.documents}
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

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>{copy.common.search}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.searchPage.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.searchPage.body}
              </p>
            </div>

            <div className={`${ui.subtleCard} hidden p-5 lg:block`}>
              <IconTile accent="emerald" icon="search" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {copy.searchPage.previewTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {copy.searchPage.previewBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-4 sm:py-8`}>
        <SearchForm
          copy={{ ...copy.searchForm, apiErrors: copy.apiErrors }}
          hasReadyChunks={readyChunkDocumentCount > 0}
        />
      </section>
    </main>
  );
}
