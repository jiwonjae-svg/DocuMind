"use client";

import { Icon, IconTile, ui } from "@/components/ui";
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

export function AskForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Enter a question.");
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
        throw new Error(payload?.error ?? "Question failed.");
      }

      if (
        typeof payload?.answer !== "string" ||
        !Array.isArray(payload.citations) ||
        !Array.isArray(payload.matchedSnippets)
      ) {
        throw new Error("Question response was not valid.");
      }

      const citations = payload.citations.filter(isCitation);
      const matchedSnippets = payload.matchedSnippets.filter(isMatchedSnippet);

      if (
        citations.length !== payload.citations.length ||
        matchedSnippets.length !== payload.matchedSnippets.length
      ) {
        throw new Error("Question response contained invalid sources.");
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
          : "Question failed.",
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
            Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            rows={7}
            className={`mt-2 block min-h-44 resize-y leading-6 ${ui.input}`}
            placeholder="What does the onboarding guide say about approval steps?"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {question.length}/{MAX_SEARCH_QUERY_LENGTH}
            </p>
            <button
              type="submit"
              disabled={isPending}
              className={ui.primaryButton}
            >
              <Icon name="question" className="h-4 w-4" />
              {isPending ? "Asking..." : "Ask"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <section className={`${ui.subtleCard} mt-6 p-5`}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[#0b1535]">
                Answer
              </h2>
              {result.insufficientInformation ? (
                <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Insufficient information
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
              <p className={ui.eyebrow}>Sources</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                Citations
              </h2>
            </div>
          </div>
          {result?.citations.length ? (
            <div className="mt-4 grid gap-3">
              {result.citations.map((citation, index) => (
                <div
                  key={`${citation.documentTitle}-${citation.chunkIndex}-${index}`}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-[#0b1535]">
                    {citation.documentTitle}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-blue-700">
                    Chunk {citation.chunkIndex}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {citation.snippet}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              No citations yet.
            </p>
          )}
        </section>

        <section className={`${ui.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconTile accent="emerald" icon="search" className="h-10 w-10" />
            <div>
              <p className={ui.eyebrow}>Retrieval</p>
              <h2 className="mt-1 text-base font-semibold text-[#0b1535]">
                Matched snippets
              </h2>
            </div>
          </div>
          {result?.matchedSnippets.length ? (
            <div className="mt-4 grid gap-3">
              {result.matchedSnippets.map((snippet, index) => (
                <div
                  key={`${snippet.documentTitle}-${snippet.chunkIndex}-${index}`}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0b1535]">
                        {snippet.documentTitle}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        Chunk {snippet.chunkIndex}
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
              No matches yet.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
