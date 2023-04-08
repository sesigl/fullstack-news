/*
  Warnings:

  - A unique constraint covering the columns `[displayName]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_displayName_key" ON "User"("displayName");
