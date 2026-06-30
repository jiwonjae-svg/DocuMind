"use client";

import { Icon, IconTile, ui } from "@/components/ui";
import { lookupApiError } from "@/lib/i18n/dictionaries";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/search/validation";
import { FormEvent, useState } from "react";

type Citation = {
  chunkIndex: number;
  documentTitle: string;
  snippet: string;
};

type MatchedSnippet = Citation & {
  similarityScore: number;
};

type AskResponse = {
  answer: string;
  citations: Citation[];
  insufficientInformation: boolean;
  matchedSnippets: MatchedSnippet[];
};

type AskFormCopy = {
  answer: string;
  apiErrors: Record<string, string>;
  ask: string;
  asking: string;
  chunk: string;
  citations: string;
  fallbackError: string;
  insufficient: string;
  invalidResponse: string;
  invalidSources: string;
  matchedSnippets: string;
  noCitations: string;
  noMatches: string;
  placeholder: string;
  question: string;
  required: string;
  retrieval: string;
  sources: string;
};

function formatScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

function isCitation(value: unknown): value is Citation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const citation = value as Partial<Citation>;

  return (
    Number.isInteger(citation.chunkIndex) &&
    typeof citation.documentTitle === "string" &&
    typeof citation.snippet === "string"
  );
}

function isMatchedSnippet(value: unknown): value is MatchedSnippet {
  if (!isCitation(value)) {
    return false;
  }

  return Number.isFinite((value as Partial<MatchedSnippet>).similarityScore);
}

export function AskForm({ copy }: { copy: AskFormCopy }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError(copy.required);
      setResult(null);
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/ask", {
        body: JSON.stringify({ question: trimmedQuestion }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | (Partial<AskResponse> & { error?: string })
        | null;

      if (!response.ok) {
        throw new Error(
          lookupApiError(copy.apiErrors, payload?.error, copy.fallbackError),
        );
      }

      if (
        typeof payload?.answer !== "string" ||
        !Array.isArray(payload.citations) ||
        !Array.isArray(payload.matchedSnippets)
      ) {
        throw new Error(copy.invalidResponse);
      }

      const citations = payload.citations.filter(isCitation);
      const matchedSnippets = payload.matchedSnippets.filter(isMatchedSnippet);

      if (
        citations.length !== payload.citations.length ||
        matchedSnippets.length !== payload.matchedSnippets.length
      ) {
        throw new Error(copy.invalidSources);
      }

      setResult({
        answer: payload.answer,
        citations,
        insufficientInformation: payload.insufficientInformation === true,
        matchedSnippets,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : copy.fallbackError,
      );
      setResult(null);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <div className={`${ui.card} p-6`}>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="question"
            className={ui.label}
          >
            {copy.question}
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            rows={4}
            className={`mt-2 block min-h-32 resize-y leading-6 ${ui.input}`}
            placeholder={copy.placeholder}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {question.length}/{MAX_SEARCH_QUERY_LENGTH}
            </p>
            <button
              type="submit"
              disabled={isPending}
              className={`${ui.primaryButton} w-full sm:w-auto`}
            >
              <Icon name="question" className="h-4 w-4" />
              {isPending ? copy.asking : copy.ask}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <section className={`${ui.subtleCard} mt-6 p-5`}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[#0b1535]">
                {copy.answer}
              </h2>
              {result.insufficientInformation ? (
                <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {copy.insufficient}
                </span>
              ) : null}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {result.answer}
            </p>
          </section>
        ) : null}
      </div>

      <aside className="grid content-start gap-4">
        <section className={`${ui.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconTile accent="blue" icon="document" className="h-10 w-10" />
            <div>
              <p className={ui.eyebrow}>{copy.sources}</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                {copy.citations}
              </h2>
            </div>
          </div>
          {result?.citations.length ? (
            <div className="mt-4 grid gap-3">
              {result.citations.map((citation, index) => (
                <div
                  key={`${citation.documentTitle}-${citation.chunkIndex}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-[#0b1535]">
                    {citation.documentTitle}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-blue-700">
                    {copy.chunk} {citation.chunkIndex}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {citation.snippet}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {copy.noCitations}
            </p>
          )}
        </section>

        <section className={`${ui.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconTile accent="emerald" icon="search" className="h-10 w-10" />
            <div>
              <p className={ui.eyebrow}>{copy.retrieval}</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                {copy.matchedSnippets}
              </h2>
            </div>
          </div>
          {result?.matchedSnippets.length ? (
            <div className="mt-4 grid gap-3">
              {result.matchedSnippets.map((snippet, index) => (
                <div
                  key={`${snippet.documentTitle}-${snippet.chunkIndex}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0b1535]">
                        {snippet.documentTitle}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        {copy.chunk} {snippet.chunkIndex}
                      </p>
                    </div>
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {formatScore(snippet.similarityScore)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {snippet.snippet}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {copy.noMatches}
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
