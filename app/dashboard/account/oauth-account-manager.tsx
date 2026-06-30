"use client";

import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import { useState } from "react";

type OAuthAccount = {
  id: string;
  providerName: string;
};

type OAuthAccountManagerCopy = {
  apiErrors: Record<string, string>;
  fallbackError: string;
  noOAuthAccounts: string;
  oauthConnectionsBody: string;
  oauthConnectionsTitle: string;
  removeOAuth: string;
  removingOAuth: string;
  successOAuthRemoved: string;
};

type OAuthAccountManagerProps = {
  accounts: OAuthAccount[];
  copy: OAuthAccountManagerCopy;
  hasPassword: boolean;
};

type OAuthAccountResponse = {
  error?: string;
  message?: string;
};

async function readOAuthAccountResponse(response: Response) {
  return (await response.json().catch(() => null)) as OAuthAccountResponse | null;
}

export function OAuthAccountManager({
  accounts,
  copy,
  hasPassword,
}: OAuthAccountManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [removedAccountIds, setRemovedAccountIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [success, setSuccess] = useState<string | null>(null);
  const visibleAccounts = accounts.filter(
    (account) => !removedAccountIds.has(account.id),
  );
  const canRemoveVisibleOAuth = hasPassword || visibleAccounts.length > 1;

  async function removeAccount(accountId: string) {
    setError(null);
    setSuccess(null);
    setPendingAccountId(accountId);

    try {
      const response = await fetch("/api/account/oauth-accounts", {
        body: JSON.stringify({
          accountId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = await readOAuthAccountResponse(response);

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      setRemovedAccountIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(accountId);

        return nextIds;
      });
      setSuccess(copy.successOAuthRemoved);
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : copy.fallbackError,
      );
    } finally {
      setPendingAccountId(null);
    }
  }

  return (
    <section className={`${ui.card} p-6`}>
      <h2 className="text-xl font-semibold text-[#080f2f]">
        {copy.oauthConnectionsTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {copy.oauthConnectionsBody}
      </p>

      {visibleAccounts.length === 0 ? (
        <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          {copy.noOAuthAccounts}
        </p>
      ) : (
        <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {visibleAccounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0b1535]">
                  {account.providerName}
                </p>
              </div>
              <button
                type="button"
                disabled={!canRemoveVisibleOAuth || pendingAccountId !== null}
                onClick={() => void removeAccount(account.id)}
                className={`${ui.dangerButton} w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <Icon name="trash" className="h-4 w-4" />
                {pendingAccountId === account.id
                  ? copy.removingOAuth
                  : copy.removeOAuth}
              </button>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </p>
      ) : null}
    </section>
  );
}
