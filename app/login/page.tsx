import { auth } from "@/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { normalizeLoginCallbackUrl } from "@/lib/auth/callback-url";
import { getEnabledOAuthProviders } from "@/lib/auth/oauth-providers";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getCurrentDictionary, getCurrentI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata() {
  const copy = await getCurrentDictionary();

  return buildPageMetadata({
    description: copy.auth.loginBody,
    title: copy.common.login,
  });
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const { copy, locale } = await getCurrentI18n();
  const callbackUrl = normalizeLoginCallbackUrl(readParam(params.callbackUrl));
  const oauthProviders = getEnabledOAuthProviders();

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className={ui.page}>
      <AppHeader homeAriaLabel={copy.common.homeLink}>
        <LanguageSwitcher initialLocale={locale} />
        <Link href="/" className={ui.secondaryButton}>
          <Icon name="home" className="h-4 w-4 text-blue-700" />
          {copy.common.home}
        </Link>
        <Link
          href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className={ui.primaryButton}
        >
          <Icon name="team" className="h-4 w-4" />
          {copy.common.signup}
        </Link>
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_480px] lg:py-16`}>
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className={ui.eyebrow}>{copy.auth.serverSideAuth}</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              {copy.auth.loginTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {copy.auth.loginBody}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.auth.serverSideAuth}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.auth.serverSideAuthBody}
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="document" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.auth.ownerScopedData}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.auth.ownerScopedDataBody}
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.common.login}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.auth.emailPasswordDescription}
            </p>
            {oauthProviders.length > 0 ? (
              <div className="mt-7">
                <OAuthButtons
                  callbackUrl={callbackUrl}
                  copy={copy.oauth}
                  providers={oauthProviders}
                />
              </div>
            ) : null}
            <LoginForm
              callbackUrl={callbackUrl}
              copy={{
                email: copy.common.email,
                error: copy.auth.loginError,
                forgotPassword: copy.common.forgotPassword,
                hidePassword: copy.auth.hidePassword,
                password: copy.common.password,
                showPassword: copy.auth.showPassword,
                submit: copy.common.login,
                submitting: copy.auth.loginPending,
              }}
            />
            <p className="mt-5 text-center text-sm text-slate-600">
              {copy.auth.needAccount}{" "}
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                {copy.common.signup}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
