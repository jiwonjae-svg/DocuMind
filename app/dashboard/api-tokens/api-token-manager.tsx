"use client";

import { Icon, IconTile, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import { FormEvent, useState } from "react";

type ApiToken = {
  createdAt: string;
  id: string;
  lastUsedAt: string | null;
  name: string;
};

type ApiTokenManagerCopy = {
  activeBody: string;
  activeTitle: string;
  apiErrors: Record<string, string>;
  createBody: string;
  createSubmit: string;
  createTitle: string;
  createdAt: string;
  createdBody: string;
  createdTitle: string;
  creating: string;
  emptyBody: string;
  emptyTitle: string;
  fallbackError: string;
  lastUsedAt: string;
  nameLabel: string;
  namePlaceholder: string;
  neverUsed: string;
  revoke: string;
  revoking: string;
  successCreated: string;
  successRevoked: string;
  tokenHelp: string;
  tokenLabel: string;
};

type ApiTokenManagerProps = {
  copy: ApiTokenManagerCopy;
  initialTokens: ApiToken[];
  locale: string;
};

type ApiTokenResponse = {
  apiToken?: Partial<ApiToken>;
  error?: string;
  token?: string;
};

async function readApiResponse(response: Response) {
  return (await response.json().catch(() => null)) as ApiTokenResponse | null;
}

function readReturnedToken(value: unknown): ApiToken | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const token = value as Partial<ApiToken>;

  return typeof token.id === "string" &&
    typeof token.name === "string" &&
    typeof token.createdAt === "string"
    ? {
        createdAt: token.createdAt,
        id: token.id,
        lastUsedAt:
          typeof token.lastUsedAt === "string" ? token.lastUsedAt : null,
        name: token.name,
      }
    : null;
}

function formatDate(value: string | null, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function ApiTokenManager({
  copy,
  initialTokens,
  locale,
}: ApiTokenManagerProps) {
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tokens, setTokens] = useState(initialTokens);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatedSecret(null);
    setError(null);
    setSuccess(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/api-tokens", {
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      const returnedToken = readReturnedToken(payload?.apiToken);

      if (!returnedToken || typeof payload?.token !== "string") {
        throw new Error(copy.fallbackError);
      }

      setTokens((currentTokens) => [returnedToken, ...currentTokens]);
      setCreatedSecret(payload.token);
      setName("");
      setSuccess(copy.successCreated);
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : copy.fallbackError,
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(tokenId: string) {
    setError(null);
    setSuccess(null);
    setRevokingId(tokenId);

    try {
      const response = await fetch("/api/api-tokens", {
        body: JSON.stringify({ tokenId }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      setTokens((currentTokens) =>
        currentTokens.filter((token) => token.id !== tokenId),
      );
      setSuccess(copy.successRevoked);
    } catch (revokeError) {
      setError(
        revokeError instanceof Error ? revokeError.message : copy.fallbackError,
      );
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <section className={`${ui.card} p-6`}>
        <h2 className="text-xl font-semibold text-[#080f2f]">
          {copy.createTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {copy.createBody}
        </p>

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label htmlFor="api-token-name" className={ui.label}>
              {copy.nameLabel}
            </label>
            <input
              id="api-token-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              maxLength={80}
              required
              className={`mt-2 ${ui.input}`}
              placeholder={copy.namePlaceholder}
            />
          </div>
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
            disabled={isCreating}
            className={`${ui.primaryButton} w-full sm:w-auto`}
          >
            <Icon name="lock" className="h-4 w-4" />
            {isCreating ? copy.creating : copy.createSubmit}
          </button>
        </form>

        {createdSecret ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="text-base font-semibold text-emerald-900">
              {copy.createdTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              {copy.createdBody}
            </p>
            <label htmlFor="created-api-token" className={`mt-4 block ${ui.label}`}>
              {copy.tokenLabel}
            </label>
            <textarea
              id="created-api-token"
              readOnly
              value={createdSecret}
              rows={3}
              className={`mt-2 font-mono ${ui.input}`}
              onFocus={(event) => event.currentTarget.select()}
            />
            <p className="mt-2 text-xs leading-5 text-emerald-800">
              {copy.tokenHelp}
            </p>
          </div>
        ) : null}
      </section>

      <section className={`${ui.card} overflow-hidden`}>
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={ui.eyebrow}>{copy.activeTitle}</p>
            <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
              {copy.activeBody}
            </h2>
          </div>
          <span className="w-fit rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {tokens.length}
          </span>
        </div>

        {tokens.length === 0 ? (
          <div className="grid place-items-center px-6 py-14 text-center">
            <IconTile accent="emerald" icon="lock" />
            <h3 className="mt-4 text-lg font-semibold text-[#0b1535]">
              {copy.emptyTitle}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              {copy.emptyBody}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-4">
                    <IconTile
                      accent="emerald"
                      icon="lock"
                      className="h-12 w-12"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#0b1535]">
                        {token.name}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {copy.createdAt}:{" "}
                        {formatDate(token.createdAt, locale, copy.neverUsed)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {copy.lastUsedAt}:{" "}
                        {formatDate(token.lastUsedAt, locale, copy.neverUsed)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start lg:justify-end">
                  <button
                    type="button"
                    onClick={() => void handleRevoke(token.id)}
                    disabled={revokingId === token.id}
                    className={ui.dangerButton}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                    {revokingId === token.id ? copy.revoking : copy.revoke}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
