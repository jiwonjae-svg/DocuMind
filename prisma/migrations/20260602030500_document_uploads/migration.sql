-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "documents"
ADD COLUMN "originalName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "storedName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "storagePath" TEXT NOT NULL DEFAULT '',
ADD COLUMN "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
ADD COLUMN "sizeBytes" INTEGER NOT NULL DEFAULT 0;

-- AlterStatus
ALTER TABLE "documents" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "documents"
ALTER COLUMN "status" TYPE "DocumentStatus"
USING (
  CASE
    WHEN "status" IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED')
      THEN "status"::"DocumentStatus"
    ELSE 'UPLOADED'::"DocumentStatus"
  END
);
ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'UPLOADED';

-- AlterSourceTypeDefault
ALTER TABLE "documents" ALTER COLUMN "sourceType" SET DEFAULT 'upload';
