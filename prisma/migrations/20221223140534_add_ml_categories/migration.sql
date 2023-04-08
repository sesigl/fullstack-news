-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "ml_categories" STRING[] DEFAULT ARRAY[]::STRING[];
