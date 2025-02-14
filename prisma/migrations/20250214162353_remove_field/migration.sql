/*
  Warnings:

  - You are about to drop the column `entries_snapshot` on the `matchup_reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matchup_reports" DROP COLUMN "entries_snapshot";
