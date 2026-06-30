"use client";

import { PasswordField } from "@/components/auth/password-field";
import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { FormEvent, useState } from "react";

type AccountPasswordFormCopy = {
  apiErrors: Record<string, string>;
  changePassword: string;
  changingPassword: string;
  confirmNewPassword: string;
  currentPassword: string;
  fallbackError: string;
  passwordUnavailable: string;
  successChanged: string;
  updateBody: string;
  updateTitle: string;
  hidePassword: string;
  newPassword: string;
  passwordHelp: string;
  showPassword: string;
  requestPasswordSetup: string;
};

type AccountPasswordFormProps = {
  copy: AccountPasswordFormCopy;
  hasPassword: boolean;
  passwordSetupHref: string;
};

type PasswordChangeResponse = {
  error?: string;
  message?: string;
};

async function readPasswordChangeResponse(response: Response) {
  return (await response.json().catch(() => null)) as PasswordChangeResponse | null;
}

export function AccountPasswordForm({
  copy,
  hasPassword,
  passwordSetupHref,
}: AccountPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    try {
      const response = await fetch("/api/account/password", {
        body: JSON.stringify({
          confirmPassword,
          currentPassword,
          newPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = await readPasswordChangeResponse(response);

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      form.reset();
      setSuccess(copy.successChanged);
    } catch (changeError) {
      setError(
        changeError instanceof Error ? changeError.message : copy.fallbackError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={`${ui.card} p-6`}>
      <h2 className="text-xl font-semibold text-[#080f2f]">
        {copy.updateTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {hasPassword ? copy.updateBody : copy.passwordUnavailable}
      </p>

      {hasPassword ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <PasswordField
            autoComplete="current-password"
            hideLabel={copy.hidePassword}
            label={copy.currentPassword}
            name="currentPassword"
            showLabel={copy.showPassword}
          />
          <PasswordField
            autoComplete="new-password"
            help={copy.passwordHelp}
            hideLabel={copy.hidePassword}
            label={copy.newPassword}
            minLength={12}
            name="newPassword"
            showLabel={copy.showPassword}
          />
          <PasswordField
            autoComplete="new-password"
            hideLabel={copy.hidePassword}
            label={copy.confirmNewPassword}
            minLength={12}
            name="confirmPassword"
            showLabel={copy.showPassword}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${ui.primaryButton} w-full sm:w-auto`}
          >
            <Icon name="lock" className="h-4 w-4" />
            {isSubmitting ? copy.changingPassword : copy.changePassword}
          </button>
        </form>
      ) : (
        <Link
          href={passwordSetupHref}
          className={`${ui.primaryButton} mt-5 w-full sm:w-auto`}
        >
          <Icon name="lock" className="h-4 w-4" />
          {copy.requestPasswordSetup}
        </Link>
      )}
    </section>
  );
}
