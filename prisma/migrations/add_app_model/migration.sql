-- CreateTable App
CREATE TABLE "App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlContent" TEXT NOT NULL,
    "publicPath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "App_publicPath_key" ON "App"("publicPath");

-- CreateIndex  
CREATE INDEX "App_isActive_idx" ON "App"("isActive");

-- CreateIndex
CREATE INDEX "App_createdAt_idx" ON "App"("createdAt");
