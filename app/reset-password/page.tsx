import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getCurrentDictionary } from "@/lib/i18n/server";
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
  const copy = await getCurrentDictionary();
  const token = readParam(params.token)?.trim() ?? "";

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className={ui.page}>
      <AppHeader homeAriaLabel={copy.common.homeLink}>
        <LanguageSwitcher />
        <Link href="/" className={ui.secondaryButton}>
          <Icon name="home" className="h-4 w-4 text-blue-700" />
          {copy.common.home}
        </Link>
        <Link href="/login" className={ui.primaryButton}>
          <Icon name="lock" className="h-4 w-4" />
          {copy.common.login}
        </Link>
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_480px] lg:py-16`}>
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className={ui.eyebrow}>{copy.auth.accountRecovery}</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              {copy.auth.resetTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {copy.auth.resetBody}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="lock" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.auth.passwordAccount}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.auth.passwordAccountBody}
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.auth.serverSideUpdate}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.auth.serverSideUpdateBody}
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.common.resetPassword}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.auth.resetFormBody}
            </p>
            {token ? (
              <ResetPasswordForm
                copy={{
                  apiErrors: copy.apiErrors,
                  error: copy.auth.resetError,
                  hidePassword: copy.auth.hidePassword,
                  newPassword: copy.auth.newPassword,
                  passwordHelp: copy.auth.passwordHelp,
                  showPassword: copy.auth.showPassword,
                  signIn: copy.common.login,
                  submit: copy.common.resetPassword,
                  submitting: copy.auth.resetPending,
                  success: copy.auth.resetComplete,
                }}
                token={token}
              />
            ) : (
              <div className="mt-7 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                <p className="font-semibold">
                  {copy.auth.resetMissing}
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-2 inline-flex font-semibold text-red-800 underline underline-offset-4"
                >
                  {copy.auth.resetRequestNew}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
