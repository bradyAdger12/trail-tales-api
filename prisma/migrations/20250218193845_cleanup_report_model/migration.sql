/*
  Warnings:

  - You are about to drop the column `snapshot` on the `matchups` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `squads` table. All the data in the column will be lost.
  - You are about to drop the `matchup_reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "matchup_reports" DROP CONSTRAINT "matchup_reports_matchup_id_fkey";

-- AlterTable
ALTER TABLE "matchups" DROP COLUMN "snapshot";

-- AlterTable
ALTER TABLE "squads" DROP COLUMN "is_public",
ADD COLUMN     "is_engaged" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "matchup_reports";
