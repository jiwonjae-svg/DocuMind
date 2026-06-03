import { auth } from "@/auth";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
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
  const callbackUrl = readParam(params.callbackUrl) ?? "/dashboard";

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
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_480px] lg:py-20`}>
          <div className="flex flex-col justify-center">
            <p className={ui.eyebrow}>Demo access</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              Sign in to a secure knowledge workspace
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Use the seeded demo account to review document management,
              semantic search, grounded answers, and agent-ready endpoints with
              owner-scoped access control.
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

          <div className={`${ui.card} self-center p-7`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              Sign in
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The demo credentials are prefilled for a quick portfolio review.
            </p>
            <LoginForm callbackUrl={callbackUrl} />
          </div>
        </div>
      </section>
    </main>
  );
}
