-- DropForeignKey
ALTER TABLE "matchup_report_users" DROP CONSTRAINT "matchup_report_users_matchup_report_id_fkey";

-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "label" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "matchup_report_users" ADD CONSTRAINT "matchup_report_users_matchup_report_id_fkey" FOREIGN KEY ("matchup_report_id") REFERENCES "matchup_reports"("matchup_id") ON DELETE CASCADE ON UPDATE CASCADE;
