/*
  Warnings:

  - The primary key for the `matchup_reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `matchup_reports` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "matchup_report_users" DROP CONSTRAINT "matchup_report_users_matchup_report_id_fkey";

-- AlterTable
ALTER TABLE "matchup_reports" DROP CONSTRAINT "matchup_reports_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "matchup_reports_pkey" PRIMARY KEY ("matchup_id");

-- AddForeignKey
ALTER TABLE "matchup_report_users" ADD CONSTRAINT "matchup_report_users_matchup_report_id_fkey" FOREIGN KEY ("matchup_report_id") REFERENCES "matchup_reports"("matchup_id") ON DELETE RESTRICT ON UPDATE CASCADE;
