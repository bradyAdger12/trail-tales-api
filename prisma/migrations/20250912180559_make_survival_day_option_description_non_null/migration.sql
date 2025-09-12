/*
  Warnings:

  - Made the column `description` on table `survival_day_options` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."survival_day_options" ALTER COLUMN "description" SET NOT NULL;
