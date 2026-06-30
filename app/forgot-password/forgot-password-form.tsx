"use client";

import { Icon, ui } from "@/components/ui";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ForgotPasswordResponse = {
  error?: string;
  message?: string;
  resetUrl?: string;
};

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setResetUrl(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response
      .json()
      .catch(() => ({}))) as ForgotPasswordResponse;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to request a password reset.");
      return;
    }

    setMessage(
      payload.message ??
        "If an account exists, password reset instructions have been sent.",
    );
    setResetUrl(payload.resetUrl ?? null);
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="mt-7 space-y-5">
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
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          <p className="font-semibold">{message}</p>
          {resetUrl ? (
            <Link
              href={resetUrl}
              className="mt-2 inline-flex font-semibold text-emerald-900 underline underline-offset-4"
            >
              Open local reset link
            </Link>
          ) : null}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${ui.primaryButton} w-full`}
      >
        <Icon name="lock" className="h-4 w-4" />
        {isSubmitting ? "Sending instructions..." : "Send reset instructions"}
      </button>
    </form>
  );
}
