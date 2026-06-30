import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const token = readParam(params.token)?.trim() ?? "";

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className={ui.page}>
      <AppHeader>
        <LanguageSwitcher />
        <Link href="/" className={ui.secondaryButton}>
          <Icon name="home" className="h-4 w-4 text-blue-700" />
          Home
        </Link>
        <Link href="/login" className={ui.primaryButton}>
          <Icon name="lock" className="h-4 w-4" />
          Sign in
        </Link>
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_480px] lg:py-16`}>
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className={ui.eyebrow}>Account recovery</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              Set a new password for DocuMind
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Reset links are single-use and expire quickly. After a successful
              reset, sign in again with the new password.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="lock" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Password account
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This flow updates only accounts that use password sign-in.
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Server-side update
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The new password is hashed before it is stored.
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              Reset password
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Choose a new password with at least 12 characters.
            </p>
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="mt-7 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                <p className="font-semibold">
                  This reset link is missing its token.
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-2 inline-flex font-semibold text-red-800 underline underline-offset-4"
                >
                  Request a new link
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
