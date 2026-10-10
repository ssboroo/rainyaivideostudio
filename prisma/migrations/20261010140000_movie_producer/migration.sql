CREATE TABLE "MovieProject" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "requestKey" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "targetSeconds" INTEGER NOT NULL,
  "aspectRatio" TEXT NOT NULL,
  "resolution" TEXT NOT NULL,
  "modelSlug" TEXT NOT NULL,
  "qualityProfile" TEXT NOT NULL DEFAULT 'cinematic',
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "maxCredits" INTEGER NOT NULL,
  "quotedCredits" INTEGER NOT NULL,
  "leaseUntil" TIMESTAMP(3),
  "lastError" TEXT,
  "aiQaApproved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MovieProject_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MovieScene" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "duration" INTEGER NOT NULL,
  "prompt" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "quotedCredits" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "generationId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "qaStatus" TEXT NOT NULL DEFAULT 'NOT_RUN',
  "qaReport" JSONB,
  "nextAttemptAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MovieScene_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MovieScene_projectId_number_key" ON "MovieScene" ("projectId","number");
CREATE INDEX "MovieProject_status_leaseUntil_createdAt_idx" ON "MovieProject" ("status","leaseUntil","createdAt");
CREATE UNIQUE INDEX "MovieProject_userId_requestKey_key" ON "MovieProject" ("userId", "requestKey");
CREATE INDEX "MovieProject_userId_createdAt_idx" ON "MovieProject" ("userId","createdAt");
CREATE INDEX "MovieScene_status_nextAttemptAt_idx" ON "MovieScene" ("status","nextAttemptAt");
ALTER TABLE "MovieProject" ADD CONSTRAINT "MovieProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovieScene" ADD CONSTRAINT "MovieScene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MovieProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "MovieGenerationAttempt" (
  "id" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "attempt" INTEGER NOT NULL,
  "generationId" TEXT NOT NULL,
  "quotedCredits" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MovieGenerationAttempt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MovieGenerationAttempt_sceneId_attempt_key" ON "MovieGenerationAttempt" ("sceneId", "attempt");
CREATE UNIQUE INDEX "MovieGenerationAttempt_generationId_key" ON "MovieGenerationAttempt" ("generationId");
ALTER TABLE "MovieGenerationAttempt" ADD CONSTRAINT "MovieGenerationAttempt_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "MovieScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;