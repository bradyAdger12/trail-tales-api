-- AlterTable
ALTER TABLE "games" ADD COLUMN     "daily_food_loss" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "daily_water_loss" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "max_distance_in_kilometers" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "min_distance_in_kilometers" INTEGER NOT NULL DEFAULT 1;
