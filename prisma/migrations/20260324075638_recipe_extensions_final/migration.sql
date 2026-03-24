/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `recipes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "isOptional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "allergens" JSONB,
ADD COLUMN     "cookTimeMinutes" INTEGER,
ADD COLUMN     "costLevel" JSONB,
ADD COLUMN     "cuisine" JSONB,
ADD COLUMN     "dietaryFlags" JSONB,
ADD COLUMN     "equipment" JSONB,
ADD COLUMN     "prepTimeMinutes" INTEGER,
ADD COLUMN     "restTimeMinutes" INTEGER,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "servingUnit" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "socialImage" TEXT,
ADD COLUMN     "substitutions" TEXT,
ADD COLUMN     "tips" TEXT,
ADD COLUMN     "totalTimeMinutes" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");
