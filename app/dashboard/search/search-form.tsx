"use client";

import { Icon, IconTile, ui } from "@/components/ui";
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

function formatScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

function isSearchResult(value: unknown): value is SearchResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<SearchResult>;

  return (
    typeof result.chunkIndex === "number" &&
    typeof result.documentTitle === "string" &&
    typeof result.similarityScore === "number" &&
    typeof result.snippet === "string"
  );
}

export function SearchForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a search query.");
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
        throw new Error(payload?.error ?? "Search failed.");
      }

      if (!Array.isArray(payload?.results)) {
        throw new Error("Search response was not valid.");
      }

      const normalizedResults = payload.results.filter(isSearchResult);

      if (normalizedResults.length !== payload.results.length) {
        throw new Error("Search response contained invalid results.");
      }

      setResults(normalizedResults);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Search failed.",
      );
      setResults(null);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className={`${ui.card} p-6`}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="query" className={ui.label}>
            Search query
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={1000}
            rows={5}
            className={`mt-2 block min-h-36 resize-y leading-6 ${ui.input}`}
            placeholder="Search policies, onboarding guides, and project notes..."
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">{query.length}/1000</p>
            <button
              type="submit"
              disabled={isPending}
              className={ui.primaryButton}
            >
              <Icon name="search" className="h-4 w-4" />
              {isPending ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {results ? (
          <section className={`${ui.subtleCard} mt-6 p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={ui.eyebrow}>Results</p>
                <h2 className="mt-2 text-base font-semibold text-[#0b1535]">
                  Top matching chunks
                </h2>
              </div>
              <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                {results.length} matches
              </span>
            </div>

            {results.length === 0 ? (
              <p className="mt-5 text-sm leading-6 text-slate-600">
                No ready document chunks matched this query.
              </p>
            ) : (
              <div className="mt-5 grid gap-4">
                {results.map((result, index) => (
                  <article
                    key={`${result.documentTitle}-${result.chunkIndex}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#0b1535]">
                          {result.documentTitle}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-blue-700">
                          Chunk {result.chunkIndex}
                        </p>
                      </div>
                      <span className="w-fit rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {formatScore(result.similarityScore)}
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
              <p className={ui.eyebrow}>Scope</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                Owner-scoped retrieval
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Search runs through the server API and filters ready chunks by the
            current user&apos;s owner ID before ranking with pgvector.
          </p>
        </section>

        <section className={`${ui.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconTile accent="violet" icon="check" className="h-10 w-10" />
            <div>
              <p className={ui.eyebrow}>Audit</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                Search activity
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Successful searches write an audit event with result count, limit,
            and query length without exposing OpenAI credentials to the client.
          </p>
        </section>
      </aside>
    </div>
  );
}
