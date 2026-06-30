import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();

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
              Reset access without exposing account details
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              DocuMind sends a one-time reset link for password accounts. The
              public response stays the same whether an address exists or not.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  One-time token
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Reset links expire and only hashed tokens are stored.
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="check" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  Audit trail
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Successful requests and password changes are recorded.
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} order-1 self-center p-6 sm:p-7 lg:order-2`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              Forgot password
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter the email for your password account. If the account can be
              reset, DocuMind will send instructions.
            </p>
            <ForgotPasswordForm />
            <p className="mt-5 text-center text-sm text-slate-600">
              Remember your password?{" "}
              <Link
                href="/login"
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
