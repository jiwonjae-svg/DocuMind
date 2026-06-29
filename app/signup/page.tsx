import { auth } from "@/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { normalizeLoginCallbackUrl } from "@/lib/auth/callback-url";
import { getEnabledOAuthProviders } from "@/lib/auth/oauth-providers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "./signup-form";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
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
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className={ui.primaryButton}
        >
          <Icon name="lock" className="h-4 w-4" />
          Sign in
        </Link>
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_480px] lg:py-16`}>
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className={ui.eyebrow}>Account setup</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              Create a private knowledge workspace
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Start with a password account or an enabled OAuth provider. New
              users get their own owner-scoped document library, search index,
              answers, and audit log records.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="lock" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Server-only secrets
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Password hashing and OAuth callbacks run on the server.
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Private by default
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Documents and answers are filtered by your user ID.
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              Sign up
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Create an account for your own document workspace. OAuth options
              appear when configured in the deployment environment.
            </p>
            {oauthProviders.length > 0 ? (
              <div className="mt-7">
                <OAuthButtons
                  callbackUrl={callbackUrl}
                  providers={oauthProviders}
                />
              </div>
            ) : null}
            <SignupForm callbackUrl={callbackUrl} />
            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
