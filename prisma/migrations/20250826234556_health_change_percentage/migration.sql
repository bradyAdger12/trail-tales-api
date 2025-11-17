/*
  Warnings:

  - You are about to drop the column `health_loss_percentage` on the `survival_day_options` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."survival_day_options" DROP COLUMN "health_loss_percentage",
ADD COLUMN     "health_change_percentage" INTEGER NOT NULL DEFAULT -10;
