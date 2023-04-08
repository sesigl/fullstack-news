-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favoriteCategories" STRING[] DEFAULT ARRAY[]::STRING[];
