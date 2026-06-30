import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getCurrentDictionary, getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiTokenManager } from "./api-token-manager";

export async function generateMetadata() {
  const copy = await getCurrentDictionary();

  return buildPageMetadata({
    description: copy.apiTokens.body,
    title: copy.apiTokens.title,
  });
}

export default async function ApiTokensPage() {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/api-tokens");
  }

  const apiTokens = await prisma.userApiToken.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
      id: true,
      lastUsedAt: true,
      name: true,
    },
    where: {
      revokedAt: null,
      userId: session.user.id,
    },
  });
  const displayName =
    session.user.name ?? session.user.email ?? copy.common.userFallback;

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
              <p className={ui.eyebrow}>{copy.common.apiTokens}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.apiTokens.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.apiTokens.body}
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile accent="emerald" icon="network" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {copy.apiTokens.mcpEndpoint}
              </h2>
              <code className="mt-3 block overflow-x-auto rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-100">
                POST /api/mcp
              </code>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {copy.apiTokens.bearerUsage}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} py-8`}>
        <ApiTokenManager
          copy={{ ...copy.apiTokens, apiErrors: copy.apiErrors }}
          initialTokens={apiTokens.map((token) => ({
            createdAt: token.createdAt.toISOString(),
            id: token.id,
            lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
            name: token.name,
          }))}
          locale={locale}
        />
      </section>
    </main>
  );
}
