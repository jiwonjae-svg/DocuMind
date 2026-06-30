"use client";

import { Icon, ui } from "@/components/ui";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginFormProps = {
  callbackUrl: string;
  copy: {
    email: string;
    error: string;
    forgotPassword: string;
    password: string;
    submit: string;
    submitting: string;
  };
};

export function LoginForm({ callbackUrl, copy }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

      if (!result || result.error) {
      setError(copy.error);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label
          htmlFor="email"
          className={ui.label}
        >
          {copy.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`mt-2 ${ui.input}`}
        />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className={ui.label}
          >
            {copy.password}
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            {copy.forgotPassword}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`mt-2 ${ui.input}`}
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${ui.primaryButton} w-full`}
      >
        <Icon name="lock" className="h-4 w-4" />
        {isSubmitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
