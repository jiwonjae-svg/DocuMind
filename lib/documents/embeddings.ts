import "server-only";

import { Prisma } from "@prisma/client";
import { createEmbedding, toPgVector } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";
import { normalizeEmbeddingBackfillLimit } from "./embedding-limits";

type EmbeddableChunk = {
  content: string;
  id: string;
};

type EmbedMissingChunksOptions = {
  documentId?: string;
  limit?: number;
  ownerId: string;
};

async function findMissingDocumentChunkEmbeddings({
  documentId,
  limit,
  ownerId,
}: EmbedMissingChunksOptions) {
  if (documentId) {
    return prisma.$queryRaw<EmbeddableChunk[]>(Prisma.sql`
      SELECT "id", "content"
      FROM "document_chunks"
      WHERE "documentId" = ${documentId}
        AND "ownerId" = ${ownerId}
        AND "embedding" IS NULL
      ORDER BY "chunkIndex" ASC
    `);
  }

  const normalizedLimit = normalizeEmbeddingBackfillLimit(limit);

  if (normalizedLimit) {
    return prisma.$queryRaw<EmbeddableChunk[]>(Prisma.sql`
      SELECT dc."id", dc."content"
      FROM "document_chunks" dc
      INNER JOIN "documents" d ON d."id" = dc."documentId"
      WHERE dc."ownerId" = ${ownerId}
        AND d."ownerId" = ${ownerId}
        AND d."status" = 'READY'::"DocumentStatus"
        AND dc."embedding" IS NULL
      ORDER BY d."createdAt" DESC, dc."chunkIndex" ASC
      LIMIT ${normalizedLimit}
    `);
  }

  return prisma.$queryRaw<EmbeddableChunk[]>(Prisma.sql`
    SELECT dc."id", dc."content"
    FROM "document_chunks" dc
    INNER JOIN "documents" d ON d."id" = dc."documentId"
    WHERE dc."ownerId" = ${ownerId}
      AND d."ownerId" = ${ownerId}
      AND d."status" = 'READY'::"DocumentStatus"
      AND dc."embedding" IS NULL
    ORDER BY d."createdAt" DESC, dc."chunkIndex" ASC
  `);
}

async function updateChunkEmbedding({
  chunkId,
  embedding,
  model,
  ownerId,
}: {
  chunkId: string;
  embedding: number[];
  model: string;
  ownerId: string;
}) {
  const embeddingVector = toPgVector(embedding);

  return prisma.$executeRaw(Prisma.sql`
    UPDATE "document_chunks"
    SET
      "embedding" = ${embeddingVector}::vector,
      "embeddingModel" = ${model},
      "embeddedAt" = NOW(),
      "updatedAt" = NOW()
    WHERE "id" = ${chunkId}
      AND "ownerId" = ${ownerId}
      AND "embedding" IS NULL
  `);
}

export async function embedMissingDocumentChunks(
  options: EmbedMissingChunksOptions,
) {
  const chunks = await findMissingDocumentChunkEmbeddings(options);
  let embeddedChunkCount = 0;

  for (const chunk of chunks) {
    const result = await createEmbedding(chunk.content);
    const updatedRows = await updateChunkEmbedding({
      chunkId: chunk.id,
      embedding: result.embedding,
      model: result.model,
      ownerId: options.ownerId,
    });

    embeddedChunkCount += updatedRows;
  }

  return {
    embeddedChunkCount,
    skippedChunkCount: chunks.length - embeddedChunkCount,
  };
}
