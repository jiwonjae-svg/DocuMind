"use client";

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

      setResult({
        answer: payload.answer,
        citations: payload.citations,
        insufficientInformation: payload.insufficientInformation === true,
        matchedSnippets: payload.matchedSnippets,
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
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="question"
            className="text-sm font-semibold text-slate-950"
          >
            Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={1000}
            rows={7}
            className="mt-2 block w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
            placeholder="What does the onboarding guide say about approval steps?"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">{question.length}/1000</p>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isPending ? "Asking..." : "Ask"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-950">
                Answer
              </h2>
              {result.insufficientInformation ? (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  Insufficient information
                </span>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {result.answer}
            </p>
          </section>
        ) : null}
      </div>

      <aside className="grid content-start gap-4">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-950">Citations</h2>
          {result?.citations.length ? (
            <div className="mt-4 grid gap-3">
              {result.citations.map((citation, index) => (
                <div
                  key={`${citation.documentTitle}-${citation.chunkIndex}-${index}`}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {citation.documentTitle}
                  </p>
                  <p className="mt-1 text-xs font-medium text-cyan-700">
                    Chunk {citation.chunkIndex}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {citation.snippet}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No citations yet.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-950">
            Matched snippets
          </h2>
          {result?.matchedSnippets.length ? (
            <div className="mt-4 grid gap-3">
              {result.matchedSnippets.map((snippet, index) => (
                <div
                  key={`${snippet.documentTitle}-${snippet.chunkIndex}-${index}`}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {snippet.documentTitle}
                      </p>
                      <p className="mt-1 text-xs font-medium text-cyan-700">
                        Chunk {snippet.chunkIndex}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
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
            <p className="mt-3 text-sm text-slate-500">No matches yet.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
