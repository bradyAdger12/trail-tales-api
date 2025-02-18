/*
  Warnings:

  - You are about to drop the column `challenge_id` on the `matchup_reports` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `matchup_reports` table. All the data in the column will be lost.
  - You are about to drop the column `squad_one_id` on the `matchup_reports` table. All the data in the column will be lost.
  - You are about to drop the column `squad_one_snapshot` on the `matchup_reports` table. All the data in the column will be lost.
  - You are about to drop the column `squad_two_id` on the `matchup_reports` table. All the data in the column will be lost.
  - You are about to drop the column `squad_two_snapshot` on the `matchup_reports` table. All the data in the column will be lost.
  - Added the required column `matchup_snapshot` to the `matchup_reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "matchup_reports" DROP CONSTRAINT "matchup_reports_challenge_id_fkey";

-- AlterTable
ALTER TABLE "matchup_reports" DROP COLUMN "challenge_id",
DROP COLUMN "created_at",
DROP COLUMN "squad_one_id",
DROP COLUMN "squad_one_snapshot",
DROP COLUMN "squad_two_id",
DROP COLUMN "squad_two_snapshot",
ADD COLUMN     "matchup_snapshot" JSONB NOT NULL;
