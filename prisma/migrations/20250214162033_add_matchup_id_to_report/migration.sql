/*
  Warnings:

  - Added the required column `matchup_id` to the `matchup_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "matchup_reports" ADD COLUMN     "matchup_id" TEXT NOT NULL;
