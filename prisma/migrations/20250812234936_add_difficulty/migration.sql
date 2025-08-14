/*
  Warnings:

  - Added the required column `difficulty` to the `survival_day_options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "survival_day_options" ADD COLUMN     "difficulty" "Difficulty" NOT NULL;

-- DropEnum
DROP TYPE "ItemBenefit";
