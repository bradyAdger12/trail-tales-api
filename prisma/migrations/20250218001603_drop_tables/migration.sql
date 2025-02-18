/*
  Warnings:

  - You are about to drop the `matchup_report_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `matchup_reports` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `completed` to the `matchups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshot` to the `matchups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "matchup_report_users" DROP CONSTRAINT "matchup_report_users_matchup_report_id_fkey";

-- DropForeignKey
ALTER TABLE "matchup_report_users" DROP CONSTRAINT "matchup_report_users_user_id_fkey";

-- AlterTable
ALTER TABLE "matchups" ADD COLUMN     "completed" BOOLEAN NOT NULL,
ADD COLUMN     "snapshot" JSONB NOT NULL;

-- DropTable
DROP TABLE "matchup_report_users";

-- DropTable
DROP TABLE "matchup_reports";
