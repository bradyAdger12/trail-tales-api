/*
  Warnings:

  - You are about to drop the column `max_distance_in_kilometers` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `min_distance_in_kilometers` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."games" DROP COLUMN "max_distance_in_kilometers",
DROP COLUMN "min_distance_in_kilometers",
ADD COLUMN     "max_duration_in_seconds" INTEGER DEFAULT 30,
ADD COLUMN     "min_duration_in_seconds" INTEGER DEFAULT 20;

-- AlterTable
ALTER TABLE "public"."survival_day_options" ADD COLUMN     "duration_in_seconds" INTEGER NOT NULL DEFAULT 20;
