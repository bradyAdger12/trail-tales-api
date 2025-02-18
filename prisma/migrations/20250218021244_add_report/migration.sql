-- CreateTable
CREATE TABLE "matchup_reports" (
    "matchup_id" TEXT NOT NULL,
    "snapshot" JSONB,

    CONSTRAINT "matchup_reports_pkey" PRIMARY KEY ("matchup_id")
);

-- AddForeignKey
ALTER TABLE "matchup_reports" ADD CONSTRAINT "matchup_reports_matchup_id_fkey" FOREIGN KEY ("matchup_id") REFERENCES "matchups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
