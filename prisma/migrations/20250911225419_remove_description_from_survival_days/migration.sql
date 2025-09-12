/*
  Warnings:

  - You are about to drop the column `description` on the `survival_days` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."survival_day_options" ALTER COLUMN "food_gain_percentage" SET DEFAULT 5,
ALTER COLUMN "health_gain_percentage" SET DEFAULT 5,
ALTER COLUMN "water_gain_percentage" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "public"."survival_days" DROP COLUMN "description";
