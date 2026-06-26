"use client";

import { Icon, ui } from "@/components/ui";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
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
      setError("Use the demo email and password from your local environment.");
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
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="demo@documind.local"
          required
          className={`mt-2 ${ui.input}`}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className={ui.label}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="DocuMindDemo123!"
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
