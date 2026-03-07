-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'BLOGGER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-gb',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" JSONB,
    "labels" JSONB,
    "imgSrc" TEXT,
    "cookingTime" INTEGER NOT NULL,
    "difficultyLevel" JSONB,
    "servings" INTEGER NOT NULL,
    "youtubeLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_steps" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "preparation_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "ratingValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFavorites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFavorites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_recipeId_userId_key" ON "ratings"("recipeId", "userId");

-- CreateIndex
CREATE INDEX "_UserFavorites_B_index" ON "_UserFavorites"("B");

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_steps" ADD CONSTRAINT "preparation_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavorites" ADD CONSTRAINT "_UserFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavorites" ADD CONSTRAINT "_UserFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
