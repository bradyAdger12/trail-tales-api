/*
  Warnings:

  - You are about to drop the column `chance_to_find_items` on the `survival_day_options` table. All the data in the column will be lost.
  - You are about to drop the column `health_change_percentage` on the `survival_day_options` table. All the data in the column will be lost.
  - You are about to drop the column `item_gain_percentage` on the `survival_day_options` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."survival_day_options" DROP COLUMN "chance_to_find_items",
DROP COLUMN "health_change_percentage",
DROP COLUMN "item_gain_percentage",
ADD COLUMN     "food_gain_percentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "health_gain_percentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "water_gain_percentage" INTEGER NOT NULL DEFAULT 0;
