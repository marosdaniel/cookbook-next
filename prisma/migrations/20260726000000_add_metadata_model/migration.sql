-- CreateEnum
CREATE TYPE "MetadataType" AS ENUM ('CATEGORY', 'LABEL', 'DIFFICULTY_LEVEL', 'UNIT', 'CUISINE', 'SERVING_UNIT', 'DIET', 'ALLERGEN', 'EQUIPMENT', 'COST_LEVEL');

-- CreateTable
CREATE TABLE "metadata" (
    "id" TEXT NOT NULL,
    "type" "MetadataType" NOT NULL,
    "key" TEXT NOT NULL,
    "translationKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metadata_type_isActive_sortOrder_idx" ON "metadata"("type", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "metadata_type_key_key" ON "metadata"("type", "key");
