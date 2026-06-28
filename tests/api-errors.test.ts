import { describe, expect, it } from "vitest";
import { toApiError } from "../lib/api/errors";

function namedError(name: string, status?: number) {
  const error = new Error("sensitive provider detail");
  error.name = name;

  if (status !== undefined) {
    Object.assign(error, { status });
  }

  return error;
}

describe("API error normalization", () => {
  it("maps AI configuration errors to a stable service response", () => {
    const embeddingError = toApiError(
      namedError("EmbeddingConfigurationError"),
      "fallback",
    );
    const answerError = toApiError(
      namedError("AnswerConfigurationError"),
      "fallback",
    );

    expect(embeddingError).toEqual({
      error: "AI service is not configured. Contact an administrator.",
      status: 503,
    });
    expect(answerError).toEqual({
      error: "AI service is not configured. Contact an administrator.",
      status: 503,
    });
    expect(embeddingError.error).not.toContain("OPENAI_API_KEY");
    expect(answerError.error).not.toContain("OPENAI_API_KEY");
  });

  it("maps AI provider rate limits and outages without leaking provider details", () => {
    expect(toApiError(namedError("EmbeddingApiError", 429), "fallback")).toEqual({
      error: "AI provider is rate limiting requests. Try again shortly.",
      status: 429,
    });
    expect(toApiError(namedError("AnswerApiError", 408), "fallback")).toEqual({
      error: "AI provider is temporarily unavailable. Try again shortly.",
      status: 503,
    });
    expect(toApiError(namedError("EmbeddingApiError", 409), "fallback")).toEqual({
      error: "AI provider is temporarily unavailable. Try again shortly.",
      status: 503,
    });
    expect(toApiError(namedError("AnswerApiError", 503), "fallback")).toEqual({
      error: "AI provider is temporarily unavailable. Try again shortly.",
      status: 503,
    });
  });

  it("maps other AI provider errors to a bad gateway response", () => {
    expect(toApiError(namedError("AnswerApiError", 401), "fallback")).toEqual({
      error: "AI provider request failed.",
      status: 502,
    });
    expect(toApiError(namedError("EmbeddingApiError"), "fallback")).toEqual({
      error: "AI provider request failed.",
      status: 502,
    });
  });

  it("uses the fallback message for non-AI errors", () => {
    expect(toApiError(new Error("database failed"), "Search failed.")).toEqual({
      error: "Search failed.",
      status: 500,
    });
  });
});
