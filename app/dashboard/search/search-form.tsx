"use client";

import { Icon, IconTile, ui } from "@/components/ui";
import { formatCopy, lookupApiError } from "@/lib/i18n/dictionaries";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/search/validation";
import Link from "next/link";
import { FormEvent, useState } from "react";

type SearchResult = {
  chunkIndex: number;
  documentTitle: string;
  similarityScore: number;
  snippet: string;
};

type SearchResponse = {
  results: SearchResult[];
};

type SearchFormCopy = {
  auditBody: string;
  auditEyebrow: string;
  auditTitle: string;
  apiErrors: Record<string, string>;
  chunk: string;
  empty: string;
  emptyTitle: string;
  fallbackError: string;
  invalidResponse: string;
  invalidResult: string;
  matches: string;
  noReadyBody: string;
  noReadyTitle: string;
  pending: string;
  placeholder: string;
  queryLabel: string;
  readyHintBody: string;
  readyHintTitle: string;
  required: string;
  results: string;
  scoreHigh: string;
  scoreLabel: string;
  scoreLow: string;
  scoreMedium: string;
  scopeBody: string;
  scopeEyebrow: string;
  scopeTitle: string;
  submit: string;
  topMatches: string;
  uploadReadyCta: string;
};

function formatScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

function readScoreLabel(score: number, copy: SearchFormCopy) {
  if (score >= 0.78) {
    return copy.scoreHigh;
  }

  if (score >= 0.58) {
    return copy.scoreMedium;
  }

  return copy.scoreLow;
}

function isSearchResult(value: unknown): value is SearchResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<SearchResult>;

  return (
    Number.isInteger(result.chunkIndex) &&
    typeof result.documentTitle === "string" &&
    Number.isFinite(result.similarityScore) &&
    typeof result.snippet === "string"
  );
}

export function SearchForm({
  copy,
  hasReadyChunks,
}: {
  copy: SearchFormCopy;
  hasReadyChunks: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!hasReadyChunks) {
      setError(null);
      setResults(null);
      return;
    }

    if (!trimmedQuery) {
      setError(copy.required);
      setResults(null);
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/search", {
        body: JSON.stringify({ limit: 5, query: trimmedQuery }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | (Partial<SearchResponse> & { error?: string })
        | null;

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      if (!Array.isArray(payload?.results)) {
        throw new Error(copy.invalidResponse);
      }

      const normalizedResults = payload.results.filter(isSearchResult);

      if (normalizedResults.length !== payload.results.length) {
        throw new Error(copy.invalidResult);
      }

      setResults(normalizedResults);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : copy.fallbackError,
      );
      setResults(null);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className={`${ui.card} p-6`}>
        {!hasReadyChunks ? (
          <section className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  {copy.noReadyTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {copy.noReadyBody}
                </p>
              </div>
              <Link
                href="/dashboard/documents"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                <Icon name="document" className="h-4 w-4" />
                {copy.uploadReadyCta}
              </Link>
            </div>
          </section>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label htmlFor="query" className={ui.label}>
            {copy.queryLabel}
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            rows={3}
            className={`mt-2 block min-h-28 resize-y leading-6 ${ui.input}`}
            placeholder={copy.placeholder}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {query.length}/{MAX_SEARCH_QUERY_LENGTH}
            </p>
            <button
              type="submit"
              disabled={isPending || !hasReadyChunks}
              className={`${ui.primaryButton} w-full sm:w-auto`}
            >
              <Icon name="search" className="h-4 w-4" />
              {isPending ? copy.pending : copy.submit}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {!results && !error && hasReadyChunks ? (
          <section className={`${ui.subtleCard} mt-6 p-5`}>
            <div className="flex items-start gap-4">
              <IconTile accent="emerald" icon="search" className="h-10 w-10" />
              <div>
                <h2 className="text-base font-semibold text-[#0b1535]">
                  {copy.readyHintTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.readyHintBody}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {results ? (
          <section className={`${ui.subtleCard} mt-6 p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={ui.eyebrow}>{copy.results}</p>
                <h2 className="mt-2 text-base font-semibold text-[#0b1535]">
                  {copy.topMatches}
                </h2>
              </div>
              <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                {formatCopy(copy.matches, { count: results.length })}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-[#0b1535]">
                  {copy.emptyTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.empty}
                </p>
                <Link
                  href="/dashboard/documents"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                >
                  {copy.uploadReadyCta}
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                {results.map((result, index) => (
                  <article
                    key={`${result.documentTitle}-${result.chunkIndex}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#0b1535]">
                          {result.documentTitle}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-blue-700">
                          {copy.chunk} {result.chunkIndex}
                        </p>
                      </div>
                      <span className="w-fit rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {copy.scoreLabel}: {formatScore(result.similarityScore)} /{" "}
                        {readScoreLabel(result.similarityScore, copy)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {result.snippet}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>

      <aside className="grid content-start gap-4">
        <section className={`${ui.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconTile accent="emerald" icon="shield" className="h-10 w-10" />
            <div>
              <p className={ui.eyebrow}>{copy.scopeEyebrow}</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                {copy.scopeTitle}
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {copy.scopeBody}
          </p>
        </section>

        <section className={`${ui.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconTile accent="violet" icon="check" className="h-10 w-10" />
            <div>
              <p className={ui.eyebrow}>{copy.auditEyebrow}</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                {copy.auditTitle}
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {copy.auditBody}
          </p>
        </section>
      </aside>
    </div>
  );
}
