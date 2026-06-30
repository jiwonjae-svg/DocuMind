"use client";

import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { useState } from "react";

type AcceptTeamInvitationCopy = {
  apiErrors: Record<string, string>;
  accepted: string;
  accepting: string;
  acceptInvitation: string;
  dashboard: string;
  fallbackError: string;
};

type AcceptTeamInvitationFormProps = {
  copy: AcceptTeamInvitationCopy;
  token: string;
};

type ApiResponse = {
  error?: string;
  message?: string;
};

async function readApiError(
  response: Response,
  apiErrors: Record<string, string>,
  fallback: string,
) {
  const payload = (await response.json().catch(() => null)) as ApiResponse | null;

  return lookupApiError(apiErrors, payload?.error, fallback);
}

export function AcceptTeamInvitationForm({
  copy,
  token,
}: AcceptTeamInvitationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function acceptInvitation() {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/team-invitations/accept", {
        body: JSON.stringify({ token }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, copy.apiErrors, copy.fallbackError),
        );
      }

      setIsAccepted(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : copy.fallbackError,
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isAccepted) {
    return (
      <div className="mt-7 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-800">
          {copy.accepted}
        </p>
        <Link href="/dashboard" className={`mt-4 ${ui.primaryButton}`}>
          <Icon name="arrow" className="h-4 w-4" />
          {copy.dashboard}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-7">
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      <button
        type="button"
        className={ui.primaryButton}
        disabled={isPending}
        onClick={() => void acceptInvitation()}
      >
        <Icon name="team" className="h-4 w-4" />
        {isPending ? copy.accepting : copy.acceptInvitation}
      </button>
    </div>
  );
}
