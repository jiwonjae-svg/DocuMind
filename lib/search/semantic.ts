import "server-only";

import { Prisma } from "@prisma/client";
import { createEmbedding, toPgVector } from "@/lib/ai/embeddings";
import { embedMissingDocumentChunks } from "@/lib/documents/embeddings";
import { prisma } from "@/lib/prisma";
import { createSnippet } from "@/lib/text/snippet";

const DEFAULT_SEARCH_LIMIT = 5;
const MAX_SEARCH_LIMIT = 10;
const MAX_QUERY_LENGTH = 1000;

type SearchRow = {
  chunkId: string;
  chunkIndex: number;
  content: string;
  documentId: string;
  documentTitle: string;
  similarityScore: number | string;
};

export type SemanticSearchResult = {
  chunkId: string;
  chunkIndex: number;
  content: string;
  documentId: string;
  documentTitle: string;
  similarityScore: number;
  snippet: string;
};

export type PublicSemanticSearchResult = Pick<
  SemanticSearchResult,
  "chunkIndex" | "documentTitle" | "similarityScore" | "snippet"
>;

export function normalizeSearchQuery(query: unknown) {
  if (typeof query !== "string") {
    return null;
  }

  const normalizedQuery = query.replace(/\s+/g, " ").trim();

  if (!normalizedQuery || normalizedQuery.length > MAX_QUERY_LENGTH) {
    return null;
  }

  return normalizedQuery;
}

export function normalizeSearchLimit(limit: unknown) {
  if (limit === undefined || limit === null) {
    return DEFAULT_SEARCH_LIMIT;
  }

  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(Math.max(parsedLimit, 1), MAX_SEARCH_LIMIT);
}

export async function retrieveRelevantDocumentChunks({
  limit = DEFAULT_SEARCH_LIMIT,
  ownerId,
  query,
}: {
  limit?: number;
  ownerId: string;
  query: string;
}): Promise<SemanticSearchResult[]> {
  await embedMissingDocumentChunks({ ownerId });

  const queryEmbedding = await createEmbedding(query);
  const queryVector = toPgVector(queryEmbedding.embedding);
  const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
    SELECT
      dc."id" AS "chunkId",
      dc."documentId" AS "documentId",
      d."title" AS "documentTitle",
      dc."chunkIndex" AS "chunkIndex",
      dc."content" AS "content",
      1 - (dc."embedding" <=> ${queryVector}::vector) AS "similarityScore"
    FROM "document_chunks" dc
    INNER JOIN "documents" d ON d."id" = dc."documentId"
    WHERE dc."ownerId" = ${ownerId}
      AND d."ownerId" = ${ownerId}
      AND d."status" = 'READY'::"DocumentStatus"
      AND dc."embedding" IS NOT NULL
    ORDER BY dc."embedding" <=> ${queryVector}::vector
    LIMIT ${limit}
  `);

  return rows.map((row) => ({
    chunkId: row.chunkId,
    chunkIndex: row.chunkIndex,
    content: row.content,
    documentId: row.documentId,
    documentTitle: row.documentTitle,
    similarityScore: Number(row.similarityScore),
    snippet: createSnippet(row.content),
  }));
}

export async function searchDocumentChunks({
  limit = DEFAULT_SEARCH_LIMIT,
  ownerId,
  query,
}: {
  limit?: number;
  ownerId: string;
  query: string;
}): Promise<PublicSemanticSearchResult[]> {
  const results = await retrieveRelevantDocumentChunks({ limit, ownerId, query });

  return results.map((result) => ({
    chunkIndex: result.chunkIndex,
    documentTitle: result.documentTitle,
    similarityScore: result.similarityScore,
    snippet: result.snippet,
  }));
}
