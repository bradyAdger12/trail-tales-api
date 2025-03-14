/*
  Warnings:

  - You are about to drop the column `food` on the `actions` table. All the data in the column will be lost.
  - You are about to drop the column `water` on the `actions` table. All the data in the column will be lost.
  - You are about to drop the column `hunger` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `thirst` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `character_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "actions" DROP COLUMN "food",
DROP COLUMN "water";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "hunger",
DROP COLUMN "thirst",
ALTER COLUMN "health" SET DEFAULT 100;

-- DropTable
DROP TABLE "character_templates";
