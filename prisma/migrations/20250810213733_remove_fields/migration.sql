/*
  Warnings:

  - You are about to drop the column `days_to_survive` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `hunger` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `thirst` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `health` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "days_to_survive",
DROP COLUMN "difficulty",
DROP COLUMN "hunger",
DROP COLUMN "thirst",
ADD COLUMN     "food" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "water" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "health" SET DEFAULT 80;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "health";
