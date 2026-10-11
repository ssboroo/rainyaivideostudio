-- Reconstruct past one-time paid monthly packages WITHOUT changing any credits.
-- This is append-only and idempotent. It never initiates a payment.
INSERT INTO "SubscriptionCycle"
 ("id","userId","paymentId","planId","amountMnt","credits","periodStart","periodEnd","createdAt")
SELECT 'legacy-cycle-' || p."id",p."userId",p."id",p."packageId",p."amountMnt",p."credits",
 COALESCE(p."paidAt",p."createdAt"),g."expiresAt",p."createdAt"
FROM "Payment" p
JOIN "CreditGrant" g ON g."paymentId"=p."id"
WHERE p."status"='PAID' AND p."validityMonths"=1
ON CONFLICT ("paymentId") DO NOTHING;

WITH latest AS (
 SELECT DISTINCT ON (c."userId") c."userId",c."planId",c."paymentId",c."periodStart",c."periodEnd"
 FROM "SubscriptionCycle" c
 ORDER BY c."userId",c."periodStart" DESC,c."paymentId" DESC
)
INSERT INTO "Subscription"
 ("id","userId","planId","status","renewalMode","startedAt","periodStart","periodEnd","lastPaymentId","updatedAt","createdAt")
SELECT 'legacy-sub-' || latest."userId",latest."userId",latest."planId",
 CASE WHEN latest."periodEnd">CURRENT_TIMESTAMP THEN 'ACTIVE' ELSE 'EXPIRED' END,
 'MANUAL',latest."periodStart",latest."periodStart",latest."periodEnd",latest."paymentId",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM latest
ON CONFLICT ("userId") DO NOTHING;
