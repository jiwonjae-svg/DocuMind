"use client";

import { Icon, ui } from "@/components/ui";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ResetPasswordFormProps = {
  token: string;
};

type ResetPasswordResponse = {
  error?: string;
  message?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/auth/reset-password", {
      body: JSON.stringify({
        password: String(formData.get("password") ?? ""),
        token,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response
      .json()
      .catch(() => ({}))) as ResetPasswordResponse;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to reset this password.");
      return;
    }

    form.reset();
    setMessage(
      payload.message ?? "Your password has been reset. Sign in again.",
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label htmlFor="password" className={ui.label}>
          New password
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
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          <p className="font-semibold">{message}</p>
          <Link
            href="/login"
            className="mt-2 inline-flex font-semibold text-emerald-900 underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting || Boolean(message)}
        className={`${ui.primaryButton} w-full`}
      >
        <Icon name="lock" className="h-4 w-4" />
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </button>
    </form>
  );
}
