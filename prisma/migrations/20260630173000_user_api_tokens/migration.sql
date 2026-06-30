CREATE TABLE "user_api_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_api_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_api_tokens_tokenHash_key" ON "user_api_tokens"("tokenHash");
CREATE INDEX "user_api_tokens_userId_idx" ON "user_api_tokens"("userId");
CREATE INDEX "user_api_tokens_revokedAt_idx" ON "user_api_tokens"("revokedAt");
CREATE INDEX "user_api_tokens_expiresAt_idx" ON "user_api_tokens"("expiresAt");

ALTER TABLE "user_api_tokens" ADD CONSTRAINT "user_api_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
