-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'time';

-- CreateTable
CREATE TABLE "matchup_reports" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "squad_one_id" TEXT NOT NULL,
    "squad_two_id" TEXT NOT NULL,
    "squad_one_snapshot" JSONB NOT NULL,
    "squad_two_snapshot" JSONB NOT NULL,
    "entries_snapshot" JSONB NOT NULL,

    CONSTRAINT "matchup_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchup_report_users" (
    "user_id" TEXT NOT NULL,
    "matchup_report_id" TEXT NOT NULL,

    CONSTRAINT "matchup_report_users_pkey" PRIMARY KEY ("user_id","matchup_report_id")
);

-- AddForeignKey
ALTER TABLE "matchup_reports" ADD CONSTRAINT "matchup_reports_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchup_report_users" ADD CONSTRAINT "matchup_report_users_matchup_report_id_fkey" FOREIGN KEY ("matchup_report_id") REFERENCES "matchup_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchup_report_users" ADD CONSTRAINT "matchup_report_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
