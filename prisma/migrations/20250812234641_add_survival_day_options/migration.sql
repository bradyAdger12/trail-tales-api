/*
  Warnings:

  - You are about to drop the column `options` on the `survival_days` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "survival_days" DROP COLUMN "options";

-- CreateTable
CREATE TABLE "survival_day_options" (
    "id" TEXT NOT NULL,
    "survival_day_id" TEXT NOT NULL,
    "description" TEXT,
    "health_loss" INTEGER NOT NULL DEFAULT 0,
    "chance_to_find_items" INTEGER NOT NULL DEFAULT 0,
    "distance_in_kilometers" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survival_day_options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "survival_day_options" ADD CONSTRAINT "survival_day_options_survival_day_id_fkey" FOREIGN KEY ("survival_day_id") REFERENCES "survival_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
