import { auth } from "@/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { normalizeLoginCallbackUrl } from "@/lib/auth/callback-url";
import { getEnabledOAuthProviders } from "@/lib/auth/oauth-providers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const callbackUrl = normalizeLoginCallbackUrl(readParam(params.callbackUrl));
  const oauthProviders = getEnabledOAuthProviders();

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className={ui.page}>
      <AppHeader>
        <Link href="/" className={ui.secondaryButton}>
          <Icon name="home" className="h-4 w-4 text-blue-700" />
          Home
        </Link>
        <Link
          href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className={ui.primaryButton}
        >
          <Icon name="team" className="h-4 w-4" />
          Sign up
        </Link>
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_480px] lg:py-16`}>
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className={ui.eyebrow}>Secure access</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              Sign in to a secure knowledge workspace
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Use your workspace account or an enabled OAuth provider to access
              private document management, semantic search, grounded answers,
              and owner-scoped audit records.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Server-side auth
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Protected pages and API routes verify the current session.
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="document" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Owner-scoped data
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Documents, chunks, and answers stay scoped to one user.
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              Sign in
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your email and password. If OAuth is configured for this
              deployment, you can continue with a connected provider.
            </p>
            {oauthProviders.length > 0 ? (
              <div className="mt-7">
                <OAuthButtons
                  callbackUrl={callbackUrl}
                  providers={oauthProviders}
                />
              </div>
            ) : null}
            <LoginForm callbackUrl={callbackUrl} />
            <p className="mt-5 text-center text-sm text-slate-600">
              Need an account?{" "}
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
