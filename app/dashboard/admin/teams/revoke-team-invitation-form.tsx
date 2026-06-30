"use client";

import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type RevokeTeamInvitationCopy = {
  apiErrors: Record<string, string>;
  cancel: string;
  confirmRevokeInvitation: string;
  fallbackError: string;
  revokeInvitation: string;
  revokeInvitationWarning: string;
  revokingInvitation: string;
};

type RevokeTeamInvitationFormProps = {
  copy: RevokeTeamInvitationCopy;
  invitationId: string;
  organizationId: string;
};

type ApiResponse = {
  error?: string;
};

async function readApiError(
  response: Response,
  apiErrors: Record<string, string>,
  fallback: string,
) {
  const payload = (await response.json().catch(() => null)) as ApiResponse | null;

  return lookupApiError(apiErrors, payload?.error, fallback);
}

export function RevokeTeamInvitationForm({
  copy,
  invitationId,
  organizationId,
}: RevokeTeamInvitationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const warningId = useId();

  async function handleRevoke() {
    setError(null);
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
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, copy.apiErrors, copy.fallbackError),
        );
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : copy.fallbackError,
      );
    } finally {
      setIsPending(false);
    }
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        className={`${ui.secondaryButton} h-9 px-3 text-xs`}
        onClick={() => setIsConfirming(true)}
      >
        <Icon name="trash" className="h-3.5 w-3.5 text-red-700" />
        {copy.revokeInvitation}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
      <p id={warningId} className="text-xs leading-5 text-red-800">
        {copy.revokeInvitationWarning}
      </p>
      {error ? (
        <p className="mt-2 text-xs font-semibold leading-5 text-red-800">
          {error}
        </p>
      ) : null}
      <div
        aria-describedby={warningId}
        className="mt-3 flex flex-wrap gap-2"
      >
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-[#10204b] transition hover:border-slate-400"
          disabled={isPending}
          onClick={() => {
            setError(null);
            setIsConfirming(false);
          }}
        >
          {copy.cancel}
        </button>
        <button
          type="button"
          className={`${ui.dangerButton} h-9 px-3 text-xs`}
          disabled={isPending}
          onClick={handleRevoke}
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
          {isPending ? copy.revokingInvitation : copy.confirmRevokeInvitation}
        </button>
      </div>
    </div>
  );
}
