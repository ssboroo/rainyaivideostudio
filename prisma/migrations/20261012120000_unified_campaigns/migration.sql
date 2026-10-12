CREATE TABLE "StudioCampaign" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "paymentId" TEXT UNIQUE REFERENCES "Payment"("id"), "status" TEXT NOT NULL DEFAULT 'QUOTED',
 "payload" JSONB NOT NULL, "leaseUntil" TIMESTAMPTZ, "leaseToken" TEXT,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "StudioCampaign_queue" ON "StudioCampaign"("status","leaseUntil","createdAt");
CREATE INDEX "StudioCampaign_owner" ON "StudioCampaign"("userId","createdAt");
CREATE TABLE "StudioVoiceConnection" (
 "id" TEXT PRIMARY KEY, "refreshCipher" TEXT NOT NULL, "accessCipher" TEXT,
 "expiresAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
