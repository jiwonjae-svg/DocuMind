ALTER TABLE "documents" ADD COLUMN "teamId" TEXT;

CREATE INDEX "documents_teamId_idx" ON "documents"("teamId");

ALTER TABLE "documents"
ADD CONSTRAINT "documents_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "teams"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
