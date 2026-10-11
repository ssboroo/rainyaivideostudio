CREATE TABLE "Subscription" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "planId" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'ACTIVE',
 "renewalMode" TEXT NOT NULL DEFAULT 'MANUAL',
 "startedAt" TIMESTAMP(3) NOT NULL,
 "periodStart" TIMESTAMP(3) NOT NULL,
 "periodEnd" TIMESTAMP(3) NOT NULL,
 "lastPaymentId" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_lastPaymentId_key" ON "Subscription"("lastPaymentId");
CREATE INDEX "Subscription_status_periodEnd_idx" ON "Subscription"("status","periodEnd");
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey"
 FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "SubscriptionCycle" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "paymentId" TEXT NOT NULL,
 "planId" TEXT NOT NULL,
 "amountMnt" INTEGER NOT NULL,
 "credits" INTEGER NOT NULL,
 "periodStart" TIMESTAMP(3) NOT NULL,
 "periodEnd" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SubscriptionCycle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SubscriptionCycle_paymentId_key" ON "SubscriptionCycle"("paymentId");
CREATE INDEX "SubscriptionCycle_userId_createdAt_idx" ON "SubscriptionCycle"("userId","createdAt");
ALTER TABLE "SubscriptionCycle" ADD CONSTRAINT "SubscriptionCycle_userId_fkey"
 FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
