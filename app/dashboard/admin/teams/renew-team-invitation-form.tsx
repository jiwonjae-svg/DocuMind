"use client";

import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RenewTeamInvitationCopy = {
  apiErrors: Record<string, string>;
  fallbackError: string;
  invitationLink: string;
  renewInvitation: string;
  renewingInvitation: string;
  successInvitationRenewed: string;
  successInvitationRenewedWithEmail: string;
};

type RenewTeamInvitationFormProps = {
  copy: RenewTeamInvitationCopy;
  invitationId: string;
  organizationId: string;
};

type ApiResponse = {
  emailSent?: boolean;
  error?: string;
  inviteUrl?: string;
};

async function readApiPayload(response: Response) {
  return (await response.json().catch(() => null)) as ApiResponse | null;
}

export function RenewTeamInvitationForm({
  copy,
  invitationId,
  organizationId,
}: RenewTeamInvitationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRenew() {
    setError(null);
    setInviteUrl(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/admin/team-invitations", {
        body: JSON.stringify({
          invitationId,
          organizationId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = await readApiPayload(response);

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      setInviteUrl(typeof payload?.inviteUrl === "string" ? payload.inviteUrl : null);
      setSuccess(
        payload?.emailSent
          ? copy.successInvitationRenewedWithEmail
          : copy.successInvitationRenewed,
      );
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : copy.fallbackError,
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        className={`${ui.secondaryButton} h-9 px-3 text-xs`}
        disabled={isPending}
        onClick={handleRenew}
      >
        <Icon name="arrow" className="h-3.5 w-3.5 text-blue-700" />
        {isPending ? copy.renewingInvitation : copy.renewInvitation}
      </button>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-800">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold leading-5 text-emerald-800">
          {success}
        </p>
      ) : null}
      {inviteUrl ? (
        <div>
          <label
            htmlFor={`renewed-invite-url-${invitationId}`}
            className="text-xs font-semibold text-slate-600"
          >
            {copy.invitationLink}
          </label>
          <input
            id={`renewed-invite-url-${invitationId}`}
            readOnly
            value={inviteUrl}
            className={`mt-1 ${ui.input} text-xs`}
          />
        </div>
      ) : null}
    </div>
  );
}
