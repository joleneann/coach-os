-- CreateEnum
CREATE TYPE "WearableProvider" AS ENUM ('FITBIT', 'GOOGLE_FIT');

-- CreateTable
CREATE TABLE "WearableConnection" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "provider" "WearableProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "providerUserId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WearableConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearableData" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "provider" "WearableProvider" NOT NULL,
    "date" DATE NOT NULL,
    "dataType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WearableData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WearableConnection_clientId_provider_key" ON "WearableConnection"("clientId", "provider");

-- CreateIndex
CREATE INDEX "WearableData_clientId_date_idx" ON "WearableData"("clientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WearableData_clientId_provider_date_dataType_key" ON "WearableData"("clientId", "provider", "date", "dataType");

-- AddForeignKey
ALTER TABLE "WearableConnection" ADD CONSTRAINT "WearableConnection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearableData" ADD CONSTRAINT "WearableData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
