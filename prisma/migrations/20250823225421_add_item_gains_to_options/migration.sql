-- AlterTable
ALTER TABLE "survival_day_options" ADD COLUMN     "food_gain" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "water_gain" INTEGER NOT NULL DEFAULT 20;
