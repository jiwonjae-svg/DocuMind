import { auth } from "@/auth";
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
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-slate-950">
            DocuMind
          </Link>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
          >
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-md px-5 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            Demo access
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Sign in to DocuMind
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use the seeded demo user to access the protected dashboard.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
