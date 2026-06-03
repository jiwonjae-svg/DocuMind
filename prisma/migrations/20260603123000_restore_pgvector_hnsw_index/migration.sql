-- Restore the pgvector search index after aligning the managed Postgres schema.
CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw_idx"
ON "document_chunks"
USING hnsw ("embedding" vector_cosine_ops)
WHERE "embedding" IS NOT NULL;
