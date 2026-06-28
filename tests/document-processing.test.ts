import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PROCESSING_AI_CONFIGURATION_ERROR,
  DOCUMENT_PROCESSING_AI_PROVIDER_ERROR,
  DOCUMENT_PROCESSING_AI_RATE_LIMIT_ERROR,
  DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR,
  DOCUMENT_PROCESSING_GENERIC_ERROR,
  DOCUMENT_PROCESSING_NO_TEXT_ERROR,
  DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR,
  formatStoredDocumentProcessingError,
  normalizeDocumentProcessingError,
} from "../lib/documents/processing-errors";
import {
  MAX_EXTRACTED_DOCUMENT_TEXT_CHARS,
  readProcessableExtractedTextLength,
} from "../lib/documents/processing-limits";

function namedError(name: string, message: string, status?: number) {
  const error = new Error(message);
  error.name = name;

  if (status !== undefined) {
    Object.assign(error, { status });
  }

  return error;
}

describe("document processing errors", () => {
  it("keeps document processing status writes owner-scoped", () => {
    const source = readFileSync(
      path.join(process.cwd(), "lib", "documents", "processing.ts"),
      "utf8",
    );

    expect(source).toContain("buildDocumentOwnerWhere");
    expect(source).toContain("prisma.document.updateMany");
    expect(source).toContain("readyUpdate.count !== 1");
    expect(source).toContain("failedUpdate.count !== 1");
    expect(source).not.toContain("prisma.document.update({");
  });

  it("bounds extracted text before chunking and embedding", () => {
    expect(
      readProcessableExtractedTextLength(
        "a".repeat(MAX_EXTRACTED_DOCUMENT_TEXT_CHARS),
      ),
    ).toBe(MAX_EXTRACTED_DOCUMENT_TEXT_CHARS);
    expect(() =>
      readProcessableExtractedTextLength(
        "a".repeat(MAX_EXTRACTED_DOCUMENT_TEXT_CHARS + 1),
      ),
    ).toThrow(DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR);
  });

  it("keeps known document processing errors user-readable", () => {
    expect(
      normalizeDocumentProcessingError(
        new Error(DOCUMENT_PROCESSING_NO_TEXT_ERROR),
      ),
    ).toBe(DOCUMENT_PROCESSING_NO_TEXT_ERROR);
    expect(
      normalizeDocumentProcessingError(
        new Error(DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR),
      ),
    ).toBe(DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR);
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
        namedError("EmbeddingApiError", "sensitive timeout detail", 408),
      ),
    ).toBe(DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR);
    expect(
      normalizeDocumentProcessingError(
        namedError("EmbeddingApiError", "sensitive conflict detail", 409),
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

  it("normalizes stored processing errors again before display", () => {
    expect(
      formatStoredDocumentProcessingError(DOCUMENT_PROCESSING_NO_TEXT_ERROR),
    ).toBe(DOCUMENT_PROCESSING_NO_TEXT_ERROR);
    expect(
      formatStoredDocumentProcessingError(
        DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR,
      ),
    ).toBe(DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR);
    expect(
      formatStoredDocumentProcessingError(
        "ENOENT C:/Users/example/uploads/private.txt",
      ),
    ).toBe(DOCUMENT_PROCESSING_GENERIC_ERROR);
    expect(formatStoredDocumentProcessingError("   ")).toBeNull();
  });
});
