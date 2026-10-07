CREATE TABLE "DemoVideo" (
 "id" TEXT NOT NULL, "sourceMediaUrl" TEXT NOT NULL, "videoUrl" TEXT NOT NULL,
 "sourceUrl" TEXT NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL DEFAULT 'effects',
 "published" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "DemoVideo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DemoVideo_sourceMediaUrl_key" ON "DemoVideo"("sourceMediaUrl");
CREATE INDEX "DemoVideo_published_createdAt_idx" ON "DemoVideo"("published", "createdAt");
