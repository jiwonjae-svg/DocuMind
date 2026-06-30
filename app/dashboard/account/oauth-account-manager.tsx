"use client";

import { Icon, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import type { OAuthProviderId } from "@/lib/auth/oauth-providers";
import { signIn } from "next-auth/react";
import { useState } from "react";

type OAuthAccount = {
  id: string;
  providerName: string;
};

type OAuthProvider = {
  id: OAuthProviderId;
  name: string;
};

type OAuthAccountManagerCopy = {
  addOAuth: string;
  addingOAuth: string;
  apiErrors: Record<string, string>;
  fallbackError: string;
  noAvailableOAuthProviders: string;
  noOAuthAccounts: string;
  oauthConnectionsBody: string;
  oauthConnectionsTitle: string;
  removeOAuth: string;
  removingOAuth: string;
  successOAuthRemoved: string;
};

type OAuthAccountManagerProps = {
  accounts: OAuthAccount[];
  availableProviders: OAuthProvider[];
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

function formatProviderCopy(template: string, providerName: string) {
  return template.replace("{provider}", providerName);
}

export function OAuthAccountManager({
  accounts,
  availableProviders,
  copy,
  hasPassword,
}: OAuthAccountManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingProviderId, setPendingProviderId] =
    useState<OAuthProviderId | null>(null);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [removedAccountIds, setRemovedAccountIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [success, setSuccess] = useState<string | null>(null);
  const visibleAccounts = accounts.filter(
    (account) => !removedAccountIds.has(account.id),
  );
  const canRemoveVisibleOAuth = hasPassword || visibleAccounts.length > 1;

  async function addProvider(provider: OAuthProvider) {
    setError(null);
    setSuccess(null);
    setPendingProviderId(provider.id);

    try {
      const response = await fetch("/api/account/oauth-link-intents", {
        body: JSON.stringify({
          provider: provider.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = await readOAuthAccountResponse(response);

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      await signIn(provider.id, { redirectTo: "/dashboard/account" });
    } catch (addError) {
      setPendingProviderId(null);
      setError(addError instanceof Error ? addError.message : copy.fallbackError);
    }
  }

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

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {availableProviders.length > 0 ? (
          availableProviders.map((provider) => (
            <button
              key={provider.id}
              type="button"
              disabled={pendingProviderId !== null}
              onClick={() => void addProvider(provider)}
              className={`${ui.secondaryButton} w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Icon name={provider.id} className="h-4 w-4" />
              {pendingProviderId === provider.id
                ? formatProviderCopy(copy.addingOAuth, provider.name)
                : formatProviderCopy(copy.addOAuth, provider.name)}
            </button>
          ))
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:col-span-2">
            {copy.noAvailableOAuthProviders}
          </p>
        )}
      </div>

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
