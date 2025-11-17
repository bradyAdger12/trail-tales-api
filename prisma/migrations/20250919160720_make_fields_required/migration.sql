/*
  Warnings:

  - Made the column `max_duration_in_seconds` on table `games` required. This step will fail if there are existing NULL values in that column.
  - Made the column `min_duration_in_seconds` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."games" ALTER COLUMN "max_duration_in_seconds" SET NOT NULL,
ALTER COLUMN "min_duration_in_seconds" SET NOT NULL;
