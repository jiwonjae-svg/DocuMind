-- AlterTable
ALTER TABLE "documents"
ADD COLUMN "processingError" TEXT,
ADD COLUMN "extractedCharCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "document_chunks"
ADD COLUMN "metadata" JSONB;
