export const SEARCH_EMBEDDING_BACKFILL_LIMIT = 20;

export function normalizeEmbeddingBackfillLimit(limit: number | undefined) {
  if (limit === undefined) {
    return null;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    return null;
  }

  return Math.min(limit, SEARCH_EMBEDDING_BACKFILL_LIMIT);
}
