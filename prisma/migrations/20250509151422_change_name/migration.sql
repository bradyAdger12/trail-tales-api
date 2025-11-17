/*
  Warnings:

  - You are about to drop the column `days` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "days",
ADD COLUMN     "days_to_survive" INTEGER NOT NULL DEFAULT 7;
