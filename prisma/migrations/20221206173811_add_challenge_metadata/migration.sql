/*
  Warnings:

  - Added the required column `updatedAt` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Challenge" ADD COLUMN     "lastParsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Challenge" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
