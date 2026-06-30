"use client";

import { Icon, ui } from "@/components/ui";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ResetPasswordFormProps = {
  copy: {
    error: string;
    newPassword: string;
    passwordHelp: string;
    signIn: string;
    submit: string;
    submitting: string;
    success: string;
  };
  token: string;
};

type ResetPasswordResponse = {
  error?: string;
  message?: string;
};

export function ResetPasswordForm({ copy, token }: ResetPasswordFormProps) {
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
      setError(payload.error ?? copy.error);
      return;
    }

    form.reset();
    setMessage(
      payload.message ?? copy.success,
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div>
        <label htmlFor="password" className={ui.label}>
          {copy.newPassword}
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
          {copy.passwordHelp}
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
            {copy.signIn}
          </Link>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting || Boolean(message)}
        className={`${ui.primaryButton} w-full`}
      >
        <Icon name="lock" className="h-4 w-4" />
        {isSubmitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
