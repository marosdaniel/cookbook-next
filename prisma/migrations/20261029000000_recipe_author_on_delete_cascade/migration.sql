-- DropForeignKey
ALTER TABLE "recipes" DROP CONSTRAINT "recipes_createdBy_fkey";

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
