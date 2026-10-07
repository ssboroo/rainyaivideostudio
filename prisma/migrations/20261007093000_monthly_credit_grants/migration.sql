ALTER TYPE "LedgerType" ADD VALUE 'EXPIRY';
ALTER TABLE "Payment" ADD COLUMN "validityMonths" INTEGER;
ALTER TABLE "Generation" ADD COLUMN "creditAllocation" JSONB;
CREATE TABLE "CreditGrant" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "paymentId" TEXT NOT NULL,
 "packageId" TEXT NOT NULL, "remaining" INTEGER NOT NULL CHECK ("remaining" >= 0),
 "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CreditGrant_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "CreditGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CreditGrant_paymentId_key" ON "CreditGrant"("paymentId");
CREATE INDEX "CreditGrant_userId_expiresAt_idx" ON "CreditGrant"("userId", "expiresAt");
