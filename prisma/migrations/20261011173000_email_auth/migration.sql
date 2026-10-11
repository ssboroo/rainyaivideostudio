ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);
UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "emailVerifiedAt" IS NULL;
CREATE TABLE "EmailToken" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "tokenHash" TEXT NOT NULL UNIQUE, "kind" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "consumedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "EmailToken_userId_kind_createdAt_idx" ON "EmailToken"("userId","kind","createdAt");
CREATE INDEX "EmailToken_expiresAt_idx" ON "EmailToken"("expiresAt");
