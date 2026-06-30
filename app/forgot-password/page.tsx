import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getCurrentDictionary } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();
  const copy = await getCurrentDictionary();

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
              {copy.auth.forgotTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {copy.auth.forgotBody}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.auth.oneTimeToken}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.auth.oneTimeTokenBody}
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="check" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.auth.auditTrail}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.auth.auditTrailBody}
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.common.forgotPassword}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.auth.forgotFormBody}
            </p>
            <ForgotPasswordForm
              copy={{
                apiErrors: copy.apiErrors,
                email: copy.common.email,
                error: copy.auth.forgotError,
                localResetLink: copy.auth.localResetLink,
                submit: copy.auth.forgotSubmit,
                submitting: copy.auth.forgotSubmitPending,
                success: copy.auth.forgotSuccess,
              }}
            />
            <p className="mt-5 text-center text-sm text-slate-600">
              {copy.auth.rememberPassword}{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                {copy.common.login}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
