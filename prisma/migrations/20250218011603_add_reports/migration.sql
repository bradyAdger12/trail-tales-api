-- CreateTable
CREATE TABLE "matchup_reports" (
    "matchup_id" TEXT NOT NULL,
    "snapshot" JSONB,

    CONSTRAINT "matchup_reports_pkey" PRIMARY KEY ("matchup_id")
);
