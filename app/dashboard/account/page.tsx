import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getOAuthProviderName } from "@/lib/auth/oauth-providers";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getCurrentDictionary, getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountPasswordForm } from "./account-password-form";

export async function generateMetadata() {
  const copy = await getCurrentDictionary();

  return buildPageMetadata({
    description: copy.account.body,
    title: copy.account.title,
  });
}

export default async function AccountPage() {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/account");
  }

  const user = await prisma.user.findUnique({
    select: {
      accounts: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          provider: true,
        },
      },
      email: true,
      name: true,
      passwordHash: true,
    },
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/dashboard/account");
  }

  const displayName = user.name ?? user.email ?? copy.common.userFallback;
  const authMethods = [
    ...(user.passwordHash ? [copy.account.passwordMethod] : []),
    ...user.accounts.map((account) => getOAuthProviderName(account.provider)),
  ];

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
              <Link href="/dashboard/audit-logs" className={ui.secondaryButton}>
                <Icon name="shield" className="h-4 w-4 text-blue-700" />
                {copy.common.auditLogs}
              </Link>
              <Link href="/dashboard/api-tokens" className={ui.secondaryButton}>
                <Icon name="network" className="h-4 w-4 text-blue-700" />
                {copy.common.apiTokens}
              </Link>
            </div>
          </div>

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>{copy.common.account}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.account.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.account.body}
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile accent="blue" icon="settings" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {copy.account.securityTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {copy.account.securityBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} grid gap-6 py-8 lg:grid-cols-[minmax(0,420px)_1fr]`}>
        <section className={`${ui.card} p-6`}>
          <h2 className="text-xl font-semibold text-[#080f2f]">
            {copy.account.profileTitle}
          </h2>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className={ui.label}>{copy.common.email}</dt>
              <dd className="mt-1 break-words text-sm leading-6 text-slate-700">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className={ui.label}>{copy.common.name}</dt>
              <dd className="mt-1 break-words text-sm leading-6 text-slate-700">
                {user.name ?? copy.account.noName}
              </dd>
            </div>
            <div>
              <dt className={ui.label}>{copy.account.authMethods}</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {authMethods.length > 0 ? (
                  authMethods.map((method) => (
                    <span
                      key={method}
                      className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                    >
                      {method}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-6 text-slate-600">
                    {copy.account.noAuthMethods}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <AccountPasswordForm
          copy={{
            ...copy.account,
            apiErrors: copy.apiErrors,
            hidePassword: copy.auth.hidePassword,
            newPassword: copy.auth.newPassword,
            passwordHelp: copy.auth.passwordHelp,
            showPassword: copy.auth.showPassword,
          }}
          hasPassword={Boolean(user.passwordHash)}
        />
      </section>
    </main>
  );
}
