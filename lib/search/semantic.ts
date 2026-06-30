import "server-only";

import { Prisma } from "@prisma/client";
import { createEmbedding, toPgVector } from "@/lib/ai/embeddings";
import { SEARCH_EMBEDDING_BACKFILL_LIMIT } from "@/lib/documents/embedding-limits";
import { embedMissingDocumentChunks } from "@/lib/documents/embeddings";
import { prisma } from "@/lib/prisma";
import {
  hasSearchableChunk,
  type SearchableChunkAvailabilityRow,
} from "@/lib/search/availability";
import { DEFAULT_SEARCH_LIMIT } from "@/lib/search/validation";
import { createSnippet } from "@/lib/text/snippet";

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

async function hasSearchableDocumentChunks(ownerId: string) {
  const rows = await prisma.$queryRaw<SearchableChunkAvailabilityRow[]>(Prisma.sql`
    SELECT EXISTS (
      SELECT 1
      FROM "document_chunks" dc
      INNER JOIN "documents" d ON d."id" = dc."documentId"
      WHERE dc."ownerId" = d."ownerId"
        AND (
          d."ownerId" = ${ownerId}
          OR EXISTS (
            SELECT 1
            FROM "team_memberships" tm
            WHERE tm."teamId" = d."teamId"
              AND tm."userId" = ${ownerId}
          )
        )
        AND d."status" = 'READY'::"DocumentStatus"
        AND dc."embedding" IS NOT NULL
    ) AS "exists"
  `);

  return hasSearchableChunk(rows);
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
  await embedMissingDocumentChunks({
    limit: SEARCH_EMBEDDING_BACKFILL_LIMIT,
    ownerId,
  });

  if (!(await hasSearchableDocumentChunks(ownerId))) {
    return [];
  }

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
    WHERE dc."ownerId" = d."ownerId"
      AND (
        d."ownerId" = ${ownerId}
        OR EXISTS (
          SELECT 1
          FROM "team_memberships" tm
          WHERE tm."teamId" = d."teamId"
            AND tm."userId" = ${ownerId}
        )
      )
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
