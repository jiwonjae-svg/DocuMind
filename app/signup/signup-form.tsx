"use client";

import { Icon, ui } from "@/components/ui";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignupFormProps = {
  callbackUrl: string;
};

type SignupResponse = {
  error?: string;
};

export function SignupForm({ callbackUrl }: SignupFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const response = await fetch("/api/auth/signup", {
      body: JSON.stringify({
        email,
        name: String(formData.get("name") ?? ""),
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json().catch(() => ({}))) as SignupResponse;

    if (!response.ok) {
      setIsSubmitting(false);
      setError(payload.error ?? "Unable to create the account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      setError("Account created. Sign in with your new password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label htmlFor="name" className={ui.label}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={`mt-2 ${ui.input}`}
        />
      </div>
      <div>
        <label htmlFor="email" className={ui.label}>
          Email
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
        <label htmlFor="password" className={ui.label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={`mt-2 ${ui.input}`}
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Use at least 12 characters.
        </p>
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
        <Icon name="team" className="h-4 w-4" />
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
