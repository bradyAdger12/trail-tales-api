/*
  Warnings:

  - The primary key for the `matchup_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "matchup_entries" DROP CONSTRAINT "matchup_entries_pkey",
ADD CONSTRAINT "matchup_entries_pkey" PRIMARY KEY ("user_id", "matchup_id");
