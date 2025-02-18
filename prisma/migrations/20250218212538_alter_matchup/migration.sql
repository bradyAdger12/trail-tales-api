/*
  Warnings:

  - You are about to drop the column `type` on the `matchup_entries` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "matchups_squad_one_id_key";

-- DropIndex
DROP INDEX "matchups_squad_two_id_key";

-- AlterTable
ALTER TABLE "matchup_entries" DROP COLUMN "type",
ALTER COLUMN "activity_id" DROP NOT NULL;
