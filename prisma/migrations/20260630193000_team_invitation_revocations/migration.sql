ALTER TABLE "team_invitations" ADD COLUMN "revokedAt" TIMESTAMP(3);
ALTER TABLE "team_invitations" ADD COLUMN "revokedById" TEXT;

CREATE INDEX "team_invitations_revokedAt_idx" ON "team_invitations"("revokedAt");
CREATE INDEX "team_invitations_revokedById_idx" ON "team_invitations"("revokedById");

ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
