-- Enable pgvector for semantic search.
CREATE EXTENSION IF NOT EXISTS vector;

-- Store OpenAI embeddings for document chunks.
ALTER TABLE "document_chunks"
ADD COLUMN "embedding" vector(1536),
ADD COLUMN "embeddingModel" TEXT,
ADD COLUMN "embeddedAt" TIMESTAMP(3);

-- Vector index for cosine-distance nearest-neighbor search.
CREATE INDEX "document_chunks_embedding_hnsw_idx"
ON "document_chunks"
USING hnsw ("embedding" vector_cosine_ops);

-- Keep owner-scoped filtering efficient before vector ranking.
CREATE INDEX "document_chunks_ownerId_embedded_idx"
ON "document_chunks"("ownerId")
WHERE "embedding" IS NOT NULL;
