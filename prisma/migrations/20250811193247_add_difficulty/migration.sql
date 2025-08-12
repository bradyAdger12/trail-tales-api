-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "threshold_pace_in_seconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weekly_distance_in_kilometers" INTEGER NOT NULL DEFAULT 0;
