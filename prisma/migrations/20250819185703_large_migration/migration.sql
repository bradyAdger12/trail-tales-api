/*
  Warnings:

  - You are about to drop the column `threshold_pace_in_seconds` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `weekly_distance_in_kilometers` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `activity_id` on the `survival_day_options` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activity_id]` on the table `survival_days` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `difficulty` to the `games` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `difficulty` on the `survival_day_options` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GameDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "DayDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- DropForeignKey
ALTER TABLE "survival_day_options" DROP CONSTRAINT "survival_day_options_activity_id_fkey";

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "threshold_pace_in_seconds",
DROP COLUMN "weekly_distance_in_kilometers";

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "difficulty" "GameDifficulty" NOT NULL;

-- AlterTable
ALTER TABLE "survival_day_options" DROP COLUMN "activity_id",
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "DayDifficulty" NOT NULL;

-- AlterTable
ALTER TABLE "survival_days" ADD COLUMN     "activity_id" TEXT;

-- DropEnum
DROP TYPE "Difficulty";

-- CreateIndex
CREATE UNIQUE INDEX "survival_days_activity_id_key" ON "survival_days"("activity_id");

-- AddForeignKey
ALTER TABLE "survival_days" ADD CONSTRAINT "survival_days_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
