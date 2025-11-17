/*
  Warnings:

  - You are about to drop the column `food_gain` on the `survival_day_options` table. All the data in the column will be lost.
  - You are about to drop the column `water_gain` on the `survival_day_options` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "survival_day_options" DROP COLUMN "food_gain",
DROP COLUMN "water_gain",
ADD COLUMN     "item_gain_percentage" INTEGER NOT NULL DEFAULT 20;
