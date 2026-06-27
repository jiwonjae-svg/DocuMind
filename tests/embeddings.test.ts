import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createEmbedding,
  EMBEDDING_DIMENSIONS,
  toPgVector,
} from "../lib/ai/embeddings";
import {
  normalizeEmbeddingBackfillLimit,
  SEARCH_EMBEDDING_BACKFILL_LIMIT,
} from "../lib/documents/embedding-limits";

function buildEmbedding() {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) => index / 1000);
}

describe("OpenAI embeddings", () => {
  it("retries transient API errors", async () => {
    const embedding = buildEmbedding();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "temporary" } }), {
          status: 500,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ embedding }] }), {
          status: 200,
        }),
      ) as unknown as typeof fetch;

    const result = await createEmbedding("hello", {
      apiKey: "test-key",
      fetchImpl,
      retryBaseDelayMs: 0,
    });

    expect(result.embedding).toEqual(embedding);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-transient API errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "bad request" } }), {
          status: 400,
        }),
      ) as unknown as typeof fetch;

    await expect(
      createEmbedding("hello", {
        apiKey: "test-key",
        fetchImpl,
        retryBaseDelayMs: 0,
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("formats vectors for pgvector", () => {
    const embedding = buildEmbedding();

    expect(toPgVector(embedding).startsWith("[0,0.001,0.002")).toBe(true);
    expect(toPgVector(embedding).endsWith("]")).toBe(true);
  });

  it("keeps document-processing embedding backfills unbounded by default", () => {
    expect(normalizeEmbeddingBackfillLimit(undefined)).toBeNull();
  });

  it("bounds search-time embedding backfills", () => {
    expect(normalizeEmbeddingBackfillLimit(5)).toBe(5);
    expect(normalizeEmbeddingBackfillLimit(0)).toBeNull();
    expect(normalizeEmbeddingBackfillLimit(SEARCH_EMBEDDING_BACKFILL_LIMIT + 10))
      .toBe(SEARCH_EMBEDDING_BACKFILL_LIMIT);
  });
});
