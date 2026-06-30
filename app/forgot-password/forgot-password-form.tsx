"use client";

import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ForgotPasswordResponse = {
  error?: string;
  message?: string;
  resetUrl?: string;
};

export function ForgotPasswordForm({
  copy,
}: {
  copy: {
    apiErrors: Record<string, string>;
    email: string;
    error: string;
    localResetLink: string;
    submit: string;
    submitting: string;
    success: string;
  };
}) {
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
      setError(lookupApiError(copy.apiErrors, payload.error, copy.error));
      return;
    }

    setMessage(copy.success);
    setResetUrl(payload.resetUrl ?? null);
  }

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
      className="mt-7 space-y-5"
    >
      <div>
        <label htmlFor="email" className={ui.label}>
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
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
        >
          <p className="font-semibold">{message}</p>
          {resetUrl ? (
            <Link
              href={resetUrl}
              className="mt-2 inline-flex font-semibold text-emerald-900 underline underline-offset-4"
            >
              {copy.localResetLink}
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
        {isSubmitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
