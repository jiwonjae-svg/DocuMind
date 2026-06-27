import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PROCESSING_AI_CONFIGURATION_ERROR,
  DOCUMENT_PROCESSING_AI_PROVIDER_ERROR,
  DOCUMENT_PROCESSING_AI_RATE_LIMIT_ERROR,
  DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR,
  DOCUMENT_PROCESSING_GENERIC_ERROR,
  DOCUMENT_PROCESSING_NO_TEXT_ERROR,
  normalizeDocumentProcessingError,
} from "../lib/documents/processing-errors";

function namedError(name: string, message: string, status?: number) {
  const error = new Error(message);
  error.name = name;

  if (status !== undefined) {
    Object.assign(error, { status });
  }

  return error;
}

describe("document processing errors", () => {
  it("keeps known document processing errors user-readable", () => {
    expect(
      normalizeDocumentProcessingError(
        new Error(DOCUMENT_PROCESSING_NO_TEXT_ERROR),
      ),
    ).toBe(DOCUMENT_PROCESSING_NO_TEXT_ERROR);
  });

  it("maps AI configuration failures without leaking provider details", () => {
    expect(
      normalizeDocumentProcessingError(
        namedError("EmbeddingConfigurationError", "missing secret"),
      ),
    ).toBe(DOCUMENT_PROCESSING_AI_CONFIGURATION_ERROR);
  });

  it("maps AI provider rate limits and temporary failures", () => {
    expect(
      normalizeDocumentProcessingError(
        namedError("EmbeddingApiError", "sensitive rate limit detail", 429),
      ),
    ).toBe(DOCUMENT_PROCESSING_AI_RATE_LIMIT_ERROR);
    expect(
      normalizeDocumentProcessingError(
        namedError("EmbeddingApiError", "sensitive outage detail", 503),
      ),
    ).toBe(DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR);
    expect(
      normalizeDocumentProcessingError(
        namedError("EmbeddingApiError", "OpenAI embedding request timed out."),
      ),
    ).toBe(DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR);
  });

  it("maps other AI provider failures without raw messages", () => {
    expect(
      normalizeDocumentProcessingError(
        namedError("EmbeddingApiError", "raw provider auth detail", 401),
      ),
    ).toBe(DOCUMENT_PROCESSING_AI_PROVIDER_ERROR);
  });

  it("hides unexpected internal processing errors", () => {
    expect(
      normalizeDocumentProcessingError(
        new Error("ENOENT C:/Users/example/uploads/private.txt"),
      ),
    ).toBe(DOCUMENT_PROCESSING_GENERIC_ERROR);
  });
});
