import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createGroundedAnswer,
  INSUFFICIENT_INFORMATION_ANSWER,
  parseGroundedAnswerPayload,
} from "../lib/ai/answers";

const sources = [
  {
    chunkIndex: 0,
    content: "The approval step requires manager review before publishing.",
    documentTitle: "Workflow Guide",
    sourceIndex: 1,
  },
];

describe("grounded answer generation", () => {
  it("parses JSON answers and filters invalid citation indexes", () => {
    const parsed = parseGroundedAnswerPayload(
      "```json\n{\"answer\":\"Use manager review.\",\"citationIndexes\":[1,99,\"1\"],\"insufficientInformation\":false}\n```",
      1,
    );

    expect(parsed).toEqual({
      answer: "Use manager review.",
      citationIndexes: [1],
      insufficientInformation: false,
    });
  });

  it("normalizes insufficient-information answers", () => {
    const parsed = parseGroundedAnswerPayload(
      JSON.stringify({
        answer: "Missing from sources.",
        citationIndexes: [1],
        insufficientInformation: true,
      }),
      1,
    );

    expect(parsed).toEqual({
      answer: INSUFFICIENT_INFORMATION_ANSWER,
      citationIndexes: [],
      insufficientInformation: true,
    });
  });

  it("retries transient answer API errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "temporary" } }), {
          status: 500,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              answer: "Manager review is required before publishing.",
              citationIndexes: [1],
              insufficientInformation: false,
            }),
          }),
          { status: 200 },
        ),
      ) as unknown as typeof fetch;

    const result = await createGroundedAnswer({
      apiKey: "test-key",
      fetchImpl,
      question: "What approval step is required?",
      retryBaseDelayMs: 0,
      sources,
    });

    expect(result.answer).toBe("Manager review is required before publishing.");
    expect(result.citationIndexes).toEqual([1]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns insufficient information without calling OpenAI when no sources exist", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;

    const result = await createGroundedAnswer({
      fetchImpl,
      question: "What is the policy?",
      sources: [],
    });

    expect(result.answer).toBe(INSUFFICIENT_INFORMATION_ANSWER);
    expect(result.insufficientInformation).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
